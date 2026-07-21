import { apiGet, type UnwrappedResponse } from '@/lib/api-client'
import type { AdminDashboard, HrDashboard } from '@/features/dashboard/types'

export const adminDashboardQueryKey = ['dashboard', 'admin'] as const
export const hrDashboardQueryKey = ['dashboard', 'hr'] as const

export function getAdminDashboard(): Promise<UnwrappedResponse<AdminDashboard>> {
  return apiGet<AdminDashboard>('/dashboard/admin')
}

export function getHrDashboard(): Promise<UnwrappedResponse<HrDashboard>> {
  return apiGet<HrDashboard>('/dashboard/hr')
}
