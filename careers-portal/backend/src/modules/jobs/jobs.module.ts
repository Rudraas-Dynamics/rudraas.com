import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from '@/database/schemas/job.schema';
import { Candidate, CandidateSchema } from '@/database/schemas/candidate.schema';
import { AuditLogModule } from '@/modules/audit-log/audit-log.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      // Read-only here: JobsService only checks for existing applications before a hard delete.
      // The Applications module remains the sole owner of this collection's business logic.
      { name: Candidate.name, schema: CandidateSchema },
    ]),
    AuditLogModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
