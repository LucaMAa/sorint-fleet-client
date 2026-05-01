import { useApi } from '../../hooks/useApi'
import { api } from '../../api/client'
import type { User } from '../../types'

export function UserSlideOver({
  user,
  onClose,
  onEditRole,
}: {
  user: User
  onClose: () => void
  onEditRole: () => void
}) {
  const { data, loading } = useApi(() =>
    api.get(`/users/${user.id}/history`)
  )

  const history = (data as any)?.data ?? data ?? []

  return (
    <div className="slideover">
      <div className="slideover-header">
        <h3>{user.first_name} {user.last_name}</h3>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="slideover-body">
        <h4>Storico veicoli</h4>

        {loading ? (
          <p>Loading...</p>
        ) : history.length === 0 ? (
          <p>Nessuno storico</p>
        ) : (
          <ul>
            {history.map((h: any) => (
              <li key={h.id}>
                🚗 {h.vehicle} — {new Date(h.assigned_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="slideover-actions">
        <button onClick={onEditRole}>Modifica ruolo</button>
      </div>
    </div>
  )
}
