import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { api } from '../../api/client'
import { Btn, Badge, Modal, Select, PageLoader, Empty } from '../../components/ui'
import type { User } from '../../types'

export function UsersPage() {
  const { data, loading, refetch } = useApi<{ users: User[] }>(() => api.get('/users'))
  const users: User[] = (data as any)?.users ?? []

  const [editU, setEditU] = useState<User | null>(null)
  const [role, setRole] = useState<'admin' | 'driver'>('driver')
  const [search, setSearch] = useState('')

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || u.email.toLowerCase().includes(q) || u.first_name.toLowerCase().includes(q) || u.last_name.toLowerCase().includes(q)
  })

  const openEdit = (u: User) => { setEditU(u); setRole(u.role) }

  const saveRole = async () => {
    if (!editU) return
    await api.patch(`/users/${editU.id}/role`, { role })
    refetch(); setEditU(null)
  }

  if (loading) return <PageLoader />

  return (
    <div className="page-fade">
      <div className="page-hd">
        <div><h1>Utenti</h1><p>{users.length} utenti registrati</p></div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input style={{ padding:'8px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text)', fontSize:'.875rem', outline:'none', width:'100%', maxWidth:320 }}
          placeholder="Cerca per nome o email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? <Empty icon="👥" title="Nessun utente" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Nome</th><th>Email</th><th>Ruolo</th><th>Registrato</th><th>Azioni</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.first_name} {u.last_name}</strong></td>
                  <td style={{ color:'var(--text-2)', fontFamily:'var(--font-mono)', fontSize:'.8rem' }}>{u.email}</td>
                  <td><Badge status={u.role} /></td>
                  <td style={{ color:'var(--text-3)', fontSize:'.8rem' }}>{new Date(u.created_at).toLocaleDateString('it-IT')}</td>
                  <td><Btn variant="ghost" size="sm" onClick={() => openEdit(u)}>✎ Ruolo</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editU && (
        <Modal title={`Modifica Ruolo — ${editU.first_name} ${editU.last_name}`} onClose={() => setEditU(null)}
          footer={<><Btn variant="ghost" onClick={() => setEditU(null)}>Annulla</Btn><Btn onClick={saveRole}>Salva</Btn></>}>
          <Select label="Ruolo" value={role} onChange={e => setRole(e.target.value as any)}>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </Select>
        </Modal>
      )}
    </div>
  )
}
