import { useState, type FormEvent } from 'react'
import { Modal, Btn, Select, Alert } from '../../components/ui'
import { useApi } from '../../hooks/useApi'
import { api } from '../../api/client'
import type { Vehicle, User } from '../../types'

interface Props { vehicle: Vehicle; onClose: () => void; onSaved: () => void }

export function AssignModal({ vehicle, onClose, onSaved }: Props) {
  const { data } = useApi<{ users: User[] }>(() => api.get('/users'))
  const users: User[] = (data as any)?.users ?? []
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!userId) return
    setLoading(true); setError('')
    try {
      await api.patch(`/vehicles/${vehicle.id}/assign`, { user_id: userId })
      onSaved(); onClose()
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={`Assegna ${vehicle.brand} ${vehicle.model}`} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Annulla</Btn><Btn type="submit" form="af" loading={loading}>Assegna</Btn></>}>
      <form id="af" onSubmit={submit}>
        <Alert type="error">{error}</Alert>
        <Select label="Seleziona Utente" value={userId} onChange={e => setUserId(e.target.value)} required>
          <option value="">-- scegli --</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>)}
        </Select>
      </form>
    </Modal>
  )
}
