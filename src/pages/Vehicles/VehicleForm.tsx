import { useEffect, useState, type FormEvent } from 'react'
import { Modal, Btn, Input, Select, Alert } from '../../components/ui'
import { api } from '../../api/client'
import type { Vehicle, Brand, Model, UpdateVehicleDto } from '../../types'
import { useToast } from '../../components/ui/index'

interface Props {
  vehicle?: Vehicle | null
  onClose: () => void
  onSaved: () => void
}

export function VehicleForm({ vehicle, onClose, onSaved }: Props) {
  const isEdit = !!vehicle
  const toast = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])

  const [form, setForm] = useState({
    license_plate: vehicle?.license_plate ?? '',
    brand: vehicle?.brand ?? '',
    model: vehicle?.model ?? '',
    year: vehicle?.year ?? new Date().getFullYear(),
    color: vehicle?.color ?? '',
    fuel_type: vehicle?.fuel_type ?? 'gas',
    mileage: vehicle?.mileage ?? 0,
    notes: vehicle?.notes ?? '',
    jolly: vehicle?.jolly ?? false,
    jolly_duration: vehicle?.jolly_duration ?? 0,
  })

  const set = (k: string, v: string | number | boolean) =>
    setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    api.get<Brand[]>('/vehicle-meta/brands').then(setBrands).catch(() => setBrands([]))
  }, [])

  useEffect(() => {
    if (!form.brand) { setModels([]); return }
    api.get<Model[]>(`/vehicle-meta/models?brand=${encodeURIComponent(form.brand)}`)
      .then(setModels).catch(() => setModels([]))
  }, [form.brand])

  const buildPatchPayload = (): UpdateVehicleDto => {
    if (!vehicle) return form

    const payload: UpdateVehicleDto = {}
    if (form.license_plate !== vehicle.license_plate) payload.license_plate = form.license_plate
    if (form.brand !== vehicle.brand) payload.brand = form.brand
    if (form.model !== vehicle.model) payload.model = form.model
    if (form.year !== vehicle.year) payload.year = form.year
    if (form.color !== vehicle.color) payload.color = form.color
    if (form.fuel_type !== vehicle.fuel_type) payload.fuel_type = form.fuel_type
    if (form.mileage !== vehicle.mileage) payload.mileage = form.mileage
    if (form.notes !== vehicle.notes) payload.notes = form.notes
    if (form.jolly !== vehicle.jolly) payload.jolly = form.jolly
    if (form.jolly_duration !== vehicle.jolly_duration) payload.jolly_duration = form.jolly_duration
    return payload
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isEdit) {
        await api.patch(`/vehicles/${vehicle!.id}`, buildPatchPayload())
        toast.success('Veicolo aggiornato 🚗')
      } else {
        await api.post('/vehicles', form)
        toast.success('Veicolo creato 🚗')
      }
      onSaved()
      onClose()
    } catch (e) {
      const msg = (e as Error).message
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Modifica Veicolo' : 'Nuovo Veicolo'}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Annulla</Btn>
          <Btn type="submit" form="vf" loading={loading}>{isEdit ? 'Salva' : 'Crea'}</Btn>
        </>
      }
    >
      <form id="vf" onSubmit={submit}>
        <Alert type="error">{error}</Alert>
        <div className="form-grid">
          <Input
            label="Targa *"
            value={form.license_plate}
            onChange={e => set('license_plate', e.target.value)}
            required
          />
          <>
            <Input
              label="Brand *"
              value={form.brand}
              onChange={e => { set('brand', e.target.value); set('model', '') }}
              list="brands"
              required
            />
            <datalist id="brands">
              {brands.map(b => <option key={b.ID} value={b.Name} />)}
            </datalist>
          </>
          <>
            <Input
              label="Modello *"
              value={form.model}
              onChange={e => set('model', e.target.value)}
              list={models.length ? 'models' : undefined}
              required
            />
            {models.length > 0 && (
              <datalist id="models">
                {models.map(m => <option key={m.ID} value={m.Name} />)}
              </datalist>
            )}
          </>
          <Input
            label="Anno *"
            type="number"
            min={1900}
            max={new Date().getFullYear() + 1}
            value={form.year ?? ''}
            onChange={e => set('year', e.target.value === '' ? '' : +e.target.value)}
            required
          />
          <Input
            label="Colore"
            value={form.color}
            onChange={e => set('color', e.target.value)}
          />
          <Select
            label="Carburante"
            value={form.fuel_type}
            onChange={e => set('fuel_type', e.target.value)}
          >
            <option value="gas">Benzina</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Elettrico</option>
            <option value="hybrid">Ibrido</option>
          </Select>
          <Input
            label="Km"
            type="number"
            min={0}
            value={form.mileage ?? ''}
            onChange={e => set('mileage', e.target.value === '' ? '' : +e.target.value)}
          />
          <Input
            label="Note"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            className="full"
          />

          {/* Jolly */}
          <div className="full" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.jolly}
                onChange={e => {
                  set('jolly', e.target.checked)
                  if (!e.target.checked) set('jolly_duration', 0)
                }}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '.875rem', fontWeight: 600 }}>
                Auto Jolly
              </span>
              <span style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>
                — disponibile per assegnazioni temporanee
              </span>
            </label>

            {form.jolly && (
              <Input
                label="Durata massima (giorni) *"
                type="number"
                min={1}
                value={form.jolly_duration || ''}
                onChange={e => set('jolly_duration', e.target.value === '' ? 0 : +e.target.value)}
                required
              />
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}
