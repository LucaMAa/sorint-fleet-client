import { SlideOver } from '../../components/ui/SlideOver'
import { AssignmentTimeline } from '../../components/ui/Assignmenttimeline'
import type { Vehicle, VehicleAssignment } from '../../types'

interface Props {
  vehicle: Vehicle
  assignments: VehicleAssignment[]
  loading: boolean
  onClose: () => void
}

export function VehicleSlideOver({ vehicle, assignments, loading, onClose }: Props) {
  return (
    <SlideOver
      title={`${vehicle.brand} ${vehicle.model}`}
      sub={vehicle.license_plate}
      icon="🚗"
      onClose={onClose}
    >
      <div className="so-meta">
        <div className="so-meta-item">
          <div className="so-meta-label">Anno</div>
          <div className="so-meta-value">{vehicle.year}</div>
        </div>

        <div className="so-meta-item">
          <div className="so-meta-label">Km</div>
          <div className="so-meta-value">{vehicle.mileage ?? '—'}</div>
        </div>
      </div>

      <div className="so-section-title">
        Storico assegnazioni <span>{assignments.length}</span>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-3)' }}>Caricamento...</div>
      ) : (
        <AssignmentTimeline assignments={assignments} mode="vehicle" />
      )}
    </SlideOver>
  )
}
