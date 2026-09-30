import { useApi } from '../api.js'

const tone = { Warning: 'bg-red-100 text-red-900', Watch: 'bg-marigold/30 text-ink', Info: 'bg-glacier text-pine' }

export default function Alerts() {
  const { loading, error, data } = useApi('/api/alerts')
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine">Travel alerts</h1>
      {data?.demo && <p className="mt-1 text-ink/70">These are sample alerts, not live warnings.</p>}
      {loading && <p className="mt-6">Loading alerts</p>}
      {error && <p className="mt-6 text-red-800">Could not load alerts: {error}</p>}
      {data && !data.alerts.length && <p className="mt-6">No alerts right now.</p>}
      <ul className="mt-6 space-y-3">
        {data?.alerts.map(a => (
          <li key={a.id} className="bg-white border border-pine/15 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold px-2 py-0.5 rounded ${tone[a.level] || tone.Info}`}>{a.level}</span>
              <h2 className="font-semibold">{a.title}</h2>
            </div>
            <p className="mt-2">{a.detail}</p>
            <p className="mt-1 text-sm text-ink/70">Area: {a.area}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
