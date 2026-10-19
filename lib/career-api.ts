export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'

export interface PublicJob {
  id: string
  slug: string
  title: string
  department: string
  location: string
  employmentType: EmploymentType
  experienceMinYears: number
  experienceMaxYears: number
  skills: string[]
  salaryRange: string | null
  isUrgent: boolean
  openingDate: string | null
  closingDate: string | null
  publishedAt: string
}

/** Detail view: plain-text long-form fields (possibly empty strings). */
export interface PublicJobDetail extends PublicJob {
  description: string
  responsibilities: string
  requirements: string
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

/** Error envelope: `{ success:false, error:{ code, message, fields? } }` */
export interface ApiErrorBody {
  success?: false
  error?: {
    code?: string
    message?: string
    fields?: Record<string, string[]>
  }
}

export class CareerApiError extends Error {
  statusCode: number
  code?: string
  fields?: Record<string, string[]>

  constructor(message: string, statusCode: number, code?: string, fields?: Record<string, string[]>) {
    super(message)
    this.name = 'CareerApiError'
    this.statusCode = statusCode
    this.code = code
    this.fields = fields
  }
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_CAREER_API_BASE_URL
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_CAREER_API_BASE_URL is not set — configure it in .env.local (see .env.example)',
    )
  }
  return base.replace(/\/+$/, '')
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

async function readError(res: Response): Promise<CareerApiError> {
  let message = res.statusText || `Request failed with status ${res.status}`
  let code: string | undefined
  let fields: Record<string, string[]> | undefined
  try {
    const body = (await res.json()) as ApiErrorBody
    if (body?.error?.message) message = body.error.message
    code = body?.error?.code
    fields = body?.error?.fields
  } catch {
    // response wasn't JSON, keep the default message
  }
  return new CareerApiError(message, res.status, code, fields)
}

export async function getPublicJobs(
  params: Record<string, string | number | undefined>,
): Promise<{ data: PublicJob[]; meta: PaginationMeta }> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/jobs${buildQueryString(params)}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw await readError(res)
  return (await res.json()) as { data: PublicJob[]; meta: PaginationMeta }
}

export async function getPublicJobFilters(): Promise<JobFilters> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/jobs/filters`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw await readError(res)
  return (await res.json()) as JobFilters
}

export async function getPublicJobBySlug(slug: string): Promise<PublicJobDetail | null> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/jobs/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  })
  if (res.status === 404) return null
  if (!res.ok) throw await readError(res)
  return (await res.json()) as PublicJobDetail
}
