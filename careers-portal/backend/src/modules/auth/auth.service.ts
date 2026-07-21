import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Model, Types } from 'mongoose';
import { AuditAction, AuditEntityType, Role } from '@/common/constants/enums';
import { RefreshToken, RefreshTokenDocument } from '@/database/schemas/refresh-token.schema';
import { User, UserDocument } from '@/database/schemas/user.schema';
import { AuditLogService } from '@/modules/audit-log/audit-log.service';

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export interface AuthResult {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresAt: Date;
  csrfToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async login(dto: { email: string; password: string }, meta: RequestMeta): Promise<AuthResult> {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .select('+passwordHash');

    // Same generic message and audit outcome regardless of which check fails
    // (unknown email, inactive account, wrong password) to avoid user enumeration.
    const invalidCredentials = async (): Promise<never> => {
      await this.auditLogService.record({
        actor: null,
        action: AuditAction.LOGIN_FAILED,
        entityType: AuditEntityType.AUTH,
        after: { email: dto.email },
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException('Invalid email or password');
    };

    if (!user || !user.isActive) {
      return invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      return invalidCredentials();
    }

    user.lastLoginAt = new Date();
    await user.save();

    const { accessToken, expiresIn } = this.signAccessToken(user);
    const { raw: refreshToken, expiresAt: refreshExpiresAt } = await this.issueRefreshToken(
      user._id,
      meta,
    );
    const csrfToken = this.generateCsrfToken();

    await this.auditLogService.record({
      actor: { userId: user._id.toString(), email: user.email },
      action: AuditAction.LOGIN,
      entityType: AuditEntityType.AUTH,
      entityId: user._id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      accessToken,
      expiresIn,
      refreshToken,
      refreshExpiresAt,
      csrfToken,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    };
  }

  async refresh(rawRefreshToken: string | undefined, meta: RequestMeta): Promise<AuthResult> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenDoc = await this.refreshTokenModel.findOne({ tokenHash });

    if (!tokenDoc) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenDoc.revoked) {
      // The token was already rotated once; presenting it again means either the
      // client replayed a stale cookie or the token was stolen. Either way, treat
      // every outstanding session for this user as compromised and force re-login.
      await this.refreshTokenModel.updateMany(
        { user: tokenDoc.user, revoked: false },
        { $set: { revoked: true } },
      );
      throw new UnauthorizedException('Session invalidated, please log in again');
    }

    if (tokenDoc.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.userModel.findById(tokenDoc.user);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is no longer active');
    }

    const {
      raw: newRefreshToken,
      expiresAt: refreshExpiresAt,
      doc: newTokenDoc,
    } = await this.issueRefreshToken(user._id, meta);

    tokenDoc.revoked = true;
    tokenDoc.replacedBy = newTokenDoc._id;
    await tokenDoc.save();

    const { accessToken, expiresIn } = this.signAccessToken(user);
    const csrfToken = this.generateCsrfToken();

    await this.auditLogService.record({
      actor: { userId: user._id.toString(), email: user.email },
      action: AuditAction.TOKEN_REFRESH,
      entityType: AuditEntityType.AUTH,
      entityId: user._id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      accessToken,
      expiresIn,
      refreshToken: newRefreshToken,
      refreshExpiresAt,
      csrfToken,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    };
  }

  async logout(
    rawRefreshToken: string | undefined,
    actor: { userId: string; email: string },
    meta: RequestMeta,
  ): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.refreshTokenModel.updateOne(
        { tokenHash, revoked: false },
        { $set: { revoked: true } },
      );
    }

    await this.auditLogService.record({
      actor,
      action: AuditAction.LOGOUT,
      entityType: AuditEntityType.AUTH,
      entityId: actor.userId,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  getRefreshCookieMaxAgeMs(): number {
    return this.parseDurationToMs(this.configService.get<string>('jwt.refreshExpiresIn') as string);
  }

  generateCsrfToken(): string {
    return crypto.randomBytes(24).toString('hex');
  }

  private signAccessToken(user: UserDocument): { accessToken: string; expiresIn: number } {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const decoded = this.jwtService.decode(accessToken) as { exp: number; iat: number };
    return { accessToken, expiresIn: decoded.exp - decoded.iat };
  }

  private async issueRefreshToken(
    userId: Types.ObjectId,
    meta: RequestMeta,
  ): Promise<{ raw: string; expiresAt: Date; doc: RefreshTokenDocument }> {
    const raw = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(raw);
    const expiresAt = new Date(Date.now() + this.getRefreshCookieMaxAgeMs());

    const doc = await this.refreshTokenModel.create({
      user: userId,
      tokenHash,
      expiresAt,
      userAgent: meta.userAgent,
      ip: meta.ip,
    });

    return { raw, expiresAt, doc };
  }

  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  private parseDurationToMs(duration: string): number {
    const match = /^(\d+)\s*(ms|s|m|h|d)$/i.exec(duration.trim());
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * multipliers[unit];
  }
}
