import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Candidate, CandidateSchema } from '@/database/schemas/candidate.schema';
import { Job, JobSchema } from '@/database/schemas/job.schema';
import { ExportService } from './export.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: Job.name, schema: JobSchema },
    ]),
  ],
  // No controller here — the Applications module owns `GET /applications/export`
  // and calls ExportService directly.
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
