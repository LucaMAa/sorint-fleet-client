import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { token, user, isAdmin } = useAuth()
  const location = useLocation()

  if (!token) return <Navigate to="/login" replace />

  if (
    user?.must_change_password &&
    location.pathname !== '/change-password'
  ) {
    return <Navigate to="/change-password" replace />
  }

  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
