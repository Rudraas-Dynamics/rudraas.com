import {
  apiClient,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type ApiSuccessEnvelope,
  type UnwrappedResponse,
} from '@/lib/api-client'
import type {
  ApplicationExportQuery,
  ApplicationListQuery,
  ApplicationStatus,
  BulkStatusPayload,
  Candidate,
  ManualApplicationPayload,
  UpdateApplicationPayload,
} from '@/features/applications/types'

export const applicationsQueryKey = ['applications'] as const

export function applicationsListQueryKey(query: ApplicationListQuery) {
  return [...applicationsQueryKey, 'list', query] as const
}

export function applicationDetailQueryKey(id: string) {
  return [...applicationsQueryKey, 'detail', id] as const
}

export function listApplications(query: ApplicationListQuery = {}): Promise<UnwrappedResponse<Candidate[]>> {
  return apiGet<Candidate[]>('/applications', { params: query })
}

export function getApplication(id: string): Promise<UnwrappedResponse<Candidate>> {
  return apiGet<Candidate>(`/applications/${id}`)
}

export async function createManualApplication(payload: ManualApplicationPayload): Promise<Candidate> {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (key === 'resume' && value instanceof File) {
      formData.append('resume', value)
      return
    }
    formData.append(key, String(value))
  })

  const response = await apiClient.post<ApiSuccessEnvelope<Candidate>>('/applications/manual', formData)
  return response.data.data
}

export function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  remark?: string,
): Promise<UnwrappedResponse<Candidate>> {
  return apiPatch<Candidate, { status: ApplicationStatus; remark?: string }>(`/applications/${id}/status`, {
    status,
    remark,
  })
}

export function addApplicationNote(id: string, note: string): Promise<UnwrappedResponse<Candidate>> {
  return apiPost<Candidate, { note: string }>(`/applications/${id}/notes`, { note })
}

export function updateApplication(
  id: string,
  payload: UpdateApplicationPayload,
): Promise<UnwrappedResponse<Candidate>> {
  return apiPatch<Candidate, UpdateApplicationPayload>(`/applications/${id}`, payload)
}

export function deleteApplication(id: string): Promise<UnwrappedResponse<Candidate>> {
  return apiDelete<Candidate>(`/applications/${id}`)
}

export function bulkUpdateStatus(payload: BulkStatusPayload): Promise<UnwrappedResponse<unknown>> {
  return apiPost<unknown, BulkStatusPayload>('/applications/bulk/status', payload)
}

export async function bulkDownloadResumes(ids: string[]): Promise<Blob> {
  const response = await apiClient.post('/applications/bulk/download', { ids }, { responseType: 'blob' })
  return response.data as Blob
}

export async function exportApplications(query: ApplicationExportQuery): Promise<Blob> {
  const response = await apiClient.get('/applications/export', { params: query, responseType: 'blob' })
  return response.data as Blob
}

export async function downloadResume(id: string): Promise<Blob> {
  const response = await apiClient.get(`/applications/download-resume/${id}`, { responseType: 'blob' })
  return response.data as Blob
}
