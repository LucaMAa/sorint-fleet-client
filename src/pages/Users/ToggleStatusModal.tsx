import { useState } from 'react'
import { Modal, Btn, Alert } from '../../components/ui'
import { api } from '../../api/client'
import type { User } from '../../types'

interface Props {
  user: User
  onClose: () => void
  onDone: () => void
}

export function ToggleStatusModal({ user, onClose, onDone }: Props) {
  const isDisabled = user.status === 'disabled'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const action = isDisabled ? 'enable' : 'disable'
  const label  = isDisabled ? 'Riabilita' : 'Disabilita'

  const confirm = async () => {
    setLoading(true)
    setError('')
    try {
      await api.post(`/users/${user.id}/${action}`, {})
      onDone()
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={`${label} utente`}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Annulla</Btn>
          <Btn
            variant={isDisabled ? 'primary' : 'danger'}
            loading={loading}
            onClick={confirm}
          >
            {label}
          </Btn>
        </>
      }
    >
      <div className="confirm-dialog">
        {error && <Alert type="error">{error}</Alert>}
        <p>
          Stai per <strong>{label.toLowerCase()}</strong> l'account di
        </p>
        <strong>{user.first_name} {user.last_name}</strong>
        <p style={{ marginTop: 8, color: 'var(--text-3)', fontSize: '.85rem' }}>
          {isDisabled
            ? "L'utente potrà tornare ad accedere alla piattaforma."
            : "L'utente non potrà più accedere finché non viene riabilitato."}
        </p>
      </div>
    </Modal>
  )
}
