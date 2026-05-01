import { useState, useEffect, type ReactNode } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { api } from '../../api/client'
import './Layout.css'

const NAV: { to: string; icon: string; label: string }[] = []

const ADMIN_NAV = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/vehicles', icon: '🚗', label: 'Veicoli' },
  { to: '/users', icon: '👥', label: 'Utenti' },
  { to: '/pending', icon: '🔔', label: 'Richieste' },
]

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'Veicoli',
  '/users': 'Utenti',
  '/pending': 'Richieste di Accesso',
  '/profile': 'Profilo',
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const { pendingCount, setPendingCount } = useNotifications()

  // Al mount, carica il conteggio iniziale pending
  useEffect(() => {
    if (!isAdmin) return
    api.get<{ users: unknown[] }>('/users/pending')
      .then(res => setPendingCount((res as any)?.users?.length ?? 0))
      .catch(() => {})
  }, [isAdmin, setPendingCount])

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?'
  const title = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Fleet'

  const close = () => setOpen(false)

  return (
    <div className="layout">
      <div className={`overlay ${open ? 'open' : ''}`} onClick={close} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🚐</div>
          <div><div className="logo-name">Fleet</div><div className="logo-sub">Sorint.lab</div></div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Menu</div>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={close}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <div className="nav-section" style={{ marginTop: 8 }}>Admin</div>
              {ADMIN_NAV.map(n => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={close}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <span className="nav-icon">{n.icon}</span>
                  {n.label}
                  {n.to === '/pending' && pendingCount > 0 && (
                    <span className="nav-badge">{pendingCount}</span>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className="user-row" onClick={close}>
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.first_name} {user?.last_name}</div>
              <div className="user-role-txt">{user?.role}</div>
            </div>
          </NavLink>
          <button
            className="logout-btn"
            title="Logout"
            onClick={() => { logout(); navigate('/login') }}
            style={{ marginLeft: 'auto', marginTop: 4, display: 'flex' }}
          >
            ⎋
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <span className="topbar-title">Fleet</span>
          <span className="topbar-sep">/</span>
          <span className="topbar-page">{title}</span>
          <span className="topbar-space" />
        </header>
        <div className="page-wrap page-fade">{children}</div>
      </div>
    </div>
  )
}
