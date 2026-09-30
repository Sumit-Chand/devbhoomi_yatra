import { createContext, useContext, useState } from 'react'
import { api } from './api.js'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

const saved = () => { try { return JSON.parse(localStorage.getItem('dby_user')) } catch { return null } }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(saved)
  async function enter(path, body) {
    const { token, user } = await api(path, { method: 'POST', body: JSON.stringify(body) })
    localStorage.setItem('dby_token', token)
    localStorage.setItem('dby_user', JSON.stringify(user))
    setUser(user)
  }
  const logout = () => { localStorage.removeItem('dby_token'); localStorage.removeItem('dby_user'); setUser(null) }
  return (
    <Ctx.Provider value={{ user, login: b => enter('/api/auth/login', b), register: b => enter('/api/auth/register', b), logout }}>
      {children}
    </Ctx.Provider>
  )
}
