import { useRef, useEffect } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

interface Props { onCredential: (token: string) => void }

export function GoogleButton({ onCredential }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} style={{ width: '100%', minHeight: 44 }} />
}

export { GOOGLE_CLIENT_ID }
