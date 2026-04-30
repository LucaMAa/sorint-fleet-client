import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/ui'
import { ProtectedRoute } from './components/ProtectedRoutes'
import { AppLayout } from './components/layout/Layout'
import { LoginPage } from './pages/Login/LoginPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { VehiclesPage } from './pages/Vehicles/VehiclesPage'
import { UsersPage } from './pages/Users/UsersPage'
import { ProfilePage } from './pages/Profile/ProfilePage'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
              <Route path="/vehicles" element={<AppLayout><VehiclesPage /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
            </Route>

            {/* Protected — admin only */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/users" element={<AppLayout><UsersPage /></AppLayout>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
