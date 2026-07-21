import { apiDelete, apiGet, apiPatch, apiPost, type UnwrappedResponse } from '@/lib/api-client'
import type { AppUser, CreateUserPayload, UpdateUserPayload } from '@/features/users/types'

export const usersQueryKey = ['users'] as const

export function listUsers(): Promise<UnwrappedResponse<AppUser[]>> {
  return apiGet<AppUser[]>('/users')
}

export function createUser(payload: CreateUserPayload): Promise<UnwrappedResponse<AppUser>> {
  return apiPost<AppUser, CreateUserPayload>('/users', payload)
}

export function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<UnwrappedResponse<AppUser>> {
  return apiPatch<AppUser, UpdateUserPayload>(`/users/${id}`, payload)
}

export function deactivateUser(id: string): Promise<UnwrappedResponse<AppUser>> {
  return apiDelete<AppUser>(`/users/${id}`)
}

export function activateUser(id: string): Promise<UnwrappedResponse<AppUser>> {
  return apiPatch<AppUser, undefined>(`/users/${id}/activate`)
}
