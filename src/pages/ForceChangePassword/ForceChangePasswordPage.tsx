import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../api/client'
import { Btn, Input, Alert } from '../../components/ui'
import '../Login/auth.css'

export function ForceChangePasswordPage() {
  const { user, login, token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ new_password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.new_password !== form.confirm) {
      setError('Le password non coincidono')
      return
    }
    if (form.new_password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        new_password: form.new_password,
        // current_password vuoto: il backend lo bypassa se must_change_password=true
        current_password: '',
      })

      // aggiorna lo stato utente locale rimuovendo must_change_password
      if (user && token) {
        login(token, { ...user, must_change_password: false })
      }
      navigate('/dashboard', { replace: true })
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
        <h1 className="auth-title">Imposta la tua password</h1>
        <p className="auth-sub">
          È il tuo primo accesso. Scegli una password sicura per continuare.
        </p>

        <form className="auth-form" onSubmit={submit}>
          <Alert type="error">{error}</Alert>
          <Input
            label="Nuova Password"
            type="password"
            placeholder="minimo 8 caratteri"
            required
            minLength={8}
            value={form.new_password}
            onChange={e => set('new_password', e.target.value)}
          />
          <Input
            label="Conferma Password"
            type="password"
            placeholder="ripeti la password"
            required
            value={form.confirm}
            onChange={e => set('confirm', e.target.value)}
          />
          <Btn
            type="submit"
            loading={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            Imposta Password e Accedi
          </Btn>
        </form>
      </div>
    </div>
  )
}
