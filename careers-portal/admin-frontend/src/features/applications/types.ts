import type { EmploymentType } from '@/features/jobs/types'

export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'TECHNICAL_ROUND'
  | 'HR_ROUND'
  | 'FINAL_DISCUSSION'
  | 'SELECTED'
  | 'REJECTED'
  | 'OFFER_RELEASED'
  | 'JOINED'
  | 'WITHDRAWN'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'TECHNICAL_ROUND',
  'HR_ROUND',
  'FINAL_DISCUSSION',
  'SELECTED',
  'REJECTED',
  'OFFER_RELEASED',
  'JOINED',
  'WITHDRAWN',
]

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview scheduled',
  TECHNICAL_ROUND: 'Technical round',
  HR_ROUND: 'HR round',
  FINAL_DISCUSSION: 'Final discussion',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  OFFER_RELEASED: 'Offer released',
  JOINED: 'Joined',
  WITHDRAWN: 'Withdrawn',
}

export type CandidateSource =
  | 'WEBSITE'
  | 'LINKEDIN'
  | 'NAUKRI'
  | 'REFERRAL'
  | 'CAMPUS'
  | 'WALK_IN'
  | 'RECRUITER'
  | 'CONSULTANCY'
  | 'OTHER'

export const CANDIDATE_SOURCES: CandidateSource[] = [
  'WEBSITE',
  'LINKEDIN',
  'NAUKRI',
  'REFERRAL',
  'CAMPUS',
  'WALK_IN',
  'RECRUITER',
  'CONSULTANCY',
  'OTHER',
]

export const CANDIDATE_SOURCE_LABELS: Record<CandidateSource, string> = {
  WEBSITE: 'Website',
  LINKEDIN: 'LinkedIn',
  NAUKRI: 'Naukri',
  REFERRAL: 'Referral',
  CAMPUS: 'Campus',
  WALK_IN: 'Walk-in',
  RECRUITER: 'Recruiter',
  CONSULTANCY: 'Consultancy',
  OTHER: 'Other',
}

interface ContactRef {
  name: string
  email: string
}

export interface StatusHistoryEntry {
  _id: string
  status: ApplicationStatus
  changedBy: ContactRef | null
  remark: string | null
  changedAt: string
}

export interface InternalNote {
  _id: string
  note: string
  addedBy: ContactRef
  createdAt: string
}

export interface ActivityLogEntry {
  _id: string
  action: string
  performedBy: ContactRef | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface CandidateOpening {
  _id: string
  title: string
  department: string
  location: string
  employmentType?: EmploymentType
}

export interface Candidate {
  _id: string
  opening: CandidateOpening
  name: string
  email: string
  mobile: string
  linkedin: string | null
  portfolio: string | null
  currentCompany: string | null
  designation: string | null
  experienceYears: number
  qualification: string
  currentCtc: string | null
  expectedCtc: string
  noticePeriod: string
  currentLocation: string
  preferredLocation: string
  resumeFileName: string
  resumeMimeType: string
  resumeSizeBytes: number
  introduction: string | null
  source: CandidateSource
  sourceDetail: string | null
  status: ApplicationStatus
  internalNotes: InternalNote[]
  statusHistory: StatusHistoryEntry[]
  activityLog: ActivityLogEntry[]
  consentGiven: boolean
  createdAt: string
  updatedAt: string
}

export interface ApplicationListQuery {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  opening?: string
  status?: ApplicationStatus
  source?: CandidateSource
  search?: string
  experienceMin?: number
  experienceMax?: number
  currentLocation?: string
  preferredLocation?: string
  dateFrom?: string
  dateTo?: string
}

export interface ApplicationExportQuery {
  opening?: string
  status?: ApplicationStatus
  source?: CandidateSource
  department?: string
  location?: string
  dateFrom?: string
  dateTo?: string
  experienceMin?: number
  experienceMax?: number
  expectedCtcMin?: number
  expectedCtcMax?: number
  currentCtcMin?: number
  currentCtcMax?: number
}

export interface ManualApplicationPayload {
  openingId: string
  name: string
  email: string
  mobile: string
  linkedin?: string
  portfolio?: string
  currentCompany?: string
  designation?: string
  experienceYears: number
  qualification: string
  currentCtc?: string
  expectedCtc: string
  noticePeriod: string
  currentLocation: string
  preferredLocation: string
  introduction?: string
  source: CandidateSource
  sourceDetail?: string
  consentGiven: boolean
  resume: File
}

export interface UpdateApplicationPayload {
  name?: string
  mobile?: string
  linkedin?: string
  portfolio?: string
  currentCompany?: string
  designation?: string
  experienceYears?: number
  qualification?: string
  currentCtc?: string
  expectedCtc?: string
  noticePeriod?: string
  currentLocation?: string
  preferredLocation?: string
}

export interface BulkStatusPayload {
  ids: string[]
  status: ApplicationStatus
  remark?: string
}
