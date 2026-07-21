import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EmploymentType } from '@/common/constants/enums';

export type JobDocument = HydratedDocument<Job>;

@Schema({ _id: false })
export class JobAttachment {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  sizeBytes: number;
}
export const JobAttachmentSchema = SchemaFactory.createForClass(JobAttachment);

@Schema({ _id: false })
export class ExperienceRange {
  @Prop({ required: true, min: 0 })
  minYears: number;

  @Prop({ required: true, min: 0 })
  maxYears: number;
}
export const ExperienceRangeSchema = SchemaFactory.createForClass(ExperienceRange);

/**
 * "Role" per the product spec — named `title` to avoid clashing with the RBAC `Role` enum.
 */
@Schema({ timestamps: true, collection: 'jobs' })
export class Job {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 150 })
  title: string;

  @Prop({ required: true, unique: true, index: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ required: true, trim: true, index: true })
  department: string;

  @Prop({ required: true, trim: true, index: true })
  location: string;

  @Prop({ required: true, enum: EmploymentType, index: true })
  employmentType: EmploymentType;

  @Prop({ type: ExperienceRangeSchema, required: true })
  experience: ExperienceRange;

  @Prop({ type: [String], default: [] })
  skills: string[];

  /** Rich text (sanitized HTML) */
  @Prop({ required: true })
  description: string;

  /** Rich text (sanitized HTML) or bullet list rendered as HTML */
  @Prop({ required: true })
  responsibilities: string;

  /** Rich text (sanitized HTML) or bullet list rendered as HTML */
  @Prop({ required: true })
  requirements: string;

  /** Free text: exact figure, range, "Negotiable", etc. */
  @Prop({ trim: true, default: null })
  budget: string | null;

  /** Optional JD file attachment, alternative/supplement to rich-text description */
  @Prop({ type: JobAttachmentSchema, default: null })
  jdAttachment: JobAttachment | null;

  @Prop({ default: false, index: true })
  isUrgent: boolean;

  @Prop({ default: false, index: true })
  isPublished: boolean;

  @Prop({ default: false, index: true })
  isClosed: boolean;

  @Prop({ default: false, index: true })
  isArchived: boolean;

  @Prop({ type: Date, default: null })
  openingDate: Date | null;

  @Prop({ type: Date, default: null })
  closingDate: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Job', default: null })
  duplicatedFrom: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);

// Public listing filter/sort surface
JobSchema.index({ isPublished: 1, isClosed: 1, isArchived: 1, department: 1, location: 1 });
JobSchema.index({ isPublished: 1, isClosed: 1, isArchived: 1, employmentType: 1 });
JobSchema.index({ isPublished: 1, isUrgent: 1, createdAt: -1 });
JobSchema.index({ createdAt: -1 });
// Full text search across role/department/skills for the public + global search
JobSchema.index({ title: 'text', department: 'text', skills: 'text', location: 'text' });
