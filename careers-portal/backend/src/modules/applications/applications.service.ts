import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { PassThrough, Readable } from 'stream';
import archiver from 'archiver';
import { Candidate, CandidateDocument } from '@/database/schemas/candidate.schema';
import type {
  ActivityLogEntry,
  InternalNote,
  StatusHistoryEntry,
} from '@/database/schemas/candidate.schema';
import { Job, JobDocument } from '@/database/schemas/job.schema';
import { AuditLogService } from '@/modules/audit-log/audit-log.service';
import { UploadService } from '@/modules/upload/upload.service';
import { EmailService } from '@/modules/email/email.service';
import { ExportService } from '@/modules/export/export.service';
import { ApplicationExportFilterDto } from '@/modules/export/dto/export-filter.dto';
import { AuthenticatedUser } from '@/common/decorators/current-user.decorator';
import { stripHtml } from '@/common/utils/sanitize-html.util';
import { buildPaginationMeta, Paginated } from '@/common/dto/pagination-query.dto';
import {
  AuditAction,
  AuditEntityType,
  ApplicationStatus,
  CandidateSource,
} from '@/common/constants/enums';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ManualCreateApplicationDto } from './dto/manual-create-application.dto';
import { ApplicationQueryDto } from './dto/application-query.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { BulkStatusUpdateDto } from './dto/bulk-status-update.dto';
import { BulkDownloadDto } from './dto/bulk-download.dto';

const ALLOWED_SORT_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'experienceYears',
  'name',
  'status',
]);

