import { useState, type FormEvent } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Btn, Input, Badge, Alert } from '../../components/ui'
import './profile.css'

export function ProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ first_name: user?.first_name ?? '', last_name: user?.last_name ?? '', email: user?.email ?? '' })
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const setPw = (k: string, v: string) => setPwForm(p => ({ ...p, [k]: v }))

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault(); setMsg(''); setErr('')
    setMsg('Profilo aggiornato (funzionalità non ancora disponibile via API)')
  }

  const changePassword = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    if (pwForm.next !== pwForm.confirm) { setErr('Le password non coincidono'); return }
    if (pwForm.next.length < 8) { setErr('Minimo 8 caratteri'); return }
    setMsg('Password aggiornata (funzionalità non ancora disponibile via API)')
  }

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?'

  return (
    <div className="page-fade">
      <div className="page-hd"><div><h1>Profilo</h1><p>Gestisci i tuoi dati personali</p></div></div>

      {msg && <Alert type="success">{msg}</Alert>}
      {err && <Alert type="error">{err}</Alert>}

      <div className="profile-grid">
        <div>
          <div className="profile-card" style={{ marginBottom: 14 }}>
            <div className="profile-avatar">{initials}</div>
            <div className="profile-name">{user?.first_name} {user?.last_name}</div>
            <div className="profile-email">{user?.email}</div>
            <div className="profile-badge-wrap"><Badge status={user?.role ?? 'user'} /></div>
          </div>

          {user?.assigned_vehicles && user.assigned_vehicles.length > 0 && (
            <div className="profile-card profile-vehicles">
              <h3>Veicoli Assegnati</h3>
              {user.assigned_vehicles.map(v => (
                <div key={v.id} className="veh-item">
                  <span className="veh-plate">{v.license_plate}</span>
                  <span style={{ fontSize: '.875rem' }}>{v.brand} {v.model}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-section">
            <h2>Informazioni Personali</h2>
            <form onSubmit={saveProfile}>
              <div className="form-grid">
                <Input label="Nome" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
                <Input label="Cognome" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
                <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} required className="full" />
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Btn type="submit">Salva Modifiche</Btn>
              </div>
            </form>
          </div>

          <div className="form-section">
            <h2>Cambia Password</h2>
            <form onSubmit={changePassword}>
              <div className="form-grid">
                <Input label="Password Attuale" type="password" value={pwForm.current} onChange={e => setPw('current', e.target.value)} required className="full" />
                <Input label="Nuova Password" type="password" placeholder="min. 8 caratteri" value={pwForm.next} onChange={e => setPw('next', e.target.value)} required />
                <Input label="Conferma" type="password" value={pwForm.confirm} onChange={e => setPw('confirm', e.target.value)} required />
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Btn type="submit">Aggiorna Password</Btn>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
