import type { VehicleAssignment } from '../../types'

function fmt(d: string) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function duration(start: string, end?: string | null) {
  const ms = new Date(end ?? new Date()).getTime() - new Date(start).getTime()
  const days = Math.floor(ms / 86400000)
  if (days < 1) return '< 1 giorno'
  if (days < 30) return `${days} giorni`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 mese' : `${months} mesi`
}

interface Props {
  assignments: VehicleAssignment[]
  mode: 'vehicle' | 'user'
}

export function AssignmentTimeline({ assignments, mode }: Props) {
  if (!assignments.length) {
    return <div className="tl-empty">Nessuna assegnazione registrata</div>
  }

  return (
    <div className="timeline">
      {assignments.map((a, i) => {
        const isActive = !a.ended_at
        const isLast = i === assignments.length - 1
        const label = mode === 'vehicle'
          ? (a.user ? `${a.user.first_name} ${a.user.last_name}` : '—')
          : (a.vehicle ? `${a.vehicle.brand} ${a.vehicle.model}` : '—')
        const sublabel = mode === 'vehicle'
          ? a.user?.email
          : a.vehicle?.license_plate

        return (
          <div key={a.id} className="tl-item">
            <div className="tl-line">
              <div className={`tl-dot ${isActive ? 'active' : 'closed'}`} />
              {!isLast && <div className="tl-connector" />}
            </div>
            <div className="tl-content">
              <div className="tl-name">{label}</div>
              {sublabel && (
                <div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                  {sublabel}
                </div>
              )}
              <div className="tl-dates">
                {fmt(a.started_at)} → {a.ended_at ? fmt(a.ended_at) : 'oggi'}
              </div>
              {isActive
                ? <span className="tl-active-badge">In corso · {duration(a.started_at)}</span>
                : <span className="tl-duration">{duration(a.started_at, a.ended_at)}</span>
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}
