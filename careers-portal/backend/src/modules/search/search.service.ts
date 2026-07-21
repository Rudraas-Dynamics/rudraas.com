import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '@/database/schemas/job.schema';
import { Candidate, CandidateDocument } from '@/database/schemas/candidate.schema';
import { User, UserDocument } from '@/database/schemas/user.schema';
import { Role } from '@/common/constants/enums';

const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 5;

export interface GlobalSearchResult {
  jobs: unknown[];
  candidates: unknown[];
  hr: unknown[];
  departments: string[];
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Candidate.name) private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async globalSearch(q: string): Promise<GlobalSearchResult> {
    const query = q?.trim() ?? '';
    if (query.length < MIN_QUERY_LENGTH) {
      // Too short to be meaningful and too harsh to reject outright on a live-search-as-you-type
      // UI — just return empty results instead of throwing.
      return { jobs: [], candidates: [], hr: [], departments: [] };
    }

    const regex = new RegExp(escapeRegExp(query), 'i');

    const [jobs, candidates, hr, departments] = await Promise.all([
      this.jobModel
        .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(RESULT_LIMIT)
        .select('title slug department location isPublished')
        .lean(),
      this.candidateModel
        .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(RESULT_LIMIT)
        .select('name email currentCompany status opening')
        .populate('opening', 'title')
        .lean(),
      // Regex rather than $text here: we also need an equality filter on `role`, and combining a
      // $text search with other predicates efficiently in the same query isn't well supported at
      // this collection's scale — a simple indexed regex on name/email is simpler and fast enough.
      this.userModel
        .find({ role: Role.HR, $or: [{ name: regex }, { email: regex }] })
        .limit(RESULT_LIMIT)
        .select('name email isActive')
        .lean(),
      this.jobModel.distinct('department', { department: regex }) as unknown as Promise<string[]>,
    ]);

    return {
      jobs,
      candidates,
      hr,
      departments: departments.slice(0, RESULT_LIMIT),
    };
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
