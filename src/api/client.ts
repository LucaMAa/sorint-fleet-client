const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('fleet_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    localStorage.removeItem('fleet_token')
    localStorage.removeItem('fleet_user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
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
