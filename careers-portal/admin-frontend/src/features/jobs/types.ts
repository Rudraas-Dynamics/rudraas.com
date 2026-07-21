export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'

export const EMPLOYMENT_TYPES: EmploymentType[] = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'FREELANCE',
]

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
}

export interface ExperienceRange {
  minYears: number
  maxYears: number
}

export interface JobAttachment {
  url: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export interface JobActor {
  _id: string
  name: string
  email: string
}

export interface Job {
  _id: string
  title: string
  slug: string
  department: string
  location: string
  employmentType: EmploymentType
  experience: ExperienceRange
  skills: string[]
  description: string
  responsibilities: string
  requirements: string
  budget: string | null
  jdAttachment: JobAttachment | null
  isUrgent: boolean
  isPublished: boolean
  isClosed: boolean
  isArchived: boolean
  openingDate: string | null
  closingDate: string | null
  createdBy: JobActor | null
  updatedBy: JobActor | null
  createdAt: string
  updatedAt: string
}

export interface JobListQuery {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  department?: string
  location?: string
  employmentType?: EmploymentType
  isPublished?: boolean
  isClosed?: boolean
  isArchived?: boolean
  isUrgent?: boolean
}

export interface JobPayload {
  title: string
  department: string
  location: string
  employmentType: EmploymentType
  experience: ExperienceRange
  skills: string[]
  description: string
  responsibilities: string
  requirements: string
  budget?: string | null
  jdAttachment?: JobAttachment | null
  openingDate?: string | null
  closingDate?: string | null
}

export type JobStatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED' | 'URGENT'
