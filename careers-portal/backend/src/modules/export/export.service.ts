import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Workbook } from 'exceljs';
import { Candidate, CandidateDocument } from '@/database/schemas/candidate.schema';
import { Job, JobDocument } from '@/database/schemas/job.schema';
import { ApplicationExportFilterDto } from './dto/export-filter.dto';

interface ApplicationExportRow {
  jobTitle: string | null;
  jobDepartment: string | null;
  name: string;
  email: string;
  mobile: string;
  linkedin: string | null;
  portfolio: string | null;
  currentCompany: string | null;
  designation: string | null;
  experienceYears: number;
  qualification: string;
  currentCtc: string | null;
  expectedCtc: string;
  noticePeriod: string;
  currentLocation: string;
  preferredLocation: string;
  resumeFileName: string;
  introduction: string | null;
  source: string;
  sourceDetail: string | null;
  status: string;
  consentGiven: boolean;
  internalNotesCount: number;
  latestStatusRemark: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const EXPORT_COLUMNS: Array<{ header: string; key: keyof ApplicationExportRow; width: number }> = [
  { header: 'Job Title', key: 'jobTitle', width: 28 },
  { header: 'Department', key: 'jobDepartment', width: 18 },
  { header: 'Candidate Name', key: 'name', width: 24 },
  { header: 'Email', key: 'email', width: 28 },
  { header: 'Mobile', key: 'mobile', width: 16 },
  { header: 'LinkedIn', key: 'linkedin', width: 30 },
  { header: 'Portfolio', key: 'portfolio', width: 30 },
  { header: 'Current Company', key: 'currentCompany', width: 22 },
  { header: 'Designation', key: 'designation', width: 20 },
  { header: 'Experience (Years)', key: 'experienceYears', width: 16 },
  { header: 'Qualification', key: 'qualification', width: 20 },
  { header: 'Current CTC', key: 'currentCtc', width: 16 },
  { header: 'Expected CTC', key: 'expectedCtc', width: 16 },
  { header: 'Notice Period', key: 'noticePeriod', width: 16 },
  { header: 'Current Location', key: 'currentLocation', width: 18 },
  { header: 'Preferred Location', key: 'preferredLocation', width: 18 },
  { header: 'Resume File Name', key: 'resumeFileName', width: 26 },
  { header: 'Introduction', key: 'introduction', width: 40 },
  { header: 'Source', key: 'source', width: 14 },
  { header: 'Source Detail', key: 'sourceDetail', width: 20 },
  { header: 'Status', key: 'status', width: 20 },
  { header: 'Consent Given', key: 'consentGiven', width: 14 },
  { header: 'Internal Notes Count', key: 'internalNotesCount', width: 18 },
  { header: 'Latest Status Remark', key: 'latestStatusRemark', width: 32 },
  { header: 'Applied On', key: 'createdAt', width: 20 },
  { header: 'Last Updated', key: 'updatedAt', width: 20 },
];

const DATE_COLUMN_KEYS: Array<keyof ApplicationExportRow> = ['createdAt', 'updatedAt'];

@Injectable()
export class ExportService {
  constructor(
    @InjectModel(Candidate.name) private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
  ) {}

  async generateApplicationsExcel(filters: ApplicationExportFilterDto): Promise<Buffer> {
    const rows = await this.queryExportRows(filters);

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Applications');
    worksheet.columns = EXPORT_COLUMNS.map(({ header, key, width }) => ({ header, key, width }));
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E7FF' },
    };

    for (const key of DATE_COLUMN_KEYS) {
      worksheet.getColumn(key).numFmt = 'dd-mmm-yyyy hh:mm';
    }

    for (const row of rows) {
      worksheet.addRow(row);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }

