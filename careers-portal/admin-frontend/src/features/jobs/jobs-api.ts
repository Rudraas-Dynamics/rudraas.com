import {
  apiClient,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type ApiSuccessEnvelope,
  type UnwrappedResponse,
} from '@/lib/api-client'
import type { Job, JobAttachment, JobListQuery, JobPayload } from '@/features/jobs/types'

export const jobsQueryKey = ['jobs'] as const

export function jobsListQueryKey(query: JobListQuery) {
  return [...jobsQueryKey, 'list', query] as const
}

export function jobDetailQueryKey(id: string) {
  return [...jobsQueryKey, 'detail', id] as const
}

export function listJobs(query: JobListQuery = {}): Promise<UnwrappedResponse<Job[]>> {
  return apiGet<Job[]>('/jobs', { params: query })
}

export function getJob(id: string): Promise<UnwrappedResponse<Job>> {
  return apiGet<Job>(`/jobs/${id}`)
}

export function createJob(payload: JobPayload): Promise<UnwrappedResponse<Job>> {
  return apiPost<Job, JobPayload>('/jobs', payload)
}

export function updateJob(id: string, payload: Partial<JobPayload>): Promise<UnwrappedResponse<Job>> {
  return apiPatch<Job, Partial<JobPayload>>(`/jobs/${id}`, payload)
}

export function deleteJob(id: string): Promise<UnwrappedResponse<Job>> {
  return apiDelete<Job>(`/jobs/${id}`)
}

export function publishJob(id: string): Promise<UnwrappedResponse<Job>> {
  return apiPatch<Job, undefined>(`/jobs/${id}/publish`)
}

export function closeJob(id: string): Promise<UnwrappedResponse<Job>> {
  return apiPatch<Job, undefined>(`/jobs/${id}/close`)
}

export function archiveJob(id: string): Promise<UnwrappedResponse<Job>> {
  return apiPatch<Job, undefined>(`/jobs/${id}/archive`)
}

export function setJobUrgent(id: string, isUrgent: boolean): Promise<UnwrappedResponse<Job>> {
  return apiPatch<Job, { isUrgent: boolean }>(`/jobs/${id}/urgent`, { isUrgent })
}

export function duplicateJob(id: string): Promise<UnwrappedResponse<Job>> {
  return apiPost<Job, undefined>(`/jobs/${id}/duplicate`)
}

export async function uploadJobAttachment(file: File): Promise<JobAttachment> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<ApiSuccessEnvelope<JobAttachment>>('/uploads/job-attachment', formData)
  return response.data.data
}
