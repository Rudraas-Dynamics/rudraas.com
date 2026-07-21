import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@/database/schemas/user.schema';
import { AuditLogModule } from '@/modules/audit-log/audit-log.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), AuditLogModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