  private async queryExportRows(filters: ApplicationExportFilterDto): Promise<ApplicationExportRow[]> {
    const match: Record<string, unknown> = {};

    if (filters.opening) {
      match.opening = new Types.ObjectId(filters.opening);
    }
    if (filters.status) {
      match.status = filters.status;
    }
    if (filters.source) {
      match.source = filters.source;
    }
    if (filters.location) {
      const locationRegex = new RegExp(escapeRegExp(filters.location), 'i');
      match.$or = [{ currentLocation: locationRegex }, { preferredLocation: locationRegex }];
    }
    if (filters.dateFrom || filters.dateTo) {
      match.createdAt = {
        ...(filters.dateFrom ? { $gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { $lte: filters.dateTo } : {}),
      };
    }
    if (filters.experienceMin !== undefined || filters.experienceMax !== undefined) {
      match.experienceYears = {
        ...(filters.experienceMin !== undefined ? { $gte: filters.experienceMin } : {}),
        ...(filters.experienceMax !== undefined ? { $lte: filters.experienceMax } : {}),
      };
    }

    // Dynamic, conditionally-built pipeline: stages are pushed as `unknown` and cast back to
    // PipelineStage because their shapes (computed $project fields, $facet-free $lookup/$unwind)
    // vary across branches and don't correspond to a single narrow PipelineStage member.
    const pipeline: PipelineStage[] = [{ $match: match } as unknown as PipelineStage];

    pipeline.push({
      $lookup: { from: this.jobModel.collection.collectionName, localField: 'opening', foreignField: '_id', as: 'job' },
    } as unknown as PipelineStage);
    pipeline.push({ $unwind: { path: '$job', preserveNullAndEmptyArrays: true } } as unknown as PipelineStage);

    if (filters.department) {
      pipeline.push({
        $match: { 'job.department': new RegExp(escapeRegExp(filters.department), 'i') },
      } as unknown as PipelineStage);
    }

    // Explicit allow-list projection: aggregation bypasses the schema's `select:false` on
    // resumeStorageKey, so every output field must be named here rather than blanket-included.
    pipeline.push({
      $project: {
        _id: 0,
        jobTitle: '$job.title',
        jobDepartment: '$job.department',
        name: 1,
        email: 1,
        mobile: 1,
        linkedin: 1,
        portfolio: 1,
        currentCompany: 1,
        designation: 1,
        experienceYears: 1,
        qualification: 1,
        currentCtc: 1,
        expectedCtc: 1,
        noticePeriod: 1,
        currentLocation: 1,
        preferredLocation: 1,
        resumeFileName: 1,
        introduction: 1,
        source: 1,
        sourceDetail: 1,
        status: 1,
        consentGiven: 1,
        internalNotesCount: { $size: '$internalNotes' },
        latestStatusRemark: {
          $let: {
            vars: { lastEntry: { $arrayElemAt: ['$statusHistory', -1] } },
            in: '$$lastEntry.remark',
          },
        },
        createdAt: 1,
        updatedAt: 1,
      },
    } as unknown as PipelineStage);

    pipeline.push({ $sort: { createdAt: -1 } } as unknown as PipelineStage);

    const rows = await this.candidateModel.aggregate<ApplicationExportRow>(pipeline);

    // expectedCtc/currentCtc are free-text (e.g. "Negotiable", "18 LPA", "18-25 LPA") and cannot be
    // reliably range-filtered inside the aggregation pipeline, so this is applied best-effort in JS:
    // unparseable values are kept (never excluded) since this is a convenience filter, not a guarantee.
    return rows.filter(
      (row) =>
        passesCtcFilter(row.expectedCtc, filters.expectedCtcMin, filters.expectedCtcMax) &&
        passesCtcFilter(row.currentCtc, filters.currentCtcMin, filters.currentCtcMax),
    );
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Extracts the first number found in a free-text CTC string, e.g. "₹18-25 LPA" -> 18. */
function extractLeadingNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}

function passesCtcFilter(rawValue: string | null | undefined, min?: number, max?: number): boolean {
  if (min === undefined && max === undefined) return true;
  const parsed = extractLeadingNumber(rawValue);
  if (parsed === null) return true;
  if (min !== undefined && parsed < min) return false;
  if (max !== undefined && parsed > max) return false;
  return true;
}
