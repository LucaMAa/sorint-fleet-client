import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import { logout as apiLogout } from '../api/client'

interface AuthCtx {
  user: User | null
  login:   (user: User) => void
  logout:  () => void
  isAdmin: boolean
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('fleet_user') ?? 'null')
    } catch {
      return null
    }
  })

  const login = useCallback((u: User) => {
    localStorage.setItem('fleet_user', JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    apiLogout()
  }, [])

  return (
    <Ctx.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth outside AuthProvider')
  return c
}
