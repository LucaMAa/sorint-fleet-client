import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../api/client'
import type { AuthResponse } from '../../types'
import { GoogleButton, GOOGLE_CLIENT_ID } from './GoogleButton'
import { RegistrationSuccessPopup } from './RegistrationSuccessPopup'
import { LoginForm } from './LoginForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { AuthFooter } from './AuthFooter'
import './auth.css'

export type Mode = 'login' | 'register' | 'forgot'

const SUBTITLES: Record<Mode, string> = {
  login:    'Accedi alla piattaforma',
  register: 'Crea un nuovo account',
  forgot:   'Recupera la tua password',
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode]               = useState<Mode>('login')
  const [loading, setLoading]         = useState(false)
  const [gLoading, setGLoading]       = useState(false)
  const [error, setError]             = useState('')
  const [forgotSent, setForgotSent]   = useState(false)
  const [showRegSuccess, setShowRegSuccess] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' })

  const setField = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setForgotSent(false)
  }

  const handleGoogleCredential = async (idToken: string) => {
    setGLoading(true); setError('')
    try {
      const res = await api.post<AuthResponse>('/auth/google', { token: idToken })
      login(res.token, res.user)
      navigate(
        res.must_change_password || res.user?.must_change_password
          ? '/change-password' : '/dashboard',
        { replace: true }
      )
    } catch (e) {
      const msg = (e as Error).message
      if (msg === 'account_pending') setShowRegSuccess(true)
      else setError(msg)
    } finally {
      setGLoading(false)
    }
  }

  const submitAuth = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      if (mode === 'register') {
        await api.post('/auth/register', form)
        setShowRegSuccess(true)
        setForm({ first_name: '', last_name: '', email: '', password: '' })
        switchMode('login')
      } else {
        const res = await api.post<AuthResponse>('/auth/login', {
          email: form.email, password: form.password,
        })
        login(res.token, res.user)
        navigate(
          res.must_change_password || res.user?.must_change_password
            ? '/change-password' : '/dashboard',
          { replace: true }
        )
      }
    } catch (e) {
      const msg = (e as Error).message
      if (msg === 'account_pending') setShowRegSuccess(true)
      else if (msg === 'account_rejected') setError("Il tuo account è stato rifiutato. Contatta l'amministratore.")
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const submitForgot = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await api.post('/auth/request-reset', { email: form.email })
      setForgotSent(true)
    } catch (e) {
      setError((e as Error).message)
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
          <p className="auth-sub">{SUBTITLES[mode]}</p>

          {mode !== 'forgot' && GOOGLE_CLIENT_ID && (
            <>
              <GoogleButton onCredential={handleGoogleCredential} />
              {gLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem', color: 'var(--text-3)', marginTop: 6 }}>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Accesso con Google in corso...
                </div>
              )}
              <div className="auth-divider">oppure</div>
            </>
          )}

          {import.meta.env.DEV && mode !== 'forgot' && !GOOGLE_CLIENT_ID && (
            <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--yellow-bg)', borderRadius: 'var(--r-sm)', fontSize: '.75rem', color: 'var(--yellow)' }}>
              💡 Imposta <code>VITE_GOOGLE_CLIENT_ID</code> nel file <code>.env</code> per abilitare Google OAuth
            </div>
          )}

          {mode !== 'forgot' && (
            <LoginForm
              mode={mode}
              form={form}
              loading={loading}
              error={error}
              onChange={setField}
              onSubmit={submitAuth}
              onForgot={() => switchMode('forgot')}
            />
          )}

          {mode === 'forgot' && (
            <ForgotPasswordForm
              email={form.email}
              loading={loading}
              error={error}
              sent={forgotSent}
              onChange={v => setField('email', v)}
              onSubmit={submitForgot}
            />
          )}

          <AuthFooter mode={mode} onSwitch={switchMode} />
        </div>
      </div>
    </>
  )
}
