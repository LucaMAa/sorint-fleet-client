import { useEffect, useRef, useCallback } from 'react'

export interface WsEvent {
  type: string
  payload: unknown
}

type Handler = (event: WsEvent) => void

const WS_URL = (() => {
  const base = import.meta.env.VITE_API_URL ?? ''
  if (base) {
    try {
      const u = new URL(base)
      return `${u.protocol === 'https:' ? 'wss' : 'ws'}://${u.host}/ws`
    } catch {}
  }
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/ws`
})()

export function useWebSocket(onEvent: Handler) {
  const ws = useRef<WebSocket | null>(null)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    const socket = new WebSocket(WS_URL)
    ws.current = socket

    socket.onmessage = (e) => {
      try {
        const data: WsEvent = JSON.parse(e.data)
        onEventRef.current(data)
      } catch {}
    }

    socket.onclose = () => {
      setTimeout(connect, 3000)
    }

    socket.onerror = () => {
      socket.close()
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      ws.current?.close()
    }
  }, [connect])
}
