import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import { RoleRoute } from '@/components/routing/RoleRoute'
import ApplicationDetailPage from '@/features/applications/ApplicationDetailPage'
import ApplicationsListPage from '@/features/applications/ApplicationsListPage'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import JobDetailPage from '@/features/jobs/JobDetailPage'
import JobsListPage from '@/features/jobs/JobsListPage'
import UsersPage from '@/features/users/UsersPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        <Route path="jobs" element={<JobsListPage />} />
        <Route path="jobs/new" element={<JobDetailPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />

        <Route path="applications" element={<ApplicationsListPage />} />
        <Route path="applications/:id" element={<ApplicationDetailPage />} />

        <Route
          path="users"
          element={
            <RoleRoute allow={['ADMIN']}>
              <UsersPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
