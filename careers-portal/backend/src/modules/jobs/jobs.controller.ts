import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { PublicJobQueryDto } from './dto/public-job-query.dto';
import { SetUrgentDto } from './dto/set-urgent.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '@/common/decorators/current-user.decorator';
import { Role } from '@/common/constants/enums';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';

@ApiTags('jobs')
@Controller({ path: 'jobs', version: '1' })
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'List published, open job openings (public career site)' })
  findPublished(@Query() query: PublicJobQueryDto) {
    return this.jobsService.findPublished(query);
  }

  // Declared before `public/:slug` so the literal `filters` segment is matched instead of
  // being captured as a slug value.
  @Get('public/filters')
  @Public()
  @ApiOperation({ summary: 'Distinct department/location/employment-type values for the public filter UI' })
  getPublicFilters() {
    return this.jobsService.getPublicFilters();
  }

  @Get('public/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a single published job opening by slug (public job-details page)' })
  @ApiParam({ name: 'slug' })
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.jobsService.findPublishedBySlug(slug);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List job openings for the HR/Admin backoffice' })
  findAllForBackoffice(@Query() query: JobQueryDto) {
    return this.jobsService.findAllForBackoffice(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a single job opening by id (HR/Admin backoffice)' })
  @ApiParam({ name: 'id' })
  findOneForBackoffice(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.jobsService.findOneForBackoffice(id);
  }

  @Post()
  @Roles(Role.HR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new job opening as an unpublished draft (HR only)' })
  create(@Body() dto: CreateJobDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.jobsService.create(dto, currentUser);
  }

  @Patch(':id')
  @Roles(Role.HR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a job opening (HR only)' })
  @ApiParam({ name: 'id' })
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateJobDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.jobsService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles(Role.HR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a job opening (HR only); blocked if any candidate has applied' })
  @ApiParam({ name: 'id' })
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.jobsService.remove(id, currentUser);
  }

  @Patch(':id/publish')
  @Roles(Role.HR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Publish a job opening to the public career site (HR only)' })
  @ApiParam({ name: 'id' })
  publish(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.jobsService.publish(id, currentUser);
  }

  @Patch(':id/close')
  @Roles(Role.HR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Close a job opening to new applications (HR only)' })
  @ApiParam({ name: 'id' })
  close(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.jobsService.close(id, currentUser);
  }

  @Patch(':id/archive')
  @Roles(Role.HR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Archive a job opening, retiring it from the public career site (HR only)' })
  @ApiParam({ name: 'id' })
  archive(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.jobsService.archive(id, currentUser);
  }

  @Patch(':id/urgent')
  @Roles(Role.HR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mark or unmark a job opening as urgent hiring (HR only)' })
  @ApiParam({ name: 'id' })
  setUrgent(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: SetUrgentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.jobsService.setUrgent(id, dto, currentUser);
  }

  @Post(':id/duplicate')
  @Roles(Role.HR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Duplicate a job opening as a new unpublished draft (HR only)' })
  @ApiParam({ name: 'id' })
  duplicate(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.jobsService.duplicate(id, currentUser);
  }
}