interface CreateApplicationParams {
  dto: CreateApplicationDto;
  file: Express.Multer.File | undefined;
  createdBy: AuthenticatedUser | null;
  enforceOpenJob: boolean;
  source: CandidateSource;
  sourceDetail: string | null;
}

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectModel(Candidate.name) private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    private readonly auditLogService: AuditLogService,
    private readonly uploadService: UploadService,
    private readonly emailService: EmailService,
    private readonly exportService: ExportService,
  ) {}

  async create(
    dto: CreateApplicationDto,
    file: Express.Multer.File | undefined,
  ): Promise<CandidateDocument> {
    return this.createApplication({
      dto,
      file,
      createdBy: null,
      enforceOpenJob: true,
      source: dto.source ?? CandidateSource.WEBSITE,
      sourceDetail: null,
    });
  }

  async createManual(
    dto: ManualCreateApplicationDto,
    file: Express.Multer.File | undefined,
    currentUser: AuthenticatedUser,
  ): Promise<CandidateDocument> {
    return this.createApplication({
      dto,
      file,
      createdBy: currentUser,
      enforceOpenJob: false,
      source: dto.source,
      sourceDetail: dto.sourceDetail ?? null,
    });
  }

  private async createApplication(params: CreateApplicationParams): Promise<CandidateDocument> {
    const { dto, file, createdBy, enforceOpenJob, source, sourceDetail } = params;

    const job = await this.jobModel.findById(dto.openingId);
    if (!job) {
      throw new NotFoundException('Job opening not found');
    }
    if (enforceOpenJob && (!job.isPublished || job.isClosed || job.isArchived)) {
      throw new BadRequestException('This opening is not currently accepting applications');
    }

    const email = dto.email.toLowerCase().trim();
    const duplicate = await this.candidateModel.exists({ opening: job._id, email });
    if (duplicate) {
      throw new ConflictException(
        'An application already exists for this email against this opening',
      );
    }

    if (!file) {
      throw new BadRequestException('resume is required');
    }
    const resume = await this.uploadService.uploadResume(file);

    // Pre-generate the id so `resumeUrl` (the stable download endpoint path) can be set on
    // the single insert, avoiding a second write just to patch it in afterwards.
    const candidateId = new Types.ObjectId();
    const resumeUrl = `/api/v1/applications/download-resume/${candidateId.toString()}`;
    const performedBy = createdBy ? new Types.ObjectId(createdBy.userId) : null;

    const candidate = await this.candidateModel.create({
      _id: candidateId,
      opening: job._id,
      name: stripHtml(dto.name),
      email,
      mobile: dto.mobile,
      linkedin: dto.linkedin ?? null,
      portfolio: dto.portfolio ?? null,
      currentCompany: dto.currentCompany ? stripHtml(dto.currentCompany) : null,
      designation: dto.designation ? stripHtml(dto.designation) : null,
      experienceYears: dto.experienceYears,
      qualification: dto.qualification,
      currentCtc: dto.currentCtc ?? null,
      expectedCtc: dto.expectedCtc,
      noticePeriod: dto.noticePeriod,
      currentLocation: dto.currentLocation,
      preferredLocation: dto.preferredLocation,
      resumeUrl,
      resumeStorageKey: resume.key,
      resumeFileName: resume.fileName,
      resumeMimeType: resume.mimeType,
      resumeSizeBytes: resume.sizeBytes,
      introduction: dto.introduction ? stripHtml(dto.introduction) : null,
      source,
      sourceDetail: sourceDetail ? stripHtml(sourceDetail) : null,
      status: ApplicationStatus.APPLIED,
      statusHistory: [
        { status: ApplicationStatus.APPLIED, changedBy: null, remark: 'Application submitted' },
      ],
      activityLog: [{ action: 'APPLICATION_SUBMITTED', performedBy, metadata: null }],
      consentGiven: dto.consentGiven ?? true,
      createdBy: performedBy,
    });

    await Promise.all([
      this.emailService.sendCandidateAcknowledgement(candidate.email, {
        candidateName: candidate.name,
        jobTitle: job.title,
        department: job.department,
      }),
      this.emailService.sendHrNewApplicationAlert({
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        jobTitle: job.title,
        experienceYears: candidate.experienceYears,
        source: candidate.source,
        applicationId: candidate._id.toString(),
      }),
    ]);

    await this.auditLogService.record({
      actor: createdBy ? { userId: createdBy.userId, email: createdBy.email } : null,
      action: AuditAction.CREATE,
      entityType: AuditEntityType.APPLICATION,
      entityId: candidate._id,
      after: {
        opening: job._id.toString(),
        name: candidate.name,
        email: candidate.email,
        status: candidate.status,
        source: candidate.source,
      },
    });

    return candidate;
  }

  async findAll(query: ApplicationQueryDto): Promise<Paginated<Candidate>> {
    const filter: FilterQuery<CandidateDocument> = {};

    if (query.opening) filter.opening = new Types.ObjectId(query.opening);
    if (query.status) filter.status = query.status;
    if (query.source) filter.source = query.source;
    if (query.currentLocation) {
      filter.currentLocation = new RegExp(escapeRegExp(query.currentLocation), 'i');
    }
    if (query.preferredLocation) {
      filter.preferredLocation = new RegExp(escapeRegExp(query.preferredLocation), 'i');
    }
    if (query.experienceMin !== undefined || query.experienceMax !== undefined) {
      filter.experienceYears = {
        ...(query.experienceMin !== undefined ? { $gte: query.experienceMin } : {}),
        ...(query.experienceMax !== undefined ? { $lte: query.experienceMax } : {}),
      };
    }
    if (query.dateFrom || query.dateTo) {
      filter.createdAt = {
        ...(query.dateFrom ? { $gte: query.dateFrom } : {}),
        ...(query.dateTo ? { $lte: query.dateTo } : {}),
      };
    }
    if (query.search) {
      const regex = new RegExp(escapeRegExp(query.search), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { currentCompany: regex }];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortField =
      query.sortBy && ALLOWED_SORT_FIELDS.has(query.sortBy) ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.candidateModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('opening', 'title department location')
        .lean(),
      this.candidateModel.countDocuments(filter),
    ]);

    return { data: data as unknown as Candidate[], meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: Types.ObjectId): Promise<CandidateDocument> {
    const candidate = await this.candidateModel
      .findById(id)
      .populate('opening', 'title department location employmentType')
      .populate('internalNotes.addedBy', 'name email')
      .populate('statusHistory.changedBy', 'name email')
      .populate('activityLog.performedBy', 'name email');

    if (!candidate) {
      throw new NotFoundException('Application not found');
    }
    return candidate;
  }

  async updateStatus(
    id: Types.ObjectId,
    dto: UpdateApplicationStatusDto,
    currentUser: AuthenticatedUser,
  ): Promise<CandidateDocument> {
    const candidate = await this.candidateModel.findById(id);
    if (!candidate) {
      throw new NotFoundException('Application not found');
    }

    const previousStatus = candidate.status;
    const changedBy = new Types.ObjectId(currentUser.userId);

    // _id/changedAt/createdAt are auto-populated by Mongoose on subdocument push; the schema's
    // TS classes model the post-save shape rather than the input shape.
    candidate.statusHistory.push({
      status: dto.status,
      changedBy,
      remark: dto.remark ?? null,
    } as unknown as StatusHistoryEntry);
    candidate.activityLog.push({
      action: 'STATUS_CHANGED',
      performedBy: changedBy,
      metadata: { from: previousStatus, to: dto.status },
    } as unknown as ActivityLogEntry);
    candidate.status = dto.status;
    candidate.updatedBy = changedBy;
    await candidate.save();

    await this.auditLogService.record({
      actor: { userId: currentUser.userId, email: currentUser.email },
      action: AuditAction.STATUS_CHANGE,
      entityType: AuditEntityType.APPLICATION,
      entityId: candidate._id,
      before: { status: previousStatus },
      after: { status: dto.status },
    });

    return candidate;
  }

  async bulkUpdateStatus(
    dto: BulkStatusUpdateDto,
    currentUser: AuthenticatedUser,
  ): Promise<{ updated: number }> {
    const changedBy = new Types.ObjectId(currentUser.userId);
    const objectIds = dto.ids.map((id) => new Types.ObjectId(id));

    const candidates = await this.candidateModel.find({ _id: { $in: objectIds } });

    await Promise.all(
      candidates.map((candidate) => {
        const previousStatus = candidate.status;
        candidate.statusHistory.push({
          status: dto.status,
          changedBy,
          remark: dto.remark ?? null,
        } as unknown as StatusHistoryEntry);
        candidate.activityLog.push({
          action: 'STATUS_CHANGED',
          performedBy: changedBy,
          metadata: { from: previousStatus, to: dto.status },
        } as unknown as ActivityLogEntry);
        candidate.status = dto.status;
        candidate.updatedBy = changedBy;
        return candidate.save();
      }),
    );

    await this.auditLogService.record({
      actor: { userId: currentUser.userId, email: currentUser.email },
      action: AuditAction.BULK_STATUS_CHANGE,
      entityType: AuditEntityType.APPLICATION,
      after: { ids: dto.ids, status: dto.status },
    });

    return { updated: candidates.length };
  }

  async update(
    id: Types.ObjectId,
    dto: UpdateApplicationDto,
    currentUser: AuthenticatedUser,
  ): Promise<CandidateDocument> {
    const candidate = await this.candidateModel.findById(id);
    if (!candidate) {
      throw new NotFoundException('Application not found');
    }

    const freeTextFields = new Set(['name', 'currentCompany', 'designation']);
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    const candidateRecord = candidate as unknown as Record<string, unknown>;

    for (const [key, value] of Object.entries(dto)) {
      if (value === undefined) continue;
      const nextValue =
        freeTextFields.has(key) && typeof value === 'string' ? stripHtml(value) : value;
      if (candidateRecord[key] !== nextValue) {
        before[key] = candidateRecord[key];
        after[key] = nextValue;
        candidateRecord[key] = nextValue;
      }
    }

    if (Object.keys(after).length === 0) {
      return candidate;
    }

    candidate.updatedBy = new Types.ObjectId(currentUser.userId);
    await candidate.save();

    await this.auditLogService.record({
      actor: { userId: currentUser.userId, email: currentUser.email },
      action: AuditAction.UPDATE,
      entityType: AuditEntityType.APPLICATION,
      entityId: candidate._id,
      before,
      after,
    });

    return candidate;
  }

  async addNote(
    id: Types.ObjectId,
    dto: AddNoteDto,
    currentUser: AuthenticatedUser,
  ): Promise<CandidateDocument> {
    const candidate = await this.candidateModel.findById(id);
    if (!candidate) {
      throw new NotFoundException('Application not found');
    }

    const addedBy = new Types.ObjectId(currentUser.userId);
    candidate.internalNotes.push({ note: stripHtml(dto.note), addedBy } as unknown as InternalNote);
    candidate.activityLog.push({
      action: 'NOTE_ADDED',
      performedBy: addedBy,
      metadata: null,
    } as unknown as ActivityLogEntry);
    await candidate.save();

    // The activityLog subdocument is itself the audit trail for note-taking — there is no
    // dedicated global AuditAction for this, and forcing one in would be redundant.
    return candidate;
  }

  async remove(id: Types.ObjectId, currentUser: AuthenticatedUser): Promise<void> {
    const candidate = await this.candidateModel.findById(id);
    if (!candidate) {
      throw new NotFoundException('Application not found');
    }

    await this.auditLogService.record({
      actor: { userId: currentUser.userId, email: currentUser.email },
      action: AuditAction.DELETE,
      entityType: AuditEntityType.APPLICATION,
      entityId: candidate._id,
      before: {
        name: candidate.name,
        email: candidate.email,
        opening: candidate.opening.toString(),
        status: candidate.status,
      },
    });

    await candidate.deleteOne();
  }

  async getResumeDownloadUrl(id: Types.ObjectId, currentUser: AuthenticatedUser): Promise<string> {
    const candidate = await this.candidateModel.findById(id).select('+resumeStorageKey');
    if (!candidate) {
      throw new NotFoundException('Application not found');
    }

    const url = await this.uploadService.getPresignedDownloadUrl(
      candidate.resumeStorageKey,
      candidate.resumeFileName,
    );

    await this.auditLogService.record({
      actor: { userId: currentUser.userId, email: currentUser.email },
      action: AuditAction.RESUME_DOWNLOAD,
      entityType: AuditEntityType.APPLICATION,
      entityId: candidate._id,
    });

    return url;
  }

  async bulkDownloadResumesZip(
    dto: BulkDownloadDto,
    currentUser: AuthenticatedUser,
  ): Promise<{ stream: Readable; fileName: string }> {
    const objectIds = dto.ids.map((id) => new Types.ObjectId(id));
    const candidates = await this.candidateModel
      .find({ _id: { $in: objectIds } })
      .select('+resumeStorageKey name resumeFileName');

    if (candidates.length === 0) {
      throw new NotFoundException('No matching applications found');
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const output = new PassThrough();
    archive.on('warning', (err) => this.logger.warn(`Zip archive warning: ${err.message}`));
    archive.on('error', (err) => output.destroy(err));
    archive.pipe(output);

    void (async () => {
      try {
        for (const candidate of candidates) {
          const objectStream = await this.uploadService.getObjectStream(candidate.resumeStorageKey);
          archive.append(objectStream, {
            name: `${sanitizeZipEntryName(candidate.name)}-${candidate.resumeFileName}`,
          });
        }
        await archive.finalize();
      } catch (error) {
        output.destroy(error as Error);
      }
    })();

    await this.auditLogService.record({
      actor: { userId: currentUser.userId, email: currentUser.email },
      action: AuditAction.RESUME_DOWNLOAD,
      entityType: AuditEntityType.APPLICATION,
      after: { ids: dto.ids, bulk: true },
    });

    return { stream: output, fileName: 'resumes.zip' };
  }

  async exportToExcel(
    filters: ApplicationExportFilterDto,
    currentUser: AuthenticatedUser,
  ): Promise<Buffer> {
    const buffer = await this.exportService.generateApplicationsExcel(filters);

    await this.auditLogService.record({
      actor: { userId: currentUser.userId, email: currentUser.email },
      action: AuditAction.EXPORT,
      entityType: AuditEntityType.APPLICATION,
      after: { filters: { ...filters } },
    });

    return buffer;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeZipEntryName(name: string): string {
  return name.replace(/[^a-zA-Z0-9 _-]+/g, '').trim() || 'candidate';
}
