import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { Job, JobDocument } from '@/database/schemas/job.schema';
import { Candidate, CandidateDocument } from '@/database/schemas/candidate.schema';
import { AuditAction, AuditEntityType, EmploymentType } from '@/common/constants/enums';
import { AuditLogService } from '@/modules/audit-log/audit-log.service';
import { EmailService } from '@/modules/email/email.service';
import { sanitizeRichText } from '@/common/utils/sanitize-html.util';
import { AuthenticatedUser } from '@/common/decorators/current-user.decorator';
import { buildPaginationMeta, Paginated } from '@/common/dto/pagination-query.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { PublicJobQueryDto } from './dto/public-job-query.dto';
import { SetUrgentDto } from './dto/set-urgent.dto';

export interface PublicFilterOptions {
  departments: string[];
  locations: string[];
  employmentTypes: string[];
}

const PUBLIC_FIELD_EXCLUSIONS = '-createdBy -updatedBy -duplicatedFrom';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Candidate.name) private readonly candidateModel: Model<CandidateDocument>,
    private readonly auditLogService: AuditLogService,
    private readonly emailService: EmailService,
  ) {}

  private async generateUniqueSlug(source: string): Promise<string> {
    const base = slugify(source, { lower: true, strict: true });
    let candidate = base;
    while (await this.jobModel.exists({ slug: candidate })) {
      candidate = `${base}-${nanoid(6).toLowerCase()}`;
    }
    return candidate;
  }

  private assertValidExperienceRange(minYears: number, maxYears: number): void {
    if (maxYears < minYears) {
      throw new BadRequestException(
        'experience.maxYears must be greater than or equal to experience.minYears',
      );
    }
  }

  private actorRef(currentUser: AuthenticatedUser): { userId: string; email: string } {
    return { userId: currentUser.userId, email: currentUser.email };
  }

  async create(dto: CreateJobDto, currentUser: AuthenticatedUser): Promise<JobDocument> {
    this.assertValidExperienceRange(dto.experience.minYears, dto.experience.maxYears);
    const slug = await this.generateUniqueSlug(dto.title);

    const job = await this.jobModel.create({
      title: dto.title,
      slug,
      department: dto.department,
      location: dto.location,
      employmentType: dto.employmentType,
      experience: dto.experience,
      skills: dto.skills,
      description: sanitizeRichText(dto.description),
      responsibilities: sanitizeRichText(dto.responsibilities),
      requirements: sanitizeRichText(dto.requirements),
      budget: dto.budget ?? null,
      jdAttachment: dto.jdAttachment ?? null,
      openingDate: dto.openingDate ? new Date(dto.openingDate) : null,
      closingDate: dto.closingDate ? new Date(dto.closingDate) : null,
      // Every new opening starts as an unpublished draft regardless of what the client sends.
      isPublished: false,
      isClosed: false,
      isArchived: false,
      isUrgent: false,
      createdBy: new Types.ObjectId(currentUser.userId),
      updatedBy: null,
      duplicatedFrom: null,
    });

    await this.auditLogService.record({
      actor: this.actorRef(currentUser),
      action: AuditAction.CREATE,
      entityType: AuditEntityType.JOB,
      entityId: job._id,
      after: job.toObject(),
    });

    return job;
  }

  async findAllForBackoffice(query: JobQueryDto): Promise<Paginated<Job>> {
    const filter: FilterQuery<JobDocument> = {};

    if (query.department) filter.department = { $regex: query.department, $options: 'i' };
    if (query.location) filter.location = { $regex: query.location, $options: 'i' };
    if (query.employmentType) filter.employmentType = query.employmentType;
    if (query.isPublished !== undefined) filter.isPublished = query.isPublished;
    if (query.isClosed !== undefined) filter.isClosed = query.isClosed;
    if (query.isArchived !== undefined) filter.isArchived = query.isArchived;
    if (query.isUrgent !== undefined) filter.isUrgent = query.isUrgent;

    if (query.search) {
      const regex = this.buildSearchRegex(query.search);
      filter.$or = [
        { title: regex },
        { department: regex },
        { location: regex },
        { skills: regex },
      ];
    }

    const sort = this.buildSort(query.sortBy, query.sortOrder, { createdAt: -1 });
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.jobModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean(),
      this.jobModel.countDocuments(filter),
    ]);

    return {
      data: data as unknown as Job[],
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOneForBackoffice(id: Types.ObjectId): Promise<JobDocument> {
    const job = await this.jobModel
      .findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    if (!job) throw new NotFoundException('Job opening not found');
    return job;
  }

  async findPublished(query: PublicJobQueryDto): Promise<Paginated<Partial<Job>>> {
    const filter: FilterQuery<JobDocument> = {
      isPublished: true,
      isClosed: false,
      isArchived: false,
    };

    if (query.department) filter.department = { $regex: query.department, $options: 'i' };
    if (query.location) filter.location = { $regex: query.location, $options: 'i' };
    if (query.employmentType) filter.employmentType = query.employmentType;

    if (query.search) {
      const regex = this.buildSearchRegex(query.search);
      filter.$or = [
        { title: regex },
        { department: regex },
        { location: regex },
        { skills: regex },
      ];
    }

    // Range-overlap: a job qualifies if the candidate's stated band intersects the job's band.
    if (query.experienceMin !== undefined) {
      filter['experience.maxYears'] = { $gte: query.experienceMin };
    }
    if (query.experienceMax !== undefined) {
      filter['experience.minYears'] = { $lte: query.experienceMax };
    }

    const sort = this.buildSort(query.sortBy, query.sortOrder, { isUrgent: -1, createdAt: -1 });
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.jobModel
        .find(filter)
        .select(PUBLIC_FIELD_EXCLUSIONS)
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .lean(),
      this.jobModel.countDocuments(filter),
    ]);

    return { data, meta: buildPaginationMeta(query.page, query.limit, total) };
  }

  async findPublishedBySlug(slug: string): Promise<Partial<Job>> {
    const job = await this.jobModel
      .findOne({ slug: slug.toLowerCase(), isPublished: true, isClosed: false, isArchived: false })
      .select(PUBLIC_FIELD_EXCLUSIONS)
      .lean();
    if (!job) throw new NotFoundException('Job opening not found');
    return job;
  }

  async getPublicFilters(): Promise<PublicFilterOptions> {
    const activeFilter: FilterQuery<JobDocument> = {
      isPublished: true,
      isClosed: false,
      isArchived: false,
    };
    const [departments, locations] = await Promise.all([
      this.jobModel.distinct('department', activeFilter),
      this.jobModel.distinct('location', activeFilter),
    ]);

    return {
      departments: (departments as unknown as string[]).sort(),
      locations: (locations as unknown as string[]).sort(),
      employmentTypes: Object.values(EmploymentType),
    };
  }

  async update(
    id: Types.ObjectId,
    dto: UpdateJobDto,
    currentUser: AuthenticatedUser,
  ): Promise<JobDocument> {
    const job = await this.jobModel.findById(id);
    if (!job) throw new NotFoundException('Job opening not found');

    if (dto.experience !== undefined) {
      const minYears = dto.experience.minYears ?? job.experience.minYears;
      const maxYears = dto.experience.maxYears ?? job.experience.maxYears;
      this.assertValidExperienceRange(minYears, maxYears);
      dto.experience.minYears = minYears;
      dto.experience.maxYears = maxYears;
    }

    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    const doc = job as unknown as Record<string, unknown>;

    const applyChange = (field: string, newValue: unknown): void => {
      if (JSON.stringify(doc[field]) !== JSON.stringify(newValue)) {
        before[field] = doc[field];
        after[field] = newValue;
      }
      doc[field] = newValue;
    };

    if (dto.title !== undefined) applyChange('title', dto.title);
    if (dto.department !== undefined) applyChange('department', dto.department);
    if (dto.location !== undefined) applyChange('location', dto.location);
    if (dto.employmentType !== undefined) applyChange('employmentType', dto.employmentType);
    if (dto.experience !== undefined) applyChange('experience', dto.experience);
    if (dto.skills !== undefined) applyChange('skills', dto.skills);
    if (dto.description !== undefined)
      applyChange('description', sanitizeRichText(dto.description));
    if (dto.responsibilities !== undefined) {
      applyChange('responsibilities', sanitizeRichText(dto.responsibilities));
    }
    if (dto.requirements !== undefined)
      applyChange('requirements', sanitizeRichText(dto.requirements));
    if (dto.budget !== undefined) applyChange('budget', dto.budget);
    if (dto.jdAttachment !== undefined) applyChange('jdAttachment', dto.jdAttachment);
    if (dto.openingDate !== undefined) applyChange('openingDate', new Date(dto.openingDate));
    if (dto.closingDate !== undefined) applyChange('closingDate', new Date(dto.closingDate));

    job.updatedBy = new Types.ObjectId(currentUser.userId);
    await job.save();

    if (Object.keys(after).length > 0) {
      await this.auditLogService.record({
        actor: this.actorRef(currentUser),
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.JOB,
        entityId: job._id,
        before,
        after,
      });
    }

    return job;
  }

  async remove(id: Types.ObjectId, currentUser: AuthenticatedUser): Promise<void> {
    const job = await this.jobModel.findById(id);
    if (!job) throw new NotFoundException('Job opening not found');

    const hasApplications = await this.candidateModel.exists({ opening: job._id });
    if (hasApplications) {
      throw new ConflictException(
        'This opening has candidate applications and cannot be deleted — archive it instead.',
      );
    }

    const before = job.toObject();
    await this.jobModel.deleteOne({ _id: job._id });

    await this.auditLogService.record({
      actor: this.actorRef(currentUser),
      action: AuditAction.DELETE,
      entityType: AuditEntityType.JOB,
      entityId: job._id,
      before,
    });
  }

  async publish(id: Types.ObjectId, currentUser: AuthenticatedUser): Promise<JobDocument> {
    const job = await this.jobModel.findById(id);
    if (!job) throw new NotFoundException('Job opening not found');

    job.isPublished = true;
    job.openingDate = job.openingDate ?? new Date();
    job.updatedBy = new Types.ObjectId(currentUser.userId);
    await job.save();

    await this.auditLogService.record({
      actor: this.actorRef(currentUser),
      action: AuditAction.PUBLISH,
      entityType: AuditEntityType.JOB,
      entityId: job._id,
    });

    return job;
  }

  async close(id: Types.ObjectId, currentUser: AuthenticatedUser): Promise<JobDocument> {
    const job = await this.jobModel.findById(id);
    if (!job) throw new NotFoundException('Job opening not found');

    job.isClosed = true;
    job.closingDate = new Date();
    job.updatedBy = new Types.ObjectId(currentUser.userId);
    await job.save();

    await this.auditLogService.record({
      actor: this.actorRef(currentUser),
      action: AuditAction.CLOSE,
      entityType: AuditEntityType.JOB,
      entityId: job._id,
    });

    return job;
  }

  async archive(id: Types.ObjectId, currentUser: AuthenticatedUser): Promise<JobDocument> {
    const job = await this.jobModel.findById(id);
    if (!job) throw new NotFoundException('Job opening not found');

    job.isArchived = true;
    // Archiving retires the listing entirely — it must not remain visible on the public board.
    job.isPublished = false;
    job.updatedBy = new Types.ObjectId(currentUser.userId);
    await job.save();

    await this.auditLogService.record({
      actor: this.actorRef(currentUser),
      action: AuditAction.ARCHIVE,
      entityType: AuditEntityType.JOB,
      entityId: job._id,
    });

    return job;
  }

  async setUrgent(
    id: Types.ObjectId,
    dto: SetUrgentDto,
    currentUser: AuthenticatedUser,
  ): Promise<JobDocument> {
    const job = await this.jobModel.findById(id);
    if (!job) throw new NotFoundException('Job opening not found');

    job.isUrgent = dto.isUrgent;
    job.updatedBy = new Types.ObjectId(currentUser.userId);
    await job.save();

    await this.auditLogService.record({
      actor: this.actorRef(currentUser),
      action: AuditAction.MARK_URGENT,
      entityType: AuditEntityType.JOB,
      entityId: job._id,
      after: { isUrgent: job.isUrgent },
    });

    if (dto.isUrgent) {
      await this.emailService.sendAdminUrgentOpeningAlert({
        jobTitle: job.title,
        department: job.department,
        location: job.location,
        createdByName: currentUser.name,
        jobId: job._id.toString(),
      });
    }

    return job;
  }

  async duplicate(id: Types.ObjectId, currentUser: AuthenticatedUser): Promise<JobDocument> {
    const original = await this.jobModel.findById(id);
    if (!original) throw new NotFoundException('Job opening not found');

    const slug = await this.generateUniqueSlug(`${original.title}-copy`);

    const duplicate = await this.jobModel.create({
      title: original.title,
      slug,
      department: original.department,
      location: original.location,
      employmentType: original.employmentType,
      experience: original.experience,
      skills: original.skills,
      description: original.description,
      responsibilities: original.responsibilities,
      requirements: original.requirements,
      budget: original.budget,
      jdAttachment: original.jdAttachment,
      isPublished: false,
      isClosed: false,
      isArchived: false,
      isUrgent: false,
      openingDate: null,
      closingDate: null,
      createdBy: new Types.ObjectId(currentUser.userId),
      updatedBy: null,
      duplicatedFrom: original._id,
    });

    await this.auditLogService.record({
      actor: this.actorRef(currentUser),
      action: AuditAction.DUPLICATE,
      entityType: AuditEntityType.JOB,
      entityId: duplicate._id,
      after: { duplicatedFrom: original._id.toString(), slug: duplicate.slug },
    });

    return duplicate;
  }

  private buildSearchRegex(search: string): RegExp {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i');
  }

  private buildSort(
    sortBy: string | undefined,
    sortOrder: 'asc' | 'desc' | undefined,
    fallback: Record<string, 1 | -1>,
  ): Record<string, 1 | -1> {
    if (!sortBy) return fallback;
    return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  }
}
