import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { Btn, Alert } from '../../components/ui'
import '../Login/auth.css'

export function ConfirmEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token mancante o non valido.')
      return
    }

    api
      .post('/confirm-email', { token })
      .then(() => {
        setStatus('success')
        setMessage('Email aggiornata con successo! Effettua di nuovo il login con la nuova email.')
        // After 4s redirect to login so the user re-authenticates with new email
        setTimeout(() => navigate('/login', { replace: true }), 4000)
      })
      .catch((e: Error) => {
        setStatus('error')
        setMessage(e.message || 'Token non valido o scaduto.')
      })
  }, [token, navigate])

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo-wrap">✉️</div>
        <h1 className="auth-title">Conferma Email</h1>

        {status === 'loading' && (
          <p className="auth-sub">Verifica in corso…</p>
        )}

        {status === 'success' && (
          <>
            <Alert type="success">{message}</Alert>
            <p style={{ color: 'var(--text-3)', fontSize: '.85rem', marginTop: 12 }}>
              Verrai reindirizzato al login tra pochi secondi…
            </p>
            <Btn
              style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
              onClick={() => navigate('/login', { replace: true })}
            >
              Vai al Login
            </Btn>
          </>
        )}

        {status === 'error' && (
          <>
            <Alert type="error">{message}</Alert>
            <Btn
              variant="ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
              onClick={() => navigate('/profile', { replace: true })}
            >
              Torna al Profilo
            </Btn>
          </>
        )}
      </div>
    </div>
  )
}
