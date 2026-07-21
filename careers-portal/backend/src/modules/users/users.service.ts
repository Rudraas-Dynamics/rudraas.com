import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { FilterQuery, Model, Types } from 'mongoose';
import { AuditAction, AuditEntityType } from '@/common/constants/enums';
import { AuthenticatedUser } from '@/common/decorators/current-user.decorator';
import { buildPaginationMeta, Paginated } from '@/common/dto/pagination-query.dto';
import { User, UserDocument } from '@/database/schemas/user.schema';
import { AuditLogService } from '@/modules/audit-log/audit-log.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

const BCRYPT_ROUNDS = 12;
const SORTABLE_FIELDS = ['name', 'email', 'role', 'isActive', 'createdAt', 'updatedAt', 'lastLoginAt'];

interface UserSnapshot {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(query: UserQueryDto): Promise<Paginated<User>> {
    const filter: FilterQuery<UserDocument> = {};
    if (query.role) {
      filter.role = query.role;
    }
    if (typeof query.isActive === 'boolean') {
      filter.isActive = query.isActive;
    }
    if (query.search) {
      const pattern = new RegExp(this.escapeRegex(query.search), 'i');
      filter.$or = [{ name: pattern }, { email: pattern }];
    }

    const sortField = query.sortBy && SORTABLE_FIELDS.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const sort: Record<string, 1 | -1> = { [sortField]: query.sortOrder === 'asc' ? 1 : -1 };
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.userModel.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data: data as unknown as User[],
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async create(dto: CreateUserDto, actor: AuthenticatedUser): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role,
      createdBy: new Types.ObjectId(actor.userId),
    });

    await this.auditLogService.record({
      actor: { userId: actor.userId, email: actor.email },
      action: AuditAction.CREATE,
      entityType: AuditEntityType.USER,
      entityId: user._id,
      after: this.snapshot(user),
    });

    return user;
  }

  async update(id: Types.ObjectId, dto: UpdateUserDto, actor: AuthenticatedUser): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const before = this.snapshot(user);
    let passwordWasReset = false;

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email.toLowerCase();
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.newPassword !== undefined) {
      user.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
      user.passwordResetCount = (user.passwordResetCount ?? 0) + 1;
      passwordWasReset = true;
    }

    await user.save();

    if (passwordWasReset) {
      await this.auditLogService.record({
        actor: { userId: actor.userId, email: actor.email },
        action: AuditAction.PASSWORD_RESET,
        entityType: AuditEntityType.USER,
        entityId: user._id,
      });
    }

    await this.auditLogService.record({
      actor: { userId: actor.userId, email: actor.email },
      action: AuditAction.UPDATE,
      entityType: AuditEntityType.USER,
      entityId: user._id,
      before,
      after: this.snapshot(user),
    });

    return user;
  }

  async deactivate(id: Types.ObjectId, actor: AuthenticatedUser): Promise<User> {
    if (id.toString() === actor.userId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const before = this.snapshot(user);
    user.isActive = false;
    await user.save();

    await this.auditLogService.record({
      actor: { userId: actor.userId, email: actor.email },
      action: AuditAction.DEACTIVATE,
      entityType: AuditEntityType.USER,
      entityId: user._id,
      before,
      after: this.snapshot(user),
    });

    return user;
  }

  async activate(id: Types.ObjectId, actor: AuthenticatedUser): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const before = this.snapshot(user);
    user.isActive = true;
    await user.save();

    await this.auditLogService.record({
      actor: { userId: actor.userId, email: actor.email },
      action: AuditAction.ACTIVATE,
      entityType: AuditEntityType.USER,
      entityId: user._id,
      before,
      after: this.snapshot(user),
    });

    return user;
  }

  private snapshot(user: UserDocument): UserSnapshot {
    return { name: user.name, email: user.email, role: user.role, isActive: user.isActive };
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
