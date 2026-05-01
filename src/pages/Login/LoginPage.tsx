import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../api/client'
import { Btn, Input, Alert } from '../../components/ui'
import { useGoogleAuth } from '../../hooks/useGoogleAuth'
import type { AuthResponse } from '../../types'
import './auth.css'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' })
  const googleBtnRef = useRef<HTMLDivElement>(null)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleGoogleCredential = async (idToken: string) => {
    setGLoading(true); setError('')
    try {
      const res = await api.post<AuthResponse>('/auth/google', { token: idToken })
      login(res.token, res.user)
      navigate('/dashboard')
    } catch (e) { setError((e as Error).message) }
    finally { setGLoading(false) }
  }

  const { available: googleAvailable } = useGoogleAuth({
    onCredential: handleGoogleCredential,
    buttonEl: googleBtnRef.current,
  })

  useEffect(() => {
    if (!googleBtnRef.current || !window.google) return
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline', size: 'large',
      width: googleBtnRef.current.offsetWidth || 348,
      text: 'signin_with', shape: 'rectangular',
    })
  }, [mode, googleAvailable])

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await api.post<AuthResponse>(
        mode === 'login' ? '/auth/login' : '/auth/register',
        mode === 'login' ? { email: form.email, password: form.password } : form
      )
      login(res.token, res.user)
      navigate('/dashboard')
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo-wrap">🚐</div>
        <h1 className="auth-title">Fleet Management</h1>
        <p className="auth-sub">{mode === 'login' ? 'Accedi alla piattaforma' : 'Crea un nuovo account'}</p>

        {googleAvailable && (
          <>
            <div ref={googleBtnRef} style={{ width: '100%', minHeight: 44 }} />
            {gLoading && (
              <button className="btn-google" disabled style={{ marginTop: 6 }}>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                Accesso con Google...
              </button>
            )}
            <div className="auth-divider">oppure</div>
          </>
        )}

        {!googleAvailable && import.meta.env.DEV && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--yellow-bg)', borderRadius: 'var(--r-sm)', fontSize: '.75rem', color: 'var(--yellow)' }}>
            💡 Imposta <code>VITE_GOOGLE_CLIENT_ID</code> nel file <code>.env</code> per abilitare Google OAuth
          </div>
        )}

        <form className="auth-form" onSubmit={submit}>
          <Alert type="error">{error}</Alert>
          {mode === 'register' && (
            <div className="auth-row">
              <Input label="Nome" placeholder="Mario" required value={form.first_name} onChange={e => set('first_name', e.target.value)} />
              <Input label="Cognome" placeholder="Rossi" required value={form.last_name} onChange={e => set('last_name', e.target.value)} />
            </div>
          )}
          <Input label="Email" type="email" placeholder="mario@sorint.it" required value={form.email} onChange={e => set('email', e.target.value)} />
          <Input label="Password" type="password" placeholder="••••••••" required minLength={8} value={form.password} onChange={e => set('password', e.target.value)} />
          <Btn type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {mode === 'login' ? 'Accedi' : 'Registrati'}
          </Btn>
        </form>

        <div className="auth-footer">
          {mode === 'login'
            ? <>Non hai un account? <button onClick={() => { setMode('register'); setError('') }}>Registrati</button></>
            : <>Hai già un account? <button onClick={() => { setMode('login'); setError('') }}>Accedi</button></>}
        </div>
      </div>
    </div>
  )
}
