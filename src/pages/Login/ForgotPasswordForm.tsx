import { type FormEvent } from 'react'
import { Btn, Input, Alert } from '../../components/ui'

interface Props {
  email: string
  loading: boolean
  error: string
  sent: boolean
  onChange: (v: string) => void
  onSubmit: (e: FormEvent) => void
}

export function ForgotPasswordForm({ email, loading, error, sent, onChange, onSubmit }: Props) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <Alert type="error">{error}</Alert>

      {sent ? (
        <Alert type="success">
          Se l'email è registrata riceverai le istruzioni a breve.
        </Alert>
      ) : (
        <>
          <Input label="Email" type="email" placeholder="mario@sorint.it" required
            value={email} onChange={e => onChange(e.target.value)} />
          <Btn type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            Invia link di reset
          </Btn>
        </>
      )}
    </form>
  )
}
