import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../api/client'
import { Btn, Badge, Modal, PageLoader, Empty } from '../../components/ui'
import { VehicleForm } from './VehicleForm'
import { AssignModal } from './AssignModal'
import type { Vehicle, VehicleAssignment } from '../../types'
import './vehicles.css'
import { VehicleImport } from './VehicleImport'
import { SlideOver } from '../../components/ui/SlideOver'
import { AssignmentTimeline } from '../../components/ui/Assignmenttimeline'

const LIMIT = 10

interface PagedVehicles {
  items: Vehicle[]
  total: number
  limit: number
  offset: number
}

export function VehiclesPage() {
  const { isAdmin } = useAuth()

  const [data, setData] = useState<PagedVehicles>({ items: [], total: 0, limit: LIMIT, offset: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [offset, setOffset] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editV, setEditV] = useState<Vehicle | null>(null)
  const [assignV, setAssignV] = useState<Vehicle | null>(null)
  const [deleteV, setDeleteV] = useState<Vehicle | null>(null)
  const [delLoading, setDelLoading] = useState(false)
  const [historyV, setHistoryV] = useState<Vehicle | null>(null)
  const [history, setHistory] = useState<VehicleAssignment[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchVehicles = useCallback(async (q: string, status: string, off: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(off) })
      if (q) params.set('search', q)
      if (status) params.set('status', status)
      const res = await api.get<any>(`/vehicles?${params}`)
      // normalizza: nuovo formato { items, total } oppure vecchio array
      if (Array.isArray(res)) {
        setData({ items: res, total: res.length, limit: LIMIT, offset: off })
      } else {
        setData({
          items: res?.items ?? [],
          total: res?.total ?? 0,
          limit: res?.limit ?? LIMIT,
          offset: res?.offset ?? off,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // debounce della ricerca
  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(0)
      fetchVehicles(search, statusFilter, 0)
    }, 300)
    return () => clearTimeout(t)
  }, [search, statusFilter, fetchVehicles])

  // cambio pagina
  useEffect(() => {
    fetchVehicles(search, statusFilter, offset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  const refetch = () => fetchVehicles(search, statusFilter, offset)

  useEffect(() => {
    if (!historyV) return
    const load = async () => {
      setHistoryLoading(true)
      try {
        const res = await api.get<any>(`/vehicles/${historyV.id}/history`)
        setHistory(Array.isArray(res) ? res : res?.data ?? [])
      } finally {
        setHistoryLoading(false)
      }
    }
    load()
  }, [historyV])

  const handleDelete = async () => {
    if (!deleteV) return
    setDelLoading(true)
    try {
      await api.delete(`/vehicles/${deleteV.id}`)
      refetch()
      setDeleteV(null)
    } finally {
      setDelLoading(false)
    }
  }

  const handleUnassign = async (v: Vehicle) => {
    try {
      await api.patch(`/vehicles/${v.id}/unassign`, {})
      refetch()
    } catch {}
  }

  const totalPages = Math.ceil(data.total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  if (loading && data.items.length === 0) return <PageLoader />

  return (
    <div className="page-fade">
      <div className="page-hd">
        <div>
          <h1>Veicoli</h1>
          <p>{data.total} veicoli nella flotta</p>
        </div>
        {isAdmin && <Btn onClick={() => setShowForm(true)}>＋ Nuovo</Btn>}
      </div>

      {isAdmin && (
        <div style={{ marginBottom: 16 }}>
          <VehicleImport onImported={refetch} />
        </div>
      )}

      <div className="filter-bar">
        <input
          placeholder="Cerca targa, brand, modello..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setOffset(0) }}>
          <option value="">Tutti gli stati</option>
          <option value="available">Disponibili</option>
          <option value="assigned">Assegnati</option>
          <option value="maintenance">Manutenzione</option>
        </select>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: '.85rem' }}>Caricamento...</div>}

      {!loading && data.items.length === 0 ? (
        <Empty icon="🚗" title="Nessun veicolo" sub="Aggiungi il primo veicolo alla flotta" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Targa</th>
                  <th>Veicolo</th>
                  <th>Anno</th>
                  <th>Km</th>
                  <th>Stato</th>
                  {isAdmin && <th>Assegnato a</th>}
                  {isAdmin && <th>Azioni</th>}
                </tr>
              </thead>
              <tbody>
                {data.items.map(v => (
                  <tr key={v.id} onClick={() => setHistoryV(v)} style={{ cursor: 'pointer' }}>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-h)', fontSize: '.8rem' }}>
                        {v.license_plate}
                      </code>
                    </td>
                    <td><strong>{v.brand}</strong> {v.model}</td>
                    <td style={{ color: 'var(--text-3)' }}>{v.year}</td>
                    <td style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: '.8rem' }}>
                      {v.mileage?.toLocaleString() ?? '—'}
                    </td>
                    <td><Badge status={v.status} /></td>
                    {isAdmin && (
                      <td style={{ color: 'var(--text-2)', fontSize: '.85rem' }}>
                        {v.assigned_to ? `${v.assigned_to.first_name} ${v.assigned_to.last_name}` : '—'}
                      </td>
                    )}
                    {isAdmin && (
                      <td>
                        <div className="vehicle-actions" onClick={e => e.stopPropagation()}>
                          <Btn variant="ghost" size="sm" onClick={() => setEditV(v)}>✎</Btn>
                          {v.status === 'available' && (
                            <Btn variant="ghost" size="sm" onClick={() => setAssignV(v)}>↗</Btn>
                          )}
                          {v.status === 'assigned' && (
                            <Btn variant="ghost" size="sm" onClick={() => handleUnassign(v)}>↙</Btn>
                          )}
                          <Btn variant="danger" size="sm" onClick={() => setDeleteV(v)}>✕</Btn>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
              <Btn variant="ghost" size="sm" disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - LIMIT))}>
                ← Prec
              </Btn>
              <span style={{ fontSize: '.85rem', color: 'var(--text-3)' }}>
                Pagina {currentPage} di {totalPages}
              </span>
              <Btn variant="ghost" size="sm" disabled={offset + LIMIT >= data.total} onClick={() => setOffset(o => o + LIMIT)}>
                Succ →
              </Btn>
            </div>
          )}
        </>
      )}

      {(showForm || editV) && (
        <VehicleForm
          vehicle={editV}
          onClose={() => { setShowForm(false); setEditV(null) }}
          onSaved={refetch}
        />
      )}

      {assignV && (
        <AssignModal vehicle={assignV} onClose={() => setAssignV(null)} onSaved={refetch} />
      )}

      {deleteV && (
        <Modal
          title="Elimina Veicolo"
          onClose={() => setDeleteV(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setDeleteV(null)}>Annulla</Btn>
              <Btn variant="danger" loading={delLoading} onClick={handleDelete}>Elimina</Btn>
            </>
          }
        >
          <div className="confirm-dialog">
            <p>Stai per eliminare il veicolo</p>
            <strong>{deleteV.brand} {deleteV.model} — {deleteV.license_plate}</strong>
            <p style={{ marginTop: 8 }}>Questa azione non è reversibile.</p>
          </div>
        </Modal>
      )}

      {historyV && (
        <SlideOver
          title={`${historyV.brand} ${historyV.model}`}
          sub={historyV.license_plate}
          icon="🚗"
          onClose={() => setHistoryV(null)}
        >
          <div className="so-section-title">
            Storico assegnazioni <span>{history?.length ?? 0}</span>
          </div>
          {historyLoading ? (
            <p style={{ color: 'var(--text-3)' }}>Caricamento...</p>
          ) : (
            <AssignmentTimeline assignments={history ?? []} mode="vehicle" />
          )}
        </SlideOver>
      )}
    </div>
  )
}
