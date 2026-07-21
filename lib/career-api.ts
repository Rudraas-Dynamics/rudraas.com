export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'

export interface JobAttachment {
  url: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export interface PublicJob {
  _id: string
  title: string
  slug: string
  department: string
  location: string
  employmentType: EmploymentType
  experience: { minYears: number; maxYears: number }
  skills: string[]
  budget: string | null
  isUrgent: boolean
  openingDate: string | null
  closingDate: string | null
  createdAt: string
  description?: string
  responsibilities?: string
  requirements?: string
  jdAttachment?: JobAttachment | null
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface JobFilters {
  departments: string[]
  locations: string[]
  employmentTypes: EmploymentType[]
}

interface ApiSuccess<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

interface ApiError {
  success: false
  statusCode: number
  message: string | string[]
  path: string
  timestamp: string
}

export class CareerApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'CareerApiError'
    this.statusCode = statusCode
  }
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_CAREER_API_BASE_URL
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_CAREER_API_BASE_URL is not set — configure it in .env.local (see .env.example)',
    )
  }
  return base.replace(/\/$/, '')
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiError
    if (Array.isArray(body.message)) return body.message.join(', ')
    if (body.message) return body.message
  } catch {
    // response wasn't JSON, fall through
  }
  return res.statusText || `Request failed with status ${res.status}`
}

export async function getPublicJobs(
  params: Record<string, string | number | undefined>,
): Promise<{ data: PublicJob[]; meta: PaginationMeta }> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/jobs/public${buildQueryString(params)}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    throw new CareerApiError(await readErrorMessage(res), res.status)
  }
  const body = (await res.json()) as ApiSuccess<PublicJob[]>
  return { data: body.data, meta: body.meta as PaginationMeta }
}

export async function getPublicJobFilters(): Promise<JobFilters> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/jobs/public/filters`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) {
    throw new CareerApiError(await readErrorMessage(res), res.status)
  }
  const body = (await res.json()) as ApiSuccess<JobFilters>
  return body.data
}

export async function getPublicJobBySlug(slug: string): Promise<PublicJob | null> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/jobs/public/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  })
  if (res.status === 404) {
    return null
  }
  if (!res.ok) {
    throw new CareerApiError(await readErrorMessage(res), res.status)
  }
  const body = (await res.json()) as ApiSuccess<PublicJob>
  return body.data
}
