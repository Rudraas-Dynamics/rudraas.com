import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from '@/database/schemas/job.schema';
import { Candidate, CandidateDocument } from '@/database/schemas/candidate.schema';
import { ApplicationStatus, APPLICATION_PIPELINE_ORDER } from '@/common/constants/enums';
import { AuthenticatedUser } from '@/common/decorators/current-user.decorator';

/** Statuses considered "closed out" of the active hiring pipeline for the admin pipeline card. */
const PIPELINE_EXIT_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.SELECTED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.OFFER_RELEASED,
  ApplicationStatus.JOINED,
  ApplicationStatus.WITHDRAWN,
];

/** Statuses that participate in APPLICATION_PIPELINE_ORDER but are excluded from it (final/exit outcomes). */
const TERMINAL_STATUSES: ApplicationStatus[] = Object.values(ApplicationStatus).filter(
  (status) => !APPLICATION_PIPELINE_ORDER.includes(status),
);

const INTERVIEW_STAGES: ApplicationStatus[] = [
  ApplicationStatus.INTERVIEW_SCHEDULED,
  ApplicationStatus.TECHNICAL_ROUND,
  ApplicationStatus.HR_ROUND,
  ApplicationStatus.FINAL_DISCUSSION,
];

interface CountFacetResult {
  [key: string]: Array<{ count: number }>;
}

interface StatusGroupRow {
  _id: ApplicationStatus;
  count: number;
}

export interface ApplicationsPerDay {
  date: string;
  count: number;
}

export interface ApplicationsPerJob {
  jobId: Types.ObjectId;
  title: string | null;
  count: number;
}

export interface StatusDistributionEntry {
  status: ApplicationStatus;
  count: number;
}

export interface HiringFunnelEntry {
  stage: ApplicationStatus;
  count: number;
}

export interface TopSourceEntry {
  source: string;
  count: number;
}

export interface RecentApplicationEntry {
  _id: Types.ObjectId;
  name: string;
  email: string;
  status: ApplicationStatus;
  source: string;
  createdAt: Date;
  jobTitle: string | null;
}

export interface AdminDashboard {
  cards: {
    totalOpenings: number;
    activeOpenings: number;
    closedOpenings: number;
    urgentHiring: number;
    totalApplications: number;
    todaysApplications: number;
    applicationsThisMonth: number;
    hiringPipeline: number;
  };
  charts: {
    applicationsPerDay: ApplicationsPerDay[];
    applicationsPerJob: ApplicationsPerJob[];
    statusDistribution: StatusDistributionEntry[];
    hiringFunnel: HiringFunnelEntry[];
    topSources: TopSourceEntry[];
    recentApplications: RecentApplicationEntry[];
  };
}

