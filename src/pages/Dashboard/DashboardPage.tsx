import { useAuth } from '../../contexts/AuthContext'
import { useApi } from '../../hooks/useApi'
import { api } from '../../api/client'
import { Badge, PageLoader } from '../../components/ui'
import type { Vehicle, User } from '../../types'

export function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const { data: vehicles, loading: vl } = useApi<Vehicle[]>(() => api.get('/vehicles').then((r: any) => r?.data ?? r ?? []))
  const { data: users, loading: ul } = useApi<{ users: User[] }>(() => isAdmin ? api.get('/users') : Promise.resolve({ users: [] }))

  if (vl || ul) return <PageLoader />

  const vList: Vehicle[] = Array.isArray(vehicles) ? vehicles : []
  const uList: User[] = (users as any)?.users ?? []

  const avail = vList.filter(v => v.status === 'available').length
  const assigned = vList.filter(v => v.status === 'assigned').length
  const maint = vList.filter(v => v.status === 'maintenance').length

  return (
    <div className="page-fade">
      <div className="page-hd">
        <div>
          <h1>Ciao, {user?.first_name} 👋</h1>
          <p>Ecco una panoramica della flotta</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Veicoli Totali</div>
          <div className="stat-value">{vList.length}</div>
          <div className="stat-sub">nella flotta</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Disponibili</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{avail}</div>
          <div className="stat-sub">pronti all'uso</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Assegnati</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{assigned}</div>
          <div className="stat-sub">in utilizzo</div>
        </div>
        {isAdmin && (
          <div className="stat-card">
            <div className="stat-label">Utenti</div>
            <div className="stat-value">{uList.length}</div>
            <div className="stat-sub">registrati</div>
          </div>
        )}
        {maint > 0 && (
          <div className="stat-card">
            <div className="stat-label">Manutenzione</div>
            <div className="stat-value" style={{ color: 'var(--yellow)' }}>{maint}</div>
            <div className="stat-sub">non disponibili</div>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Ultimi Veicoli</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Targa</th><th>Veicolo</th><th>Anno</th><th>Stato</th></tr></thead>
          <tbody>
            {vList.slice(0, 8).map(v => (
              <tr key={v.id}>
                <td><code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-h)', fontSize: '.8rem' }}>{v.license_plate}</code></td>
                <td>{v.brand} {v.model}</td>
                <td style={{ color: 'var(--text-3)' }}>{v.year}</td>
                <td><Badge status={v.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
