import { useEffect, useState } from 'react'
import { SlideOver } from '../../components/ui/SlideOver'
import { AssignmentTimeline } from '../../components/ui/Assignmenttimeline'
import { api } from '../../api/client'
import type { User, VehicleAssignment } from '../../types'

interface Props {
  user: User
  onClose: () => void
}

export function UserHistorySlideOver({ user, onClose }: Props) {
  const [history, setHistory] = useState<VehicleAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<any>(`/users/${user.id}/history`)
      .then(res => setHistory(Array.isArray(res) ? res : res?.data ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [user.id])

  return (
    <SlideOver
      title={`${user.first_name} ${user.last_name}`}
      sub={user.email}
      icon="👤"
      onClose={onClose}
    >
      <div className="so-section-title">
        Storico veicoli <span>{history.length}</span>
      </div>
      {loading ? (
        <p style={{ color: 'var(--text-3)' }}>Caricamento...</p>
      ) : (
        <AssignmentTimeline assignments={history} mode="user" />
      )}
    </SlideOver>
  )
}
