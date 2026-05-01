import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../api/client'
import { Btn, Input, Alert } from '../../components/ui'
import type { AuthResponse } from '../../types'
import './auth.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

function RegistrationSuccessPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="reg-popup-overlay" onClick={onClose}>
      <div className="reg-popup" onClick={e => e.stopPropagation()}>
        <div className="reg-popup-icon">✉️</div>
        <h2 className="reg-popup-title">Richiesta inviata!</h2>
        <p className="reg-popup-body">
          La tua richiesta di accesso è stata ricevuta.<br />
          Un amministratore la esaminerà a breve.<br />
          <strong>Riceverai accesso non appena verrà approvata.</strong>
        </p>
        <Btn onClick={onClose} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          Capito, grazie!
        </Btn>
      </div>
    </div>
  )
}

// Componente separato e stabile per il bottone Google.
// Vive fuori da LoginPage così non viene mai smontato/rimontato
// quando LoginPage fa re-render per i cambi di stato del form.
function GoogleButton({ onCredential }: { onCredential: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Usiamo una ref per il callback così Google SDK punta sempre
  // alla versione più recente senza che noi dobbiamo re-inizializzare
  const onCredentialRef = useRef(onCredential)
  onCredentialRef.current = onCredential

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const init = () => {
      if (!window.google || !containerRef.current) return false

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res: { credential: string }) => onCredentialRef.current(res.credential),
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: containerRef.current.offsetWidth || 348,
        text: 'signin_with',
        shape: 'rectangular',
      })

      return true
    }

    if (!init()) {
      const interval = setInterval(() => { if (init()) clearInterval(interval) }, 100)
      const timeout = setTimeout(() => clearInterval(interval), 10_000)
      return () => { clearInterval(interval); clearTimeout(timeout) }
    }
  // Deps vuote: questo useEffect gira una sola volta al mount del componente
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} style={{ width: '100%', minHeight: 44 }} />
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRegSuccess, setShowRegSuccess] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  // Anche questo usiamo una ref così GoogleButton non vede mai
  // una prop che cambia referenza tra un render e l'altro
  const handleGoogleCredential = async (idToken: string) => {
    setGLoading(true)
    setError('')
    try {
      const res = await api.post<AuthResponse>('/auth/google', { token: idToken })
      login(res.token, res.user)
      if (res.must_change_password || res.user?.must_change_password) {
        navigate('/change-password', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (e) {
      const msg = (e as Error).message
      if (msg === 'account_pending') {
        setShowRegSuccess(true)
      } else {
        setError(msg)
      }
    } finally {
      setGLoading(false)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'register') {
        await api.post('/auth/register', form)
        setShowRegSuccess(true)
        setForm({ first_name: '', last_name: '', email: '', password: '' })
        setMode('login')
      } else {
        const res = await api.post<AuthResponse>(
          '/auth/login',
          { email: form.email, password: form.password }
        )
        login(res.token, res.user)
        if (res.must_change_password || res.user?.must_change_password) {
          navigate('/change-password', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (e) {
      const msg = (e as Error).message
      if (msg === 'account_pending') {
        setShowRegSuccess(true)
      } else if (msg === 'account_rejected') {
        setError("Il tuo account è stato rifiutato. Contatta l'amministratore.")
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showRegSuccess && (
        <RegistrationSuccessPopup onClose={() => setShowRegSuccess(false)} />
      )}

      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo-wrap">🚐</div>
          <h1 className="auth-title">Fleet Management</h1>
          <p className="auth-sub">
            {mode === 'login' ? 'Accedi alla piattaforma' : 'Crea un nuovo account'}
          </p>

          {GOOGLE_CLIENT_ID ? (
            <>
              {/* GoogleButton è un componente separato: non si smonta mai
                  anche quando LoginPage fa re-render per i cambi del form */}
              <GoogleButton onCredential={handleGoogleCredential} />
              {gLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem', color: 'var(--text-3)', marginTop: 6 }}>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Accesso con Google in corso...
                </div>
              )}
              <div className="auth-divider">oppure</div>
            </>
          ) : import.meta.env.DEV ? (
            <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--yellow-bg)', borderRadius: 'var(--r-sm)', fontSize: '.75rem', color: 'var(--yellow)' }}>
              💡 Imposta <code>VITE_GOOGLE_CLIENT_ID</code> nel file <code>.env</code> per abilitare Google OAuth
            </div>
          ) : null}

          <form className="auth-form" onSubmit={submit}>
            <Alert type="error">{error}</Alert>
            {mode === 'register' && (
              <div className="auth-row">
                <Input
                  label="Nome"
                  placeholder="Mario"
                  required
                  value={form.first_name}
                  onChange={e => set('first_name', e.target.value)}
                />
                <Input
                  label="Cognome"
                  placeholder="Rossi"
                  required
                  value={form.last_name}
                  onChange={e => set('last_name', e.target.value)}
                />
              </div>
            )}
            <Input
              label="Email"
              type="email"
              placeholder="mario@sorint.it"
              required
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              value={form.password}
              onChange={e => set('password', e.target.value)}
            />
            <Btn
              type="submit"
              loading={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {mode === 'login' ? 'Accedi' : 'Registrati'}
            </Btn>
          </form>

          <div className="auth-footer">
            {mode === 'login' ? (
              <>
                Non hai un account?{' '}
                <button onClick={() => { setMode('register'); setError('') }}>
                  Registrati
                </button>
              </>
            ) : (
              <>
                Hai già un account?{' '}
                <button onClick={() => { setMode('login'); setError('') }}>
                  Accedi
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
