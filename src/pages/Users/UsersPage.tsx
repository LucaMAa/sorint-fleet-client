import { useEffect, useState, useCallback } from 'react'
import { api } from '../../api/client'
import { Btn, Badge, PageLoader, Empty } from '../../components/ui'
import type { User } from '../../types'
import { StatusBadge } from './StatusBadge'
import { EditRoleModal } from './EditRoleModal'
import { ToggleStatusModal } from './ToggleStatusModal'
import { UserHistorySlideOver } from './UserHistorySlideOver'
import './users.css'

const LIMIT = 10

interface PagedUsers {
  items: User[]
  total: number
  limit: number
  offset: number
}

export function UsersPage() {
  const [data, setData]       = useState<PagedUsers>({ items: [], total: 0, limit: LIMIT, offset: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [offset, setOffset]   = useState(0)

  const [editRoleU,   setEditRoleU]   = useState<User | null>(null)
  const [toggleU,     setToggleU]     = useState<User | null>(null)
  const [historyU,    setHistoryU]    = useState<User | null>(null)

  const fetchUsers = useCallback(async (q: string, off: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(off) })
      if (q) params.set('search', q)
      const res = await api.get<any>(`/users?${params}`)

      if (Array.isArray(res)) {
        setData({ items: res, total: res.length, limit: LIMIT, offset: off })
      } else if (res?.users) {
        setData({ items: res.users, total: res.users.length, limit: LIMIT, offset: off })
      } else {
        setData({
          items:  res?.items  ?? [],
          total:  res?.total  ?? 0,
          limit:  res?.limit  ?? LIMIT,
          offset: res?.offset ?? off,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => { setOffset(0); fetchUsers(search, 0) }, 300)
    return () => clearTimeout(t)
  }, [search, fetchUsers])

  useEffect(() => {
    fetchUsers(search, offset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  const refetch = () => fetchUsers(search, offset)

  const totalPages  = Math.ceil(data.total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  if (loading && data.items.length === 0) return <PageLoader />

  return (
    <div className="page-fade">
      {/* Header */}
      <div className="page-hd">
        <div>
          <h1>Utenti</h1>
          <p>{data.total} utenti registrati</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="users-search"
          placeholder="Cerca per nome o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: '.85rem' }}>
          Caricamento...
        </div>
      )}

      {!loading && data.items.length === 0 ? (
        <Empty icon="👥" title="Nessun utente" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Ruolo</th>
                  <th>Stato account</th>
                  <th>Registrato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(u => (
                  <tr
                    key={u.id}
                    className={u.status === 'disabled' ? 'row-disabled' : ''}
                    onClick={() => setHistoryU(u)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td><strong>{u.first_name} {u.last_name}</strong></td>
                    <td style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: '.8rem' }}>
                      {u.email}
                    </td>
                    <td><Badge status={u.role} /></td>
                    <td><StatusBadge status={u.status} /></td>
                    <td style={{ color: 'var(--text-3)', fontSize: '.8rem' }}>
                      {new Date(u.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="user-actions">
                        <Btn variant="ghost" size="sm" onClick={() => setEditRoleU(u)}>
                          ✎ Ruolo
                        </Btn>
                        {u.status === 'disabled' ? (
                          <Btn variant="ghost" size="sm"
                            style={{ color: 'var(--green)', borderColor: 'rgba(34,197,94,.3)' }}
                            onClick={() => setToggleU(u)}
                          >
                            ✓ Riabilita
                          </Btn>
                        ) : u.status === 'approved' ? (
                          <Btn variant="ghost" size="sm"
                            style={{ color: 'var(--red)', borderColor: 'rgba(248,113,113,.3)' }}
                            onClick={() => setToggleU(u)}
                          >
                            ✕ Disabilita
                          </Btn>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
              <Btn variant="ghost" size="sm" disabled={offset === 0}
                onClick={() => setOffset(o => Math.max(0, o - LIMIT))}>
                ← Prec
              </Btn>
              <span style={{ fontSize: '.85rem', color: 'var(--text-3)' }}>
                Pagina {currentPage} di {totalPages}
              </span>
              <Btn variant="ghost" size="sm" disabled={offset + LIMIT >= data.total}
                onClick={() => setOffset(o => o + LIMIT)}>
                Succ →
              </Btn>
            </div>
          )}
        </>
      )}

      {/* Modals & SlideOver */}
      {editRoleU && (
        <EditRoleModal
          user={editRoleU}
          onClose={() => setEditRoleU(null)}
          onDone={refetch}
        />
      )}

      {toggleU && (
        <ToggleStatusModal
          user={toggleU}
          onClose={() => setToggleU(null)}
          onDone={refetch}
        />
      )}

      {historyU && (
        <UserHistorySlideOver
          user={historyU}
          onClose={() => setHistoryU(null)}
        />
      )}
    </div>
  )
}
