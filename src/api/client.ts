const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (res.status === 401) {
    hardLogout()
    throw new Error('Unauthorized')
  }

  if (res.status === 204) return undefined as T

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)

  return (json.data ?? json) as T
}

export const api = {
  get:    <T>(url: string)                  => req<T>(url),
  post:   <T>(url: string, body: unknown)   => req<T>(url, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(url: string, body: unknown)   => req<T>(url, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(url: string)                  => req<T>(url, { method: 'DELETE' }),
}

export async function logout() {
  try {
    await fetch(`${BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
  } catch {
  }
  hardLogout()
}

function hardLogout() {
  localStorage.removeItem('fleet_user')
  window.location.href = '/login'
}
