import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAuth } from './AuthContext'

interface NotifCtx {
  pendingCount: number
  setPendingCount: (n: number) => void
}

const Ctx = createContext<NotifCtx>({ pendingCount: 0, setPendingCount: () => {} })

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useWebSocket(
    useCallback(
      (event) => {
        if (!isAdmin) return
        if (event.type === 'new_pending_user') {
          setPendingCount((n) => n + 1)
        }
      },
      [isAdmin]
    )
  )

  return (
    <Ctx.Provider value={{ pendingCount, setPendingCount }}>
      {children}
    </Ctx.Provider>
  )
}

export const useNotifications = () => useContext(Ctx)
