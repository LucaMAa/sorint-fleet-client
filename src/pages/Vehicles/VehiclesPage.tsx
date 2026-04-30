import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useApi } from '../../hooks/useApi'
import { api } from '../../api/client'
import { Btn, Badge, Modal, PageLoader, Empty } from '../../components/ui'
import { VehicleForm } from './VehicleForm'
import { AssignModal } from './AssignModal'
import type { Vehicle } from '../../types'
import './vehicles.css'

export function VehiclesPage() {
  const { isAdmin } = useAuth()
  const { data, loading, refetch } = useApi<Vehicle[]>(() => api.get<any>('/vehicles').then(r => Array.isArray(r) ? r : r?.data ?? []))
  const vehicles: Vehicle[] = Array.isArray(data) ? data : []

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editV, setEditV] = useState<Vehicle | null>(null)
  const [assignV, setAssignV] = useState<Vehicle | null>(null)
  const [deleteV, setDeleteV] = useState<Vehicle | null>(null)
  const [delLoading, setDelLoading] = useState(false)

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase()
    const matchQ = !q || v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.license_plate.toLowerCase().includes(q)
    const matchS = !statusFilter || v.status === statusFilter
    return matchQ && matchS
  })

  const handleDelete = async () => {
    if (!deleteV) return
    setDelLoading(true)
    try { await api.delete(`/vehicles/${deleteV.id}`); refetch(); setDeleteV(null) }
    catch { /* toast */ }
    finally { setDelLoading(false) }
  }

  const handleUnassign = async (v: Vehicle) => {
    try { await api.patch(`/vehicles/${v.id}/unassign`, {}); refetch() }
    catch { /**/ }
  }

  if (loading) return <PageLoader />

  return (
    <div className="page-fade">
      <div className="page-hd">
        <div><h1>Veicoli</h1><p>{vehicles.length} veicoli nella flotta</p></div>
        {isAdmin && <Btn onClick={() => setShowForm(true)}>＋ Nuovo</Btn>}
      </div>

      <div className="filter-bar">
        <input placeholder="Cerca targa, brand, modello..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tutti gli stati</option>
          <option value="available">Disponibili</option>
          <option value="assigned">Assegnati</option>
          <option value="maintenance">Manutenzione</option>
        </select>
      </div>

      {filtered.length === 0 ? <Empty icon="🚗" title="Nessun veicolo" sub="Aggiungi il primo veicolo alla flotta" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>Targa</th><th>Veicolo</th><th>Anno</th><th>Km</th><th>Stato</th>
              {isAdmin && <th>Assegnato a</th>}
              {isAdmin && <th>Azioni</th>}
            </tr></thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td><code style={{ fontFamily:'var(--font-mono)', color:'var(--accent-h)', fontSize:'.8rem' }}>{v.license_plate}</code></td>
                  <td><strong>{v.brand}</strong> {v.model}</td>
                  <td style={{ color:'var(--text-3)' }}>{v.year}</td>
                  <td style={{ color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:'.8rem' }}>{v.mileage?.toLocaleString() ?? '—'}</td>
                  <td><Badge status={v.status} /></td>
                  {isAdmin && <td style={{ color:'var(--text-2)', fontSize:'.85rem' }}>{v.assigned_to ? `${v.assigned_to.first_name} ${v.assigned_to.last_name}` : '—'}</td>}
                  {isAdmin && (
                    <td>
                      <div className="vehicle-actions">
                        <Btn variant="ghost" size="sm" onClick={() => setEditV(v)}>✎</Btn>
                        {v.status === 'available' && <Btn variant="ghost" size="sm" onClick={() => setAssignV(v)}>↗</Btn>}
                        {v.status === 'assigned' && <Btn variant="ghost" size="sm" onClick={() => handleUnassign(v)}>↙</Btn>}
                        <Btn variant="danger" size="sm" onClick={() => setDeleteV(v)}>✕</Btn>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showForm || editV) && (
        <VehicleForm vehicle={editV} onClose={() => { setShowForm(false); setEditV(null) }} onSaved={refetch} />
      )}
      {assignV && <AssignModal vehicle={assignV} onClose={() => setAssignV(null)} onSaved={refetch} />}
      {deleteV && (
        <Modal title="Elimina Veicolo" onClose={() => setDeleteV(null)}
          footer={<><Btn variant="ghost" onClick={() => setDeleteV(null)}>Annulla</Btn><Btn variant="danger" loading={delLoading} onClick={handleDelete}>Elimina</Btn></>}>
          <div className="confirm-dialog">
            <p>Stai per eliminare il veicolo</p>
            <strong>{deleteV.brand} {deleteV.model} — {deleteV.license_plate}</strong>
            <p style={{ marginTop: 8 }}>Questa azione non è reversibile.</p>
          </div>
        </Modal>
      )}
    </div>
  )
}
