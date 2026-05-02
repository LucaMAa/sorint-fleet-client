import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api/client'
import { Btn, Input, Alert } from '../../components/ui'
import '../Login/auth.css'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const [form, setForm] = useState({ new_password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    if (form.new_password !== form.confirm) { setError('Le password non coincidono'); return }
    if (!token) { setError('Token mancante'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: form.new_password })
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo-wrap">🔑</div>
        <h1 className="auth-title">Nuova Password</h1>
        <p className="auth-sub">Scegli una password sicura per il tuo account</p>

        {done
          ? <Alert type="success">Password aggiornata! Verrai reindirizzato al login...</Alert>
          : (
            <form className="auth-form" onSubmit={submit}>
              <Alert type="error">{error}</Alert>
              <Input label="Nuova Password" type="password" placeholder="min. 8 caratteri"
                required minLength={8} value={form.new_password}
                onChange={e => set('new_password', e.target.value)} />
              <Input label="Conferma Password" type="password" placeholder="ripeti la password"
                required value={form.confirm}
                onChange={e => set('confirm', e.target.value)} />
              <Btn type="submit" loading={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                Aggiorna Password
              </Btn>
            </form>
          )
        }
      </div>
    </div>
  )
}
