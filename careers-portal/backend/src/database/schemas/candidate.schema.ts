import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApplicationStatus, CandidateSource } from '@/common/constants/enums';

export type CandidateDocument = HydratedDocument<Candidate>;

@Schema({ _id: true, timestamps: { createdAt: 'changedAt', updatedAt: false } })
export class StatusHistoryEntry {
  _id: Types.ObjectId;

  @Prop({ required: true, enum: ApplicationStatus })
  status: ApplicationStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  changedBy: Types.ObjectId | null;

  @Prop({ trim: true, default: null })
  remark: string | null;

  changedAt: Date;
}
export const StatusHistoryEntrySchema = SchemaFactory.createForClass(StatusHistoryEntry);

@Schema({ _id: true, timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class InternalNote {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 4000 })
  note: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  addedBy: Types.ObjectId;

  createdAt: Date;
}
export const InternalNoteSchema = SchemaFactory.createForClass(InternalNote);

@Schema({ _id: true, timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class ActivityLogEntry {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  action: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  performedBy: Types.ObjectId | null;

  @Prop({ type: Object, default: null })
  metadata: Record<string, unknown> | null;

  createdAt: Date;
}
export const ActivityLogEntrySchema = SchemaFactory.createForClass(ActivityLogEntry);

@Schema({ timestamps: true, collection: 'candidates' })
export class Candidate {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true, index: true })
  opening: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, trim: true })
  mobile: string;

  @Prop({ trim: true, default: null })
  linkedin: string | null;

  @Prop({ trim: true, default: null })
  portfolio: string | null;

  @Prop({ trim: true, default: null })
  currentCompany: string | null;

  @Prop({ trim: true, default: null })
  designation: string | null;

  @Prop({ required: true, min: 0, max: 60, index: true })
  experienceYears: number;

  @Prop({ required: true, trim: true })
  qualification: string;

  @Prop({ default: null })
  currentCtc: string | null;

  @Prop({ required: true })
  expectedCtc: string;

  @Prop({ required: true, trim: true })
  noticePeriod: string;

  @Prop({ required: true, trim: true, index: true })
  currentLocation: string;

  @Prop({ required: true, trim: true, index: true })
  preferredLocation: string;

  @Prop({ required: true })
  resumeUrl: string;

  /** Storage object key, used for signed downloads / deletion; never exposed to the public API */
  @Prop({ required: true, select: false })
  resumeStorageKey: string;

  @Prop({ required: true })
  resumeFileName: string;

  @Prop({ required: true })
  resumeMimeType: string;

  @Prop({ required: true })
  resumeSizeBytes: number;

  @Prop({ trim: true, maxlength: 2000, default: null })
  introduction: string | null;

  @Prop({ required: true, enum: CandidateSource, default: CandidateSource.WEBSITE, index: true })
  source: CandidateSource;

  /** Free-text detail when source is manually entered by HR (e.g. recruiter/consultancy name) */
  @Prop({ trim: true, default: null })
  sourceDetail: string | null;

  @Prop({
    required: true,
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
    index: true,
  })
  status: ApplicationStatus;

  @Prop({ type: [InternalNoteSchema], default: [] })
  internalNotes: InternalNote[];

  @Prop({ type: [StatusHistoryEntrySchema], default: [] })
  statusHistory: StatusHistoryEntry[];

  @Prop({ type: [ActivityLogEntrySchema], default: [] })
  activityLog: ActivityLogEntry[];

  @Prop({ required: true, default: true })
  consentGiven: boolean;

  /** Null for public/self-submitted applications; set when HR manually enters a candidate */
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);

// One application per email per opening — duplicate prevention at the DB layer
CandidateSchema.index({ opening: 1, email: 1 }, { unique: true });

CandidateSchema.index({ status: 1, createdAt: -1 });
CandidateSchema.index({ source: 1, createdAt: -1 });
CandidateSchema.index({ opening: 1, status: 1 });
CandidateSchema.index({ createdAt: -1 });
CandidateSchema.index({ name: 'text', email: 'text', currentCompany: 'text' });
