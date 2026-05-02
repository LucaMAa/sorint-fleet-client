import './users.css'

interface Props {
  status: string
}

export function StatusBadge({ status }: Props) {
  const map: Record<string, { label: string; cls: string }> = {
    approved: { label: 'Attivo',       cls: 'status-approved' },
    pending:  { label: 'In attesa',    cls: 'status-pending'  },
    rejected: { label: 'Rifiutato',    cls: 'status-rejected' },
    disabled: { label: '⚠ Disabilitato', cls: 'status-disabled' },
  }

  const cfg = map[status] ?? { label: status, cls: 'status-pending' }

  return (
    <span className={`status-badge ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}
