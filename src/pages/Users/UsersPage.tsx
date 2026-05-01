import { useEffect, useState, useCallback } from 'react'
import { api } from '../../api/client'
import { Btn, Badge, Modal, Select, PageLoader, Empty } from '../../components/ui'
import type { User } from '../../types'
import { SlideOver } from '../../components/ui/SlideOver'
import { AssignmentTimeline } from '../../components/ui/Assignmenttimeline'

const LIMIT = 10

interface PagedUsers {
  items: User[]
  total: number
  limit: number
  offset: number
}

export function UsersPage() {
  const [data, setData] = useState<PagedUsers>({ items: [], total: 0, limit: LIMIT, offset: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)

  const [editU, setEditU] = useState<User | null>(null)
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [historyU, setHistoryU] = useState<User | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchUsers = useCallback(async (q: string, off: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(off) })
      if (q) params.set('search', q)
      const res = await api.get<any>(`/users?${params}`)
      // normalizza: nuovo formato { items, total } oppure vecchio { users: [] }
      if (Array.isArray(res)) {
        setData({ items: res, total: res.length, limit: LIMIT, offset: off })
      } else if (res?.users) {
        setData({ items: res.users, total: res.users.length, limit: LIMIT, offset: off })
      } else {
        setData({
          items: res?.items ?? [],
          total: res?.total ?? 0,
          limit: res?.limit ?? LIMIT,
          offset: res?.offset ?? off,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(0)
      fetchUsers(search, 0)
    }, 300)
    return () => clearTimeout(t)
  }, [search, fetchUsers])

  useEffect(() => {
    fetchUsers(search, offset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  const refetch = () => fetchUsers(search, offset)

  useEffect(() => {
    if (!historyU) return
    const load = async () => {
      setHistoryLoading(true)
      try {
        const res = await api.get<any>(`/users/${historyU.id}/history`)
        setHistory(Array.isArray(res) ? res : res?.data ?? [])
      } finally {
        setHistoryLoading(false)
      }
    }
    load()
  }, [historyU])

  const openEdit = (u: User) => { setEditU(u); setRole(u.role) }

  const saveRole = async () => {
    if (!editU) return
    await api.patch(`/users/${editU.id}/role`, { role })
    refetch()
    setEditU(null)
  }

  const totalPages = Math.ceil(data.total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  if (loading && data.items.length === 0) return <PageLoader />

  return (
    <div className="page-fade">
      <div className="page-hd">
        <div>
          <h1>Utenti</h1>
          <p>{data.total} utenti registrati</p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          style={{
            padding: '8px 12px',
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            color: 'var(--text)',
            fontSize: '.875rem',
            outline: 'none',
            width: '100%',
            maxWidth: 320,
          }}
          placeholder="Cerca per nome o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: '.85rem' }}>Caricamento...</div>}

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
                  <th>Registrato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(u => (
                  <tr key={u.id} onClick={() => setHistoryU(u)} style={{ cursor: 'pointer' }}>
                    <td><strong>{u.first_name} {u.last_name}</strong></td>
                    <td style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: '.8rem' }}>
                      {u.email}
                    </td>
                    <td><Badge status={u.role} /></td>
                    <td style={{ color: 'var(--text-3)', fontSize: '.8rem' }}>
                      {new Date(u.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <Btn variant="ghost" size="sm" onClick={() => openEdit(u)}>✎ Ruolo</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
              <Btn variant="ghost" size="sm" disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - LIMIT))}>
                ← Prec
              </Btn>
              <span style={{ fontSize: '.85rem', color: 'var(--text-3)' }}>
                Pagina {currentPage} di {totalPages}
              </span>
              <Btn variant="ghost" size="sm" disabled={offset + LIMIT >= data.total} onClick={() => setOffset(o => o + LIMIT)}>
                Succ →
              </Btn>
            </div>
          )}
        </>
      )}

      {editU && (
        <Modal
          title={`Modifica Ruolo — ${editU.first_name} ${editU.last_name}`}
          onClose={() => setEditU(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setEditU(null)}>Annulla</Btn>
              <Btn onClick={saveRole}>Salva</Btn>
            </>
          }
        >
          <Select label="Ruolo" value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>
        </Modal>
      )}

      {historyU && (
        <SlideOver
          title={`${historyU.first_name} ${historyU.last_name}`}
          sub={historyU.email}
          icon="👤"
          onClose={() => setHistoryU(null)}
        >
          <div className="so-section-title">
            Storico veicoli <span>{history?.length ?? 0}</span>
          </div>
          {historyLoading ? (
            <p style={{ color: 'var(--text-3)' }}>Caricamento...</p>
          ) : (
            <AssignmentTimeline assignments={history ?? []} mode="user" />
          )}
        </SlideOver>
      )}
    </div>
  )
}
