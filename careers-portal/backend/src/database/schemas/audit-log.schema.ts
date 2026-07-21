import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AuditAction, AuditEntityType } from '@/common/constants/enums';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false }, collection: 'audit_logs' })
export class AuditLog {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  actor: Types.ObjectId | null;

  @Prop({ trim: true, default: null })
  actorEmail: string | null;

  @Prop({ required: true, enum: AuditAction, index: true })
  action: AuditAction;

  @Prop({ required: true, enum: AuditEntityType, index: true })
  entityType: AuditEntityType;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  entityId: Types.ObjectId | null;

  @Prop({ type: Object, default: null })
  before: Record<string, unknown> | null;

  @Prop({ type: Object, default: null })
  after: Record<string, unknown> | null;

  @Prop({ default: null })
  ip: string | null;

  @Prop({ default: null })
  userAgent: string | null;

  createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });
