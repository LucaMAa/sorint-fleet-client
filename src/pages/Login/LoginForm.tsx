import { type FormEvent } from 'react'
import { Btn, Input, Alert } from '../../components/ui'
import type { Mode } from './LoginPage'

interface Props {
  mode: 'login' | 'register'
  form: { first_name: string; last_name: string; email: string; password: string }
  loading: boolean
  error: string
  onChange: (k: string, v: string) => void
  onSubmit: (e: FormEvent) => void
  onForgot: () => void
}

export function LoginForm({ mode, form, loading, error, onChange, onSubmit, onForgot }: Props) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <Alert type="error">{error}</Alert>

      {mode === 'register' && (
        <div className="auth-row">
          <Input label="Nome" placeholder="Mario" required
            value={form.first_name} onChange={e => onChange('first_name', e.target.value)} />
          <Input label="Cognome" placeholder="Rossi" required
            value={form.last_name} onChange={e => onChange('last_name', e.target.value)} />
        </div>
      )}

      <Input label="Email" type="email" placeholder="mario@sorint.it" required
        value={form.email} onChange={e => onChange('email', e.target.value)} />

      <Input label="Password" type="password" placeholder="••••••••" required minLength={8}
        value={form.password} onChange={e => onChange('password', e.target.value)} />

      {mode === 'login' && (
        <div style={{ textAlign: 'right', marginTop: -6 }}>
          <button type="button" onClick={onForgot}
            style={{ fontSize: '.8rem', color: 'var(--accent-h)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Password dimenticata?
          </button>
        </div>
      )}

      <Btn type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
        {mode === 'login' ? 'Accedi' : 'Registrati'}
      </Btn>
    </form>
  )
}

export type { Mode }
