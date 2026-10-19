export interface ApplicationPayload {
  jobId: string
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
  consentGiven: boolean
  resume: File
  supporting?: File[]
}

export class ApplicationSubmitError extends Error {
  statusCode: number
  code?: string
  fields?: Record<string, string[]>

  constructor(message: string, statusCode: number, code?: string, fields?: Record<string, string[]>) {
    super(message)
    this.name = 'ApplicationSubmitError'
    this.statusCode = statusCode
    this.code = code
    this.fields = fields
  }
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_CAREER_API_BASE_URL
  if (!base) {
    throw new Error('NEXT_PUBLIC_CAREER_API_BASE_URL is not set — configure it in .env.local')
  }
  return base.replace(/\/+$/, '')
}

const FRIENDLY: Record<number, string> = {
  404: 'This position is no longer open for applications.',
  409: 'You have already applied to this position with this email address.',
  413: 'One of your files is too large. Each file must be 10MB or smaller.',
  429: 'Too many applications from your connection. Please try again later.',
  503: 'We could not process your files right now. Please try again in a few minutes.',
}

export async function submitApplication(payload: ApplicationPayload): Promise<void> {
  const base = getBaseUrl()
  const formData = new FormData()

  formData.set('jobId', payload.jobId)
  formData.set('name', payload.name)
  formData.set('email', payload.email)
  formData.set('mobile', payload.mobile)
  if (payload.linkedin) formData.set('linkedin', payload.linkedin)
  if (payload.portfolio) formData.set('portfolio', payload.portfolio)
  if (payload.currentCompany) formData.set('currentCompany', payload.currentCompany)
  if (payload.designation) formData.set('designation', payload.designation)
  formData.set('experienceYears', String(Math.trunc(payload.experienceYears)))
  formData.set('qualification', payload.qualification)
  if (payload.currentCtc) formData.set('currentCtc', payload.currentCtc)
  formData.set('expectedCtc', payload.expectedCtc)
  formData.set('noticePeriod', payload.noticePeriod)
  formData.set('currentLocation', payload.currentLocation)
  formData.set('preferredLocation', payload.preferredLocation)
  if (payload.introduction) formData.set('introduction', payload.introduction)
  formData.set('consentGiven', String(payload.consentGiven))
  formData.set('resume', payload.resume)
  for (const file of payload.supporting ?? []) formData.append('supporting', file)

  let res: Response
  try {
    res = await fetch(`${base}/applications`, { method: 'POST', body: formData })
  } catch {
    throw new ApplicationSubmitError(
      'Could not reach the server. Check your connection and try again.',
      0,
    )
  }

  if (res.ok) return

  let message = FRIENDLY[res.status] ?? 'Something went wrong submitting your application. Please try again.'
  let code: string | undefined
  let fields: Record<string, string[]> | undefined
  try {
    const body = await res.json()
    code = body?.error?.code
    fields = body?.error?.fields
    // Prefer curated copy for statuses we know; otherwise surface the server message.
    if (!FRIENDLY[res.status] && typeof body?.error?.message === 'string') message = body.error.message
  } catch {
    // response wasn't JSON, keep the default message
  }
  throw new ApplicationSubmitError(message, res.status, code, fields)
}
