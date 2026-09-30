import { useState } from 'react'
import { api } from '../api.js'
import { categories } from '../data.js'

export default function Report() {
  const [form, setForm] = useState({ category: categories[0], description: '', location: '' })
  const [state, setState] = useState({ busy: false, error: '', id: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setState({ busy: true, error: '', id: '' })
    try {
      const r = await api('/api/reports', { method: 'POST', body: JSON.stringify(form) })
      setState({ busy: false, error: '', id: r.id })
      setForm(f => ({ ...f, description: '', location: '' }))
    } catch {
      setState({ busy: false, id: '', error: 'Could not send your report. Check your connection and try again.' })
    }
  }

  const field = 'mt-1 w-full border border-pine/30 rounded-md px-3 py-2 bg-white'
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine">Report an issue</h1>
      <p className="mt-1 text-ink/70">Tell us about a road, trail or waste problem. This is a demo and reports are not sent to authorities yet.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block font-medium">Type of issue
          <select className={field} value={form.category} onChange={set('category')}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="block font-medium">Location
          <input className={field} value={form.location} onChange={set('location')} required maxLength={200} placeholder="Village, trail or road name" />
        </label>
        <label className="block font-medium">What did you see?
          <textarea className={field} rows={4} value={form.description} onChange={set('description')} required maxLength={1000} />
        </label>
        <button disabled={state.busy} className="bg-pine text-snow font-semibold px-5 py-3 rounded-md disabled:opacity-60">
          {state.busy ? 'Sending report' : 'Send report'}
        </button>
      </form>
      <div aria-live="polite" className="mt-4">
        {state.id && <p className="bg-glacier rounded-md p-3">Report sent. Your reference is <strong>{state.id}</strong>.</p>}
        {state.error && <p className="bg-red-50 text-red-800 rounded-md p-3">{state.error}</p>}
      </div>
    </div>
  )
}
