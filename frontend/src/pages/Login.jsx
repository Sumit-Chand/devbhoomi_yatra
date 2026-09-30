import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const { login, register } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = k => e => setF(x => ({ ...x, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      await (mode === 'login' ? login({ email: f.email, password: f.password }) : register(f))
      nav(loc.state?.from || '/planner', { replace: true })
    } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  const field = 'mt-1 w-full border border-pine/30 rounded-md px-3 py-2 bg-white'
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine">{mode === 'login' ? 'Log in' : 'Create your account'}</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'register' && <label className="block font-medium">Name<input className={field} value={f.name} onChange={set('name')} required maxLength={60} autoComplete="name" /></label>}
        <label className="block font-medium">Email<input type="email" className={field} value={f.email} onChange={set('email')} required autoComplete="email" /></label>
        <label className="block font-medium">Password<input type="password" className={field} value={f.password} onChange={set('password')} required minLength={mode === 'register' ? 8 : undefined} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          {mode === 'register' && <span className="text-sm text-ink/70 font-normal">At least 8 characters.</span>}
        </label>
        <button disabled={busy} className="bg-pine text-snow font-semibold px-5 py-3 rounded-md disabled:opacity-60">
          {busy ? 'Please wait' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
      <p aria-live="polite" className="mt-3 text-red-800">{err}</p>
      <button className="mt-4 underline text-pine" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr('') }}>
        {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
      </button>
    </div>
  )
}
