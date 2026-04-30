import { useState, type FormEvent } from 'react'
import { Modal, Btn, Input, Select, Alert } from '../../components/ui'
import { api } from '../../api/client'
import type { Vehicle } from '../../types'

interface Props {
  vehicle?: Vehicle | null
  onClose: () => void
  onSaved: () => void
}

export function VehicleForm({ vehicle, onClose, onSaved }: Props) {
  const isEdit = !!vehicle
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    license_plate: vehicle?.license_plate ?? '',
    brand: vehicle?.brand ?? '',
    model: vehicle?.model ?? '',
    year: vehicle?.year ?? new Date().getFullYear(),
    color: vehicle?.color ?? '',
    fuel_type: vehicle?.fuel_type ?? 'gas',
    mileage: vehicle?.mileage ?? 0,
    notes: vehicle?.notes ?? '',
  })

  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      if (isEdit) await api.patch(`/vehicles/${vehicle!.id}`, form)
      else await api.post('/vehicles', form)
      onSaved()
      onClose()
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={isEdit ? 'Modifica Veicolo' : 'Nuovo Veicolo'} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Annulla</Btn><Btn type="submit" form="vf" loading={loading}>{isEdit ? 'Salva' : 'Crea'}</Btn></>}>
      <form id="vf" onSubmit={submit}>
        <Alert type="error">{error}</Alert>
        <div className="form-grid">
          <Input label="Targa *" value={form.license_plate} onChange={e => set('license_plate', e.target.value)} required placeholder="AA000BB" />
          <Input label="Brand *" value={form.brand} onChange={e => set('brand', e.target.value)} required placeholder="Toyota" />
          <Input label="Modello *" value={form.model} onChange={e => set('model', e.target.value)} required placeholder="Corolla" />
          <Input label="Anno *" type="number" min={1900} max={new Date().getFullYear() + 1} value={form.year} onChange={e => set('year', +e.target.value)} required />
          <Input label="Colore" value={form.color} onChange={e => set('color', e.target.value)} placeholder="Bianco" />
          <Select label="Carburante" value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)}>
            <option value="gas">Benzina</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Elettrico</option>
            <option value="hybrid">Ibrido</option>
          </Select>
          <Input label="Km" type="number" min={0} value={form.mileage} onChange={e => set('mileage', +e.target.value)} />
          <Input label="Note" value={form.notes} onChange={e => set('notes', e.target.value)} className="full" />
        </div>
      </form>
    </Modal>
  )
}
