import { useState } from 'react'
import { useApi } from '../api.js'

export default function Destinations() {
  const { loading, error, data } = useApi('/api/places')
  const [district, setDistrict] = useState('All')
  const all = data?.places || []
  const districts = ['All', ...[...new Set(all.map(p => p.district))].sort()]
  const list = all.filter(p => district === 'All' || p.district === district)
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine">Destinations</h1>
      <p className="mt-1 text-ink/70">Sample listings across all 13 districts. Altitudes and seasons are approximate.</p>
      <label className="mt-5 block font-medium max-w-xs">District
        <select className="mt-1 w-full border border-pine/30 rounded-md px-3 py-2 bg-white" value={district} onChange={e => setDistrict(e.target.value)}>
          {districts.map(d => <option key={d}>{d}</option>)}
        </select>
      </label>
      {loading && <p className="mt-6">Loading destinations</p>}
      {error && <p className="mt-6 text-red-800">Could not load destinations: {error}</p>}
      <p className="mt-4 text-sm text-ink/70">{list.length} places</p>
      <ul className="mt-2 grid gap-4 sm:grid-cols-2">
        {list.map(p => (
          <li key={p.id} className="bg-white border border-pine/15 rounded-lg p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <span className="text-sm text-ink/70">{p.altitude.toLocaleString('en-IN')} m</span>
            </div>
            <p className="text-sm text-pine mt-1">{p.district}, {p.region}. Best in {p.season}</p>
            <ul className="mt-3 list-disc pl-5">{p.highlights.map(h => <li key={h}>{h}</li>)}</ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
