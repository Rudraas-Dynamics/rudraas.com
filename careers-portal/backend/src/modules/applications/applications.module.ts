import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Candidate, CandidateSchema } from '@/database/schemas/candidate.schema';
import { Job, JobSchema } from '@/database/schemas/job.schema';
import { AuditLogModule } from '@/modules/audit-log/audit-log.module';
import { UploadModule } from '@/modules/upload/upload.module';
import { ExportModule } from '@/modules/export/export.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: Job.name, schema: JobSchema },
    ]),
    AuditLogModule,
    UploadModule,
    ExportModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
