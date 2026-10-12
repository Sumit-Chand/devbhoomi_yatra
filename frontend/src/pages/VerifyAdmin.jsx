import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'

export default function VerifyAdmin() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState({ busy: false, error: '', complete: false })

  async function verify() {
    setState({ busy: true, error: '', complete: false })
    try {
      await api('/api/auth/verify-admin', { method: 'POST', body: JSON.stringify({ token }) })
      setState({ busy: false, error: '', complete: true })
    } catch (error) {
      setState({ busy: false, error: error.message, complete: false })
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine">Verify admin email</h1>
      {!token && <p className="mt-4 text-red-800">This verification link is missing its token. Log in with the configured admin email to request a new link.</p>}
      {token && !state.complete && (
        <>
          <p className="mt-4">Use this one-time link to confirm ownership of the configured admin email address. It expires after 30 minutes.</p>
          <button onClick={verify} disabled={state.busy} className="mt-5 bg-pine text-snow font-semibold px-5 py-3 rounded-md disabled:opacity-60">
            {state.busy ? 'Verifying' : 'Verify email'}
          </button>
        </>
      )}
      {state.error && <p role="alert" className="mt-4 text-red-800">{state.error}</p>}
      {state.complete && <p role="status" className="mt-4 bg-glacier rounded-md p-3">Admin email verified. You can now log in.</p>}
      <p className="mt-5"><Link className="underline text-pine" to="/login">Go to login</Link></p>
    </div>
  )
}
