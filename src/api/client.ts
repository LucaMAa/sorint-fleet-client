const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

let isRefreshing = false
let queue: (() => void)[] = []

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('fleet_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as any),
  }

  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    const refresh = localStorage.getItem('fleet_refresh')

    if (!refresh) {
      hardLogout()
      throw new Error('Unauthorized')
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push(() => resolve(req<T>(path, init)))
      })
    }

    isRefreshing = true

    try {
      const r = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      })

      if (!r.ok) throw new Error()

      const data = await r.json()

      const newToken = data.token
      const newRefresh = data.refresh_token

      localStorage.setItem('fleet_token', newToken)
      localStorage.setItem('fleet_refresh', newRefresh)

      queue.forEach(cb => cb())
      queue = []

      return req<T>(path, init)
    } catch {
      hardLogout()
      throw new Error('Session expired')
    } finally {
      isRefreshing = false
    }
  }

  if (res.status === 204) return undefined as T

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)

  return (json.data ?? json) as T
}

export const api = {
  get: <T>(url: string) => req<T>(url),
  post: <T>(url: string, body: unknown) => req<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) => req<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string) => req<T>(url, { method: 'DELETE' }),
}

export async function logout() {
  const refresh = localStorage.getItem('fleet_refresh')

  try {
    if (refresh) {
      await fetch(`${BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      })
    }
  } catch {
  }

  hardLogout()
}


function hardLogout() {
  localStorage.removeItem('fleet_token')
  localStorage.removeItem('fleet_refresh')
  localStorage.removeItem('fleet_user')
  window.location.href = '/login'
}
