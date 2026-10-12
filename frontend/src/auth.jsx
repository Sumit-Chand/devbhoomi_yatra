import { createContext, useContext, useState } from 'react'
import { api } from './api.js'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

const saved = () => { try { return JSON.parse(localStorage.getItem('dby_user')) } catch { return null } }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(saved)
  function saveSession({ token, user }) {
    localStorage.setItem('dby_token', token)
    localStorage.setItem('dby_user', JSON.stringify(user))
    setUser(user)
  }
  async function login(body) {
    const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(body) })
    if (result.token && result.user) saveSession(result)
    return result
  }
  async function register(body) {
    const result = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(body) })
    if (result.token && result.user) saveSession(result)
    return result
  }
  const logout = () => { localStorage.removeItem('dby_token'); localStorage.removeItem('dby_user'); setUser(null) }
  return (
    <Ctx.Provider value={{ user, login, register, logout }}>
      {children}
    </Ctx.Provider>
  )
}
