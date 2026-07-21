import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '@/database/schemas/audit-log.schema';
import { AuditAction, AuditEntityType } from '@/common/constants/enums';
import { buildPaginationMeta, Paginated } from '@/common/dto/pagination-query.dto';

export interface RecordAuditLogParams {
  actor: { userId: string; email: string } | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | Types.ObjectId | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

export interface AuditLogQuery {
  page: number;
  limit: number;
  entityType?: AuditEntityType;
  entityId?: string;
  action?: AuditAction;
  actorId?: string;
  from?: Date;
  to?: Date;
}

/**
 * Central write path for the platform's immutable audit trail. Feature modules call
 * `record()` explicitly after every state-changing operation rather than relying on
 * implicit interceptor magic, so the before/after diff is always accurate.
 */
@Injectable()
export class AuditLogService {
  constructor(@InjectModel(AuditLog.name) private readonly model: Model<AuditLogDocument>) {}

  async record(params: RecordAuditLogParams): Promise<void> {
    await this.model.create({
      actor: params.actor ? new Types.ObjectId(params.actor.userId) : null,
      actorEmail: params.actor?.email ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ? new Types.ObjectId(params.entityId) : null,
      before: params.before ?? null,
      after: params.after ?? null,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
    });
  }

  async findAll(query: AuditLogQuery): Promise<Paginated<AuditLog>> {
    const filter: Record<string, unknown> = {};
    if (query.entityType) filter.entityType = query.entityType;
    if (query.entityId) filter.entityId = new Types.ObjectId(query.entityId);
    if (query.action) filter.action = query.action;
    if (query.actorId) filter.actor = new Types.ObjectId(query.actorId);
    if (query.from || query.to) {
      filter.createdAt = {
        ...(query.from ? { $gte: query.from } : {}),
        ...(query.to ? { $lte: query.to } : {}),
      };
    }

    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .populate('actor', 'name email role')
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return { data: data as unknown as AuditLog[], meta: buildPaginationMeta(query.page, query.limit, total) };
  }

  async findByEntity(entityType: AuditEntityType, entityId: string) {
    return this.model
      .find({ entityType, entityId: new Types.ObjectId(entityId) })
      .sort({ createdAt: -1 })
      .populate('actor', 'name email role')
      .lean();
  }
}
