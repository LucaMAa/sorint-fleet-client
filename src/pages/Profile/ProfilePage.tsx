import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Btn, Input, Badge, Alert, Modal } from '../../components/ui'
import { useToast } from '../../components/ui/index'
import { api } from '../../api/client'
import './profile.css'

export function ProfilePage() {
  const { user, login, token, logout } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()

  // ── Profile form ─────────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')

  // ── Email change form ─────────────────────────────────────────────────────────
  const [emailForm, setEmailForm] = useState({ new_email: '' })
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')
  const [emailErr, setEmailErr] = useState('')

  // ── Password form ─────────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')

  // ── Delete / disable account ──────────────────────────────────────────────────
  const [showDisable, setShowDisable] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableLoading, setDisableLoading] = useState(false)
  const [disableErr, setDisableErr] = useState('')

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : '?'

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setProfileMsg('')
    setProfileErr('')
    setProfileLoading(true)
    try {
      const updated = await api.patch<typeof user>('/profile', profileForm)
      // Update local auth state so the sidebar/topbar shows new name
      if (updated && user && token) {
        login(token, { ...user, ...profileForm })
      }
      setProfileMsg('Profilo aggiornato con successo')
      success('Profilo aggiornato ✓')
    } catch (e) {
      const msg = (e as Error).message
      setProfileErr(msg)
      toastError(msg)
    } finally {
      setProfileLoading(false)
    }
  }

  const requestEmailChange = async (e: FormEvent) => {
    e.preventDefault()
    setEmailMsg('')
    setEmailErr('')
    setEmailLoading(true)
    try {
      await api.post('/profile/request-email-change', emailForm)
      setEmailMsg(
        `Ti abbiamo inviato un link di conferma a ${emailForm.new_email}. Clicca il link per completare il cambio email.`
      )
      setEmailForm({ new_email: '' })
      success('Email di conferma inviata ✓')
    } catch (e) {
      const msg = (e as Error).message
      setEmailErr(msg === 'email already in use' ? 'Questa email è già utilizzata da un altro account' : msg)
    } finally {
      setEmailLoading(false)
    }
  }

  const changePassword = async (e: FormEvent) => {
    e.preventDefault()
    setPwMsg('')
    setPwErr('')

    if (pwForm.new_password !== pwForm.confirm) {
      setPwErr('Le nuove password non coincidono')
      return
    }
    if (pwForm.new_password.length < 8) {
      setPwErr('La password deve essere di almeno 8 caratteri')
      return
    }

    setPwLoading(true)
    try {
      await api.post('/profile/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      setPwForm({ current_password: '', new_password: '', confirm: '' })
      setPwMsg('Password aggiornata con successo')
      success('Password aggiornata ✓')
    } catch (e) {
      const msg = (e as Error).message
      setPwErr(msg === 'password attuale non corretta' ? 'La password attuale non è corretta' : msg)
    } finally {
      setPwLoading(false)
    }
  }

  const disableAccount = async () => {
    setDisableErr('')
    setDisableLoading(true)
    try {
      await api.post('/profile/disable', { password: disablePassword })
      success('Account disabilitato')
      logout()
      navigate('/login', { replace: true })
    } catch (e) {
      const msg = (e as Error).message
      setDisableErr(msg === 'password non corretta' ? 'Password non corretta' : msg)
    } finally {
      setDisableLoading(false)
    }
  }

  return (
    <div className="page-fade">
      <div className="page-hd">
        <div>
          <h1>Profilo</h1>
          <p>Gestisci i tuoi dati personali</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* ── Left column: avatar card ─────────────────────────────────────── */}
        <div>
          <div className="profile-card" style={{ marginBottom: 14 }}>
            <div className="profile-avatar">{initials}</div>
            <div className="profile-name">{user?.first_name} {user?.last_name}</div>
            <div className="profile-email">{user?.email}</div>
            <div className="profile-badge-wrap">
              <Badge status={user?.role ?? 'user'} />
            </div>
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

          {/* Danger zone */}
          <div
            className="profile-card"
            style={{
              marginTop: 14,
              borderColor: 'rgba(248,113,113,.3)',
              background: 'var(--red-bg)',
            }}
          >
            <div
              style={{
                fontSize: '.75rem',
                fontWeight: 700,
                letterSpacing: '.07em',
                textTransform: 'uppercase',
                color: 'var(--red)',
                marginBottom: 8,
              }}
            >
              Zona pericolosa
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.5 }}>
              Disabilitare l'account renderà impossibile l'accesso. Dovrai contattare un amministratore per riabilitarlo.
            </p>
            <Btn
              variant="danger"
              size="sm"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setShowDisable(true); setDisableErr(''); setDisablePassword('') }}
            >
              Disabilita Account
            </Btn>
          </div>
        </div>

        {/* ── Right column: forms ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Personal info */}
          <div className="form-section">
            <h2>Informazioni Personali</h2>
            <form onSubmit={saveProfile}>
              {profileMsg && <Alert type="success">{profileMsg}</Alert>}
              {profileErr && <Alert type="error">{profileErr}</Alert>}
              <div className="form-grid">
                <Input
                  label="Nome *"
                  value={profileForm.first_name}
                  onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                  required
                />
                <Input
                  label="Cognome *"
                  value={profileForm.last_name}
                  onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                  required
                />
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Btn type="submit" loading={profileLoading}>Salva Modifiche</Btn>
              </div>
            </form>
          </div>

          {/* Email change */}
          <div className="form-section">
            <h2>Cambia Email</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.5 }}>
              Email attuale: <code style={{ color: 'var(--accent-h)', fontFamily: 'var(--font-mono)' }}>{user?.email}</code>
              <br />
              Inserisci la nuova email: ti invieremo un link di conferma.
            </p>
            <form onSubmit={requestEmailChange}>
              {emailMsg && <Alert type="success">{emailMsg}</Alert>}
              {emailErr && <Alert type="error">{emailErr}</Alert>}
              <Input
                label="Nuova Email *"
                type="email"
                placeholder="nuova@email.it"
                value={emailForm.new_email}
                onChange={e => setEmailForm({ new_email: e.target.value })}
                required
              />
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Btn type="submit" loading={emailLoading}>Invia Conferma</Btn>
              </div>
            </form>
          </div>

          {/* Password change */}
          <div className="form-section">
            <h2>Cambia Password</h2>
            <form onSubmit={changePassword}>
              {pwMsg && <Alert type="success">{pwMsg}</Alert>}
              {pwErr && <Alert type="error">{pwErr}</Alert>}
              <div className="form-grid">
                <Input
                  label="Password Attuale *"
                  type="password"
                  value={pwForm.current_password}
                  onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))}
                  required
                  className="full"
                />
                <Input
                  label="Nuova Password *"
                  type="password"
                  placeholder="min. 8 caratteri"
                  value={pwForm.new_password}
                  onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                  required
                />
                <Input
                  label="Conferma Password *"
                  type="password"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  required
                />
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Btn type="submit" loading={pwLoading}>Aggiorna Password</Btn>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* ── Disable account modal ────────────────────────────────────────────── */}
      {showDisable && (
        <Modal
          title="Disabilita Account"
          onClose={() => setShowDisable(false)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setShowDisable(false)}>Annulla</Btn>
              <Btn
                variant="danger"
                loading={disableLoading}
                onClick={disableAccount}
                disabled={!disablePassword}
              >
                Disabilita
              </Btn>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ color: 'var(--text-2)', fontSize: '.9rem', lineHeight: 1.6 }}>
              Stai per <strong style={{ color: 'var(--red)' }}>disabilitare il tuo account</strong>.<br />
              Non potrai più accedere finché un amministratore non lo riabiliterà.<br />
              Inserisci la tua password per confermare.
            </p>
            {disableErr && <Alert type="error">{disableErr}</Alert>}
            <Input
              label="Password *"
              type="password"
              placeholder="Inserisci la tua password"
              value={disablePassword}
              onChange={e => setDisablePassword(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
