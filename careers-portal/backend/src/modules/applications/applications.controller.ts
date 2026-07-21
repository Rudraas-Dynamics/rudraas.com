import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { Types } from 'mongoose';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ManualCreateApplicationDto } from './dto/manual-create-application.dto';
import { ApplicationQueryDto } from './dto/application-query.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { BulkStatusUpdateDto } from './dto/bulk-status-update.dto';
import { BulkDownloadDto } from './dto/bulk-download.dto';
import { ApplicationExportFilterDto } from '@/modules/export/dto/export-filter.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthenticatedUser, CurrentUser } from '@/common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { Role, RESUME_MAX_SIZE_BYTES } from '@/common/constants/enums';

@ApiTags('applications')
@Controller({ path: 'applications', version: '1' })
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  @ApiOperation({ summary: 'Submit a job application (public career site)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: memoryStorage(),
      limits: { fileSize: RESUME_MAX_SIZE_BYTES },
    }),
  )
  async create(@Body() dto: CreateApplicationDto, @UploadedFile() file: Express.Multer.File) {
    return this.applicationsService.create(dto, file);
  }

  @Roles(Role.HR)
  @Post('manual')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Manually record a candidate application (HR only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: memoryStorage(),
      limits: { fileSize: RESUME_MAX_SIZE_BYTES },
    }),
  )
  async createManual(
    @Body() dto: ManualCreateApplicationDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.applicationsService.createManual(dto, file, currentUser);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Get('export')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Export filtered applications to an Excel workbook' })
  async exportApplications(
    @Query() filters: ApplicationExportFilterDto,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    const buffer = await this.applicationsService.exportToExcel(filters, currentUser);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="applications-export.xlsx"',
    });
    res.send(buffer);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Get('download-resume/:id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Redirect to a short-lived presigned resume download URL' })
  async downloadResume(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    const url = await this.applicationsService.getResumeDownloadUrl(id, currentUser);
    res.redirect(HttpStatus.FOUND, url);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Post('bulk/status')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Bulk-update the status of multiple applications' })
  async bulkUpdateStatus(
    @Body() dto: BulkStatusUpdateDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.applicationsService.bulkUpdateStatus(dto, currentUser);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Post('bulk/download')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Download resumes for multiple applications as a zip archive' })
  async bulkDownload(
    @Body() dto: BulkDownloadDto,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    const { stream, fileName } = await this.applicationsService.bulkDownloadResumesZip(
      dto,
      currentUser,
    );
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    stream.pipe(res);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List applications with filters and pagination' })
  async findAll(@Query() query: ApplicationQueryDto) {
    return this.applicationsService.findAll(query);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get application details' })
  async findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.applicationsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change an application status' })
  async updateStatus(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateApplicationStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.applicationsService.updateStatus(id, dto, currentUser);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Post(':id/notes')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add an internal note to an application' })
  async addNote(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: AddNoteDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.applicationsService.addNote(id, dto, currentUser);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Edit editable candidate fields' })
  async update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateApplicationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.applicationsService.update(id, dto, currentUser);
  }

  // Admin-only: neither role list explicitly grants delete, and permanently destroying
  // candidate records is a higher-risk operation than any status/edit action HR performs.
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Permanently delete an application (Admin only)' })
  async remove(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    await this.applicationsService.remove(id, currentUser);
    return { message: 'Application deleted successfully' };
  }
}
