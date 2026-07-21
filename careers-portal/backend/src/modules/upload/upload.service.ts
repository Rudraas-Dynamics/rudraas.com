import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { connect } from 'net';
import { extname } from 'path';
import { Readable } from 'stream';
import { nanoid } from 'nanoid';
import {
  RESUME_ALLOWED_EXTENSIONS,
  RESUME_ALLOWED_MIME_TYPES,
  RESUME_MAX_SIZE_BYTES,
} from '@/common/constants/enums';

const CLAMAV_TIMEOUT_MS = 15_000;
const CLAMAV_CHUNK_SIZE = 64 * 1024;
const JOB_ATTACHMENT_URL_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days (S3 SigV4 presign maximum)
const RESUME_DOWNLOAD_URL_TTL_SECONDS = 300; // 5 minutes

export interface UploadedResumeResult {
  key: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface UploadedJobAttachmentResult {
  /**
   * For-reference-only presigned link, valid for 7 days from upload time. Real reads
   * (e.g. viewing the attachment later in the admin UI) should call
   * `getPresignedDownloadUrl(key, fileName)` again to obtain a fresh, short-lived link.
   */
  url: string;
  key: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const storage = this.config.get('storage');
    this.bucket = storage.bucket;
    this.s3 = new S3Client({
      region: storage.region,
      endpoint: storage.endpoint || undefined,
      forcePathStyle: storage.forcePathStyle,
      credentials: {
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
      },
    });
  }

  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    const extension = extname(file.originalname).toLowerCase();

    if (!RESUME_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type "${file.mimetype}". Allowed types are PDF, DOC, and DOCX.`,
      );
    }
    if (!RESUME_ALLOWED_EXTENSIONS.includes(extension)) {
      throw new BadRequestException(
        `Unsupported file extension "${extension || '(none)'}". Allowed extensions are ${RESUME_ALLOWED_EXTENSIONS.join(', ')}.`,
      );
    }
    if (file.size > RESUME_MAX_SIZE_BYTES) {
      throw new BadRequestException(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is ${
          RESUME_MAX_SIZE_BYTES / (1024 * 1024)
        } MB.`,
      );
    }
  }

  async scanForViruses(buffer: Buffer): Promise<void> {
    const virusScan = this.config.get('virusScan');
    if (!virusScan?.enabled) {
      return;
    }

    const response = await this.runClamavInstream(
      buffer,
      virusScan.clamavHost,
      virusScan.clamavPort,
    );

    if (response.includes('FOUND')) {
      throw new BadRequestException('Resume failed a virus scan and was rejected');
    }
    if (response.includes('ERROR') || !response.includes('OK')) {
      throw new InternalServerErrorException('Virus scan failed, please try again');
    }
  }

  /**
   * Implements the clamd INSTREAM protocol over a raw TCP socket: a 'zINSTREAM\0' handshake,
   * followed by the payload as 4-byte big-endian length-prefixed chunks, terminated by a
   * zero-length chunk. The response is a null-terminated string containing OK/FOUND/ERROR.
   */
  private runClamavInstream(buffer: Buffer, host: string, port: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const socket = connect({ host, port });
      const chunks: Buffer[] = [];
      let settled = false;

      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        reject(error);
      };

      const succeed = (value: string) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      socket.setTimeout(CLAMAV_TIMEOUT_MS);
      socket.on('timeout', () => fail(new InternalServerErrorException('Virus scan timed out')));
      socket.on('error', (err) =>
        fail(new InternalServerErrorException(`Virus scan connection failed: ${err.message}`)),
      );

      socket.on('connect', () => {
        socket.write('zINSTREAM\0');

        for (let offset = 0; offset < buffer.length; offset += CLAMAV_CHUNK_SIZE) {
          const chunk = buffer.subarray(
            offset,
            Math.min(offset + CLAMAV_CHUNK_SIZE, buffer.length),
          );
          const sizeHeader = Buffer.alloc(4);
          sizeHeader.writeUInt32BE(chunk.length, 0);
          socket.write(sizeHeader);
          socket.write(chunk);
        }
        // Zero-length chunk terminates the stream per the clamd protocol.
        const terminator = Buffer.alloc(4);
        terminator.writeUInt32BE(0, 0);
        socket.write(terminator);
      });

      socket.on('data', (data: Buffer) => {
        chunks.push(data);
        const combined = Buffer.concat(chunks);
        if (combined.includes(0)) {
          succeed(combined.toString('utf8').replace(/\0/g, '').trim());
          socket.end();
        }
      });

      socket.on('close', () => {
        if (!settled) {
          succeed(Buffer.concat(chunks).toString('utf8').replace(/\0/g, '').trim());
        }
      });
    });
  }

  async uploadResume(file: Express.Multer.File): Promise<UploadedResumeResult> {
    this.validateFile(file);
    await this.scanForViruses(file.buffer);

    const key = this.buildObjectKey('resumes', file.originalname);
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  async uploadJobAttachment(file: Express.Multer.File): Promise<UploadedJobAttachmentResult> {
    this.validateFile(file);
    await this.scanForViruses(file.buffer);

    const key = this.buildObjectKey('job-attachments', file.originalname);
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${file.originalname}"`,
      }),
      { expiresIn: JOB_ATTACHMENT_URL_TTL_SECONDS },
    );

    return {
      url,
      key,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  async getPresignedDownloadUrl(key: string, downloadFileName: string): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${downloadFileName}"`,
      }),
      { expiresIn: RESUME_DOWNLOAD_URL_TTL_SECONDS },
    );
  }

  /** Used for streaming a resume object straight into a zip archive without buffering to disk. */
  async getObjectStream(key: string): Promise<Readable> {
    const result = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    return result.Body as Readable;
  }

  private buildObjectKey(prefix: string, originalName: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${prefix}/${year}/${month}/${nanoid(12)}-${this.sanitizeFileName(originalName)}`;
  }

  private sanitizeFileName(originalName: string): string {
    const extension = extname(originalName).replace(/[^a-zA-Z0-9.]/g, '');
    const base = originalName.slice(0, originalName.length - extname(originalName).length);
    const safeBase = base
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return `${safeBase || 'file'}${extension}`;
  }
}
