import { useState } from 'react'
import { Modal, Btn, Select } from '../../components/ui'
import { api } from '../../api/client'
import type { User } from '../../types'

interface Props {
  user: User
  onClose: () => void
  onDone: () => void
}

export function EditRoleModal({ user, onClose, onDone }: Props) {
  const [role, setRole] = useState<'admin' | 'user'>(user.role)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    try {
      await api.patch(`/users/${user.id}/role`, { role })
      onDone()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={`Modifica Ruolo — ${user.first_name} ${user.last_name}`}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Annulla</Btn>
          <Btn loading={loading} onClick={save}>Salva</Btn>
        </>
      }
    >
      <Select
        label="Ruolo"
        value={role}
        onChange={e => setRole(e.target.value as 'admin' | 'user')}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </Select>
    </Modal>
  )
}
