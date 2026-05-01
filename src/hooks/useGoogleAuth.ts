import { useEffect, useCallback } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void
          prompt: () => void
          renderButton: (el: HTMLElement, cfg: object) => void
          cancel: () => void
        }
      }
    }
  }
}

interface Options {
  onCredential: (idToken: string) => void
  buttonEl?: HTMLElement | null
}

export function useGoogleAuth({ onCredential, buttonEl }: Options) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  const init = useCallback(() => {
    if (!clientId || !window.google) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (res: { credential: string }) => onCredential(res.credential),
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    if (buttonEl) {
      window.google.accounts.id.renderButton(buttonEl, {
        theme: 'outline',
        size: 'large',
        width: buttonEl.offsetWidth || 320,
        text: 'signin_with',
        shape: 'rectangular',
      })
    }
  }, [clientId, onCredential, buttonEl])

  useEffect(() => {
    if (window.google) { init(); return }
    const t = setInterval(() => { if (window.google) { init(); clearInterval(t) } }, 100)
    const timeout = setTimeout(() => clearInterval(t), 5000)
    return () => { clearInterval(t); clearTimeout(timeout) }
  }, [init])

  return { available: !!clientId }
}
