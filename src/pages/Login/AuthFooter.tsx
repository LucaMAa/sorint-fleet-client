import type { Mode } from './LoginPage'

interface Props {
  mode: Mode
  onSwitch: (mode: Mode) => void
}

export function AuthFooter({ mode, onSwitch }: Props) {
  return (
    <div className="auth-footer">
      {mode === 'login' && (
        <>
          Non hai un account?{' '}
          <button onClick={() => onSwitch('register')}>Registrati</button>
        </>
      )}
      {mode === 'register' && (
        <>
          Hai già un account?{' '}
          <button onClick={() => onSwitch('login')}>Accedi</button>
        </>
      )}
      {mode === 'forgot' && (
        <button onClick={() => onSwitch('login')}>← Torna al login</button>
      )}
    </div>
  )
}
