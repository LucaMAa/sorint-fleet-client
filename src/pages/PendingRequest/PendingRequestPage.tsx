import { useState, useCallback } from 'react'
import { useApi } from '../../hooks/useApi'
import { useWebSocket } from '../../hooks/useWebSocket'
import { api } from '../../api/client'
import { Btn, PageLoader, Empty } from '../../components/ui'
import { useToast } from '../../components/ui/index'
import type { User } from '../../types'
import './pending.css'

export function PendingRequestsPage() {
  const { data, loading, refetch } = useApi<{ users: User[] }>(() =>
    api.get('/users/pending')
  )
  const pending: User[] = (data as any)?.users ?? []
  const [processing, setProcessing] = useState<string | null>(null)
  const toast = useToast()

  // Aggiornamento live via WebSocket
  useWebSocket(
    useCallback(
      (event) => {
        if (event.type === 'new_pending_user') {
          refetch()
        }
      },
      [refetch]
    )
  )

  const approve = async (user: User) => {
    setProcessing(user.id)
    try {
      await api.post(`/users/${user.id}/approve`, {})
      toast.success(`${user.first_name} ${user.last_name} approvato ✓`)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setProcessing(null)
    }
  }

  const reject = async (user: User) => {
    setProcessing(user.id)
    try {
      await api.post(`/users/${user.id}/reject`, {})
      toast.info(`${user.first_name} ${user.last_name} rifiutato`)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="page-fade">
      <div className="page-hd">
        <div>
          <h1>Richieste di Accesso</h1>
          <p>
            {pending.length === 0
              ? 'Nessuna richiesta in attesa'
              : `${pending.length} richiest${pending.length === 1 ? 'a' : 'e'} in attesa`}
          </p>
        </div>
        <div className="pending-live-badge">
          <span className="live-dot" />
          Live
        </div>
      </div>

      {pending.length === 0 ? (
        <Empty
          icon="✅"
          title="Nessuna richiesta in attesa"
          sub="Le nuove richieste appariranno qui in tempo reale"
        />
      ) : (
        <div className="pending-list">
          {pending.map((u) => (
            <div key={u.id} className="pending-card">
              <div className="pending-avatar">
                {u.first_name[0]}{u.last_name[0]}
              </div>

              <div className="pending-info">
                <div className="pending-name">
                  {u.first_name} {u.last_name}
                </div>
                <div className="pending-email">{u.email}</div>
                <div className="pending-date">
                  Richiesta il{' '}
                  {new Date(u.created_at).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div className="pending-actions">
                <Btn
                  variant="ghost"
                  size="sm"
                  loading={processing === u.id}
                  onClick={() => reject(u)}
                  style={{ color: 'var(--red)', borderColor: 'rgba(248,113,113,.3)' }}
                >
                  ✕ Rifiuta
                </Btn>
                <Btn
                  size="sm"
                  loading={processing === u.id}
                  onClick={() => approve(u)}
                  style={{ background: 'var(--green)', color: '#fff' }}
                >
                  ✓ Approva
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
