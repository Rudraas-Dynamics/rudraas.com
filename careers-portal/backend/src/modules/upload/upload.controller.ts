import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role, RESUME_MAX_SIZE_BYTES } from '@/common/constants/enums';

@ApiTags('uploads')
@ApiBearerAuth('access-token')
@Controller({ path: 'uploads', version: '1' })
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Roles(Role.HR)
  @Post('job-attachment')
  @ApiOperation({ summary: 'Upload a job description attachment (HR only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: RESUME_MAX_SIZE_BYTES },
    }),
  )
  async uploadJobAttachment(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    const { url, fileName, mimeType, sizeBytes } =
      await this.uploadService.uploadJobAttachment(file);
    return { url, fileName, mimeType, sizeBytes };
  }
}
