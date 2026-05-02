import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationsProvider } from './contexts/NotificationContext'
import { ToastProvider } from './components/ui'
import { ProtectedRoute } from './components/ProtectedRoutes'
import { AppLayout } from './components/layout/Layout'
import { LoginPage } from './pages/Login/LoginPage'
import { ForceChangePasswordPage } from './pages/ForceChangePassword/ForceChangePasswordPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { VehiclesPage } from './pages/Vehicles/VehiclesPage'
import { UsersPage } from './pages/Users/UsersPage'
import { PendingRequestsPage } from './pages/PendingRequest/PendingRequestPage'
import { ProfilePage } from './pages/Profile/ProfilePage'
import './index.css'
import { ResetPasswordPage } from './pages/ResetPassword/ResetPasswordPages'
import { ConfirmEmailPage } from './pages/Profile/ConfirmEmailPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Email confirmation — public, token-based */}
              <Route path="/confirm-email" element={<ConfirmEmailPage />} />

              {/* Cambio password forzato — richiede auth ma non layout */}
              <Route element={<ProtectedRoute />}>
                <Route path="/change-password" element={<ForceChangePasswordPage />} />
              </Route>

              {/* Protected — tutti gli utenti autenticati */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
                <Route path="/vehicles" element={<AppLayout><VehiclesPage /></AppLayout>} />
                <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
              </Route>

              {/* Protected — solo admin */}
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/users" element={<AppLayout><UsersPage /></AppLayout>} />
                <Route path="/pending" element={<AppLayout><PendingRequestsPage /></AppLayout>} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationsProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
