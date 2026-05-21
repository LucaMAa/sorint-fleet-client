import { useState } from 'react'
 
interface Props {
  vehicleId: string
  licensePlate: string
  style?: React.CSSProperties
}
 
export function DownloadAssignmentPdfButton({ vehicleId, licensePlate, style }: Props) {
  const [loading, setLoading] = useState(false)
 
  const download = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
 
    try {
      const token = localStorage.getItem('fleet_token')
      const res = await fetch(`/api/vehicles/${vehicleId}/assignment-pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
 
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
 
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${licensePlate}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download failed:', err)
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <button
      onClick={download}
      disabled={loading}
      title="Scarica autorizzazione PDF"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: '5px 10px',
        borderRadius: 6,
        border: '1px solid rgba(56,189,248,.35)',
        background: 'rgba(56,189,248,.10)',
        color: 'var(--blue)',
        fontSize: '.75rem',
        fontWeight: 600,
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'all .15s',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={e => {
        if (!loading) {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = 'rgba(56,189,248,.22)'
          el.style.borderColor = 'rgba(56,189,248,.6)'
        }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.background = 'rgba(56,189,248,.10)'
        el.style.borderColor = 'rgba(56,189,248,.35)'
      }}
    >
      {loading ? (
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            border: '2px solid rgba(56,189,248,.3)',
            borderTopColor: 'var(--blue)',
            display: 'inline-block',
            animation: 'spin .6s linear infinite',
          }}
        />
      ) : (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <polyline points="9 14 12 17 15 14" />
        </svg>
      )}
      PDF
    </button>
  )
}
