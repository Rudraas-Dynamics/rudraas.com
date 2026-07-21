import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '@/common/constants/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  /** bcrypt hash; never serialized to API responses (see toJSON transform) */
  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, enum: Role, index: true })
  role: Role;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;

  @Prop({ default: 0 })
  passwordResetCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  virtuals: true,
  // `ret` is intentionally untyped: Mongoose's own toJSON transform type for this schema
  // has no string index signature, so a `Record<string, unknown>` annotation here doesn't
  // type-check against it — the transform only needs to strip two known keys regardless.
  transform: (_doc, ret: any) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

UserSchema.index({ name: 'text', email: 'text' });
