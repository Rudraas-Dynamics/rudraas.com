export interface ApplicationPayload {
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
  consentGiven: boolean
  resume: File
}

export class ApplicationSubmitError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'ApplicationSubmitError'
    this.statusCode = statusCode
  }
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_CAREER_API_BASE_URL
  if (!base) {
    throw new Error('NEXT_PUBLIC_CAREER_API_BASE_URL is not set — configure it in .env.local')
  }
  return base.replace(/\/$/, '')
}

export async function submitApplication(payload: ApplicationPayload): Promise<void> {
  const base = getBaseUrl()
  const formData = new FormData()

  formData.set('openingId', payload.openingId)
  formData.set('name', payload.name)
  formData.set('email', payload.email)
  formData.set('mobile', payload.mobile)
  if (payload.linkedin) formData.set('linkedin', payload.linkedin)
  if (payload.portfolio) formData.set('portfolio', payload.portfolio)
  if (payload.currentCompany) formData.set('currentCompany', payload.currentCompany)
  if (payload.designation) formData.set('designation', payload.designation)
  formData.set('experienceYears', String(payload.experienceYears))
  formData.set('qualification', payload.qualification)
  if (payload.currentCtc) formData.set('currentCtc', payload.currentCtc)
  formData.set('expectedCtc', payload.expectedCtc)
  formData.set('noticePeriod', payload.noticePeriod)
  formData.set('currentLocation', payload.currentLocation)
  formData.set('preferredLocation', payload.preferredLocation)
  if (payload.introduction) formData.set('introduction', payload.introduction)
  formData.set('source', 'WEBSITE')
  formData.set('consentGiven', String(payload.consentGiven))
  formData.set('resume', payload.resume)

  const res = await fetch(`${base}/applications`, {
    method: 'POST',
    body: formData,
  })

  if (res.ok) return

  if (res.status === 409) {
    throw new ApplicationSubmitError('You have already applied to this position with this email address.', 409)
  }
  if (res.status === 429) {
    throw new ApplicationSubmitError('Too many attempts. Please try again in a minute.', 429)
  }

  let message = 'Something went wrong submitting your application. Please try again.'
  try {
    const body = await res.json()
    if (Array.isArray(body?.message)) message = body.message.join(' ')
    else if (typeof body?.message === 'string') message = body.message
  } catch {
    // response wasn't JSON, keep the default message
  }
  throw new ApplicationSubmitError(message, res.status)
}
