import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import { useAuth } from '@/features/auth/auth-context'
import type { UserRole } from '@/features/auth/types'

interface RoleRouteProps {
  allow: UserRole[]
  children: ReactNode
}

function RoleGuard({ allow, children }: RoleRouteProps) {
  const { user } = useAuth()

  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export function RoleRoute({ allow, children }: RoleRouteProps) {
  return (
    <ProtectedRoute>
      <RoleGuard allow={allow}>{children}</RoleGuard>
    </ProtectedRoute>
  )
}