export interface HrDashboard {
  assignedOpenings: JobDocument[];
  latestApplications: RecentApplicationEntry[];
  urgentHiring: JobDocument[];
  pendingScreening: number;
  interviewPipeline: HiringFunnelEntry[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Candidate.name) private readonly candidateModel: Model<CandidateDocument>,
  ) {}

  async getAdminDashboard(): Promise<AdminDashboard> {
    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(startOfToday);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // inclusive of today => 30 days total

    const [jobFacet, candidateCardsFacet, candidateChartsFacet] = await Promise.all([
      this.jobModel.aggregate<CountFacetResult>([
        {
          $facet: {
            totalOpenings: [{ $count: 'count' }],
            activeOpenings: [
              { $match: { isPublished: true, isClosed: false, isArchived: false } },
              { $count: 'count' },
            ],
            closedOpenings: [{ $match: { isClosed: true } }, { $count: 'count' }],
            urgentHiring: [
              { $match: { isUrgent: true, isPublished: true, isClosed: false, isArchived: false } },
              { $count: 'count' },
            ],
          },
        },
      ]),
      this.candidateModel.aggregate<CountFacetResult>([
        {
          $facet: {
            totalApplications: [{ $count: 'count' }],
            todaysApplications: [{ $match: { createdAt: { $gte: startOfToday } } }, { $count: 'count' }],
            applicationsThisMonth: [
              { $match: { createdAt: { $gte: startOfMonth } } },
              { $count: 'count' },
            ],
            hiringPipeline: [
              { $match: { status: { $nin: PIPELINE_EXIT_STATUSES } } },
              { $count: 'count' },
            ],
          },
        },
      ]),
      this.candidateModel.aggregate([
        {
          $facet: {
            applicationsPerDay: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              {
                $group: {
                  _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            applicationsPerJob: [
              { $group: { _id: '$opening', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
              {
                $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' },
              },
              { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
              { $project: { _id: 0, jobId: '$_id', title: '$job.title', count: 1 } },
            ],
            statusGroup: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
            topSources: [
              { $group: { _id: '$source', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 5 },
              { $project: { _id: 0, source: '$_id', count: 1 } },
            ],
            recentApplications: [
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              {
                $lookup: { from: 'jobs', localField: 'opening', foreignField: '_id', as: 'job' },
              },
              { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  status: 1,
                  source: 1,
                  createdAt: 1,
                  jobTitle: '$job.title',
                },
              },
            ],
          },
        },
      ]),
    ]);

    const statusGroup = (candidateChartsFacet[0].statusGroup ?? []) as StatusGroupRow[];

    return {
      cards: {
        totalOpenings: extractFacetCount(jobFacet[0], 'totalOpenings'),
        activeOpenings: extractFacetCount(jobFacet[0], 'activeOpenings'),
        closedOpenings: extractFacetCount(jobFacet[0], 'closedOpenings'),
        urgentHiring: extractFacetCount(jobFacet[0], 'urgentHiring'),
        totalApplications: extractFacetCount(candidateCardsFacet[0], 'totalApplications'),
        todaysApplications: extractFacetCount(candidateCardsFacet[0], 'todaysApplications'),
        applicationsThisMonth: extractFacetCount(candidateCardsFacet[0], 'applicationsThisMonth'),
        hiringPipeline: extractFacetCount(candidateCardsFacet[0], 'hiringPipeline'),
      },
      charts: {
        applicationsPerDay: backfillApplicationsPerDay(
          candidateChartsFacet[0].applicationsPerDay as Array<{ _id: string; count: number }>,
          startOfToday,
          30,
        ),
        applicationsPerJob: candidateChartsFacet[0].applicationsPerJob as ApplicationsPerJob[],
        statusDistribution: buildStatusDistribution(statusGroup),
        hiringFunnel: buildHiringFunnel(statusGroup),
        topSources: candidateChartsFacet[0].topSources as TopSourceEntry[],
        recentApplications: candidateChartsFacet[0].recentApplications as RecentApplicationEntry[],
      },
    };
  }

  async getHrDashboard(currentUser: AuthenticatedUser): Promise<HrDashboard> {
    const [jobFacet, candidateFacet] = await Promise.all([
      this.jobModel.aggregate([
        {
          $facet: {
            // No recruiter-assignment model exists yet (documented future feature); until it ships,
            // "assigned" is interpreted as "openings this HR user created".
            assignedOpenings: [
              { $match: { createdBy: new Types.ObjectId(currentUser.userId), isArchived: false } },
              { $sort: { createdAt: -1 } },
            ],
            urgentHiring: [
              { $match: { isPublished: true, isClosed: false, isArchived: false, isUrgent: true } },
              { $sort: { createdAt: -1 } },
            ],
          },
        },
      ]),
      this.candidateModel.aggregate([
        {
          $facet: {
            latestApplications: [
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              {
                $lookup: { from: 'jobs', localField: 'opening', foreignField: '_id', as: 'job' },
              },
              { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  status: 1,
                  source: 1,
                  createdAt: 1,
                  jobTitle: '$job.title',
                },
              },
            ],
            pendingScreening: [
              {
                $match: {
                  status: { $in: [ApplicationStatus.APPLIED, ApplicationStatus.SCREENING] },
                },
              },
              { $count: 'count' },
            ],
            interviewStatusGroup: [
              { $match: { status: { $in: INTERVIEW_STAGES } } },
              { $group: { _id: '$status', count: { $sum: 1 } } },
            ],
          },
        },
      ]),
    ]);

    const interviewStatusGroup = (candidateFacet[0].interviewStatusGroup ?? []) as StatusGroupRow[];

    return {
      assignedOpenings: jobFacet[0].assignedOpenings as JobDocument[],
      latestApplications: candidateFacet[0].latestApplications as RecentApplicationEntry[],
      urgentHiring: jobFacet[0].urgentHiring as JobDocument[],
      pendingScreening: extractFacetCount(candidateFacet[0], 'pendingScreening'),
      interviewPipeline: INTERVIEW_STAGES.map((stage) => ({
        stage,
        count: interviewStatusGroup.find((row) => row._id === stage)?.count ?? 0,
      })),
    };
  }
}

function extractFacetCount(facetResult: CountFacetResult, key: string): number {
  return facetResult[key]?.[0]?.count ?? 0;
}

function buildStatusDistribution(statusGroup: StatusGroupRow[]): StatusDistributionEntry[] {
  const order = [...APPLICATION_PIPELINE_ORDER, ...TERMINAL_STATUSES];
  const byStatus = new Map(statusGroup.map((row) => [row._id, row.count]));
  return order
    .filter((status) => byStatus.has(status))
    .map((status) => ({ status, count: byStatus.get(status) as number }));
}

function buildHiringFunnel(statusGroup: StatusGroupRow[]): HiringFunnelEntry[] {
  const byStatus = new Map(statusGroup.map((row) => [row._id, row.count]));
  return APPLICATION_PIPELINE_ORDER.map((stage) => ({
    stage,
    count: byStatus.get(stage) ?? 0,
  }));
}

function backfillApplicationsPerDay(
  rows: Array<{ _id: string; count: number }>,
  startOfToday: Date,
  days: number,
): ApplicationsPerDay[] {
  const byDate = new Map(rows.map((row) => [row._id, row.count]));
  const result: ApplicationsPerDay[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(startOfToday);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    result.push({ date: key, count: byDate.get(key) ?? 0 });
  }
  return result;
}
