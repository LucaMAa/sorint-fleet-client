import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '../types'

interface AuthCtx {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAdmin: boolean
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fleet_token'))
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('fleet_user') ?? 'null') } catch { return null }
  })

  const login = useCallback((t: string, u: User) => {
    localStorage.setItem('fleet_token', t)
    localStorage.setItem('fleet_user', JSON.stringify(u))
    setToken(t); setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fleet_token')
    localStorage.removeItem('fleet_user')
    setToken(null); setUser(null)
  }, [])

  return (
    <Ctx.Provider value={{ user, token, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth outside AuthProvider')
  return c
}
