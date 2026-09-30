import { useEffect, useState } from 'react'

// Dev: '' (Vite proxy). Production: set VITE_API_URL to your deployed backend.
const BASE = import.meta.env.VITE_API_URL || ''

export async function api(path, options = {}) {
  const token = localStorage.getItem('dby_token')
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status })
  return data
}

// Loads a GET endpoint: { loading, error, data }
export function useApi(path) {
  const [s, setS] = useState({ loading: true, error: '', data: null })
  useEffect(() => {
    let off = false
    api(path).then(data => !off && setS({ loading: false, error: '', data }))
      .catch(e => !off && setS({ loading: false, error: e.message, data: null }))
    return () => { off = true }
  }, [path])
  return s
}
