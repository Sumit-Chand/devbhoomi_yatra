import { useState } from 'react'
import { useApi } from '../api.js'

const interests = [
  ['trek', 'Trekking'],
  ['spiritual', 'Temples and spirituality'],
  ['wildlife', 'Wildlife'],
  ['snow', 'Snow'],
  ['adventure', 'Adventure'],
  ['relax', 'Relaxation'],
  ['views', 'Mountain views'],
  ['culture', 'Culture'],
  ['nature', 'Nature'],
]
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Destinations() {
  const { loading, error, data } = useApi('/api/places')
  const [district, setDistrict] = useState('All')
  const [region, setRegion] = useState('Any')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [selectedInterests, setSelectedInterests] = useState([])
  const all = data?.places || []
  const districts = ['All', ...[...new Set(all.map(p => p.district))].sort()]
  const list = all.filter(p => district === 'All' || p.district === district)
  const recommendations = all
    .filter(place => region === 'Any' || place.region === region)
    .map(place => {
      const matchedInterests = selectedInterests.filter(interest => place.tags.includes(interest))
      const inSeason = place.months?.includes(Number(month)) || false
      return { ...place, matchedInterests, inSeason, score: matchedInterests.length * 2 + (inSeason ? 3 : 0) }
    })
    .filter(place => selectedInterests.length === 0 || place.matchedInterests.length > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 3)

  function toggleInterest(interest) {
    setSelectedInterests(current => current.includes(interest)
      ? current.filter(value => value !== interest)
      : [...current, interest])
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine">Destinations</h1>
      <p className="mt-1 text-ink/70">Curated destination information across Uttarakhand. Altitudes, seasons and highlights are approximate; confirm local access, permits and conditions before travel.</p>
      <section className="mt-8 rounded-lg border border-pine/15 bg-glacier/40 p-5" aria-labelledby="recommendations-heading">
        <h2 id="recommendations-heading" className="text-2xl font-semibold text-pine">Find places for your trip</h2>
        <p className="mt-1 text-sm text-ink/70">Suggestions are matched from destination tags and their listed best months. They are a transparent guide, not a trained machine-learning model or a safety recommendation.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block font-medium">Region
            <select className="mt-1 w-full border border-pine/30 rounded-md px-3 py-2 bg-white" value={region} onChange={e => setRegion(e.target.value)}>
              <option value="Any">Any region</option>
              <option value="Garhwal">Garhwal</option>
              <option value="Kumaon">Kumaon</option>
            </select>
          </label>
          <label className="block font-medium">Travel month
            <select className="mt-1 w-full border border-pine/30 rounded-md px-3 py-2 bg-white" value={month} onChange={e => setMonth(e.target.value)}>
              {months.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
            </select>
          </label>
        </div>
        <fieldset className="mt-4">
          <legend className="font-medium">What are you interested in?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {interests.map(([value, label]) => {
              const selected = selectedInterests.includes(value)
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleInterest(value)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${selected ? 'border-pine bg-pine text-snow' : 'border-pine/30 bg-white text-pine hover:bg-glacier'}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>
        {loading && <p className="mt-4">Loading places to match</p>}
        {!loading && !error && selectedInterests.length === 0 && (
          <p className="mt-4">Select one or more interests to get suggestions matched to this region and season.</p>
        )}
        {!loading && !error && selectedInterests.length > 0 && recommendations.length === 0 && (
          <p className="mt-4">No matching places were found for this region. Try another region or interest.</p>
        )}
        {recommendations.length > 0 && selectedInterests.length > 0 && (
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {recommendations.map((place, index) => (
              <li key={place.id} className="rounded-lg border border-pine/15 bg-white p-4">
                <p className="text-sm font-semibold text-pine">Suggestion {index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{place.name}</h3>
                <p className="text-sm text-ink/70">{place.district}, {place.region}</p>
                <p className="mt-2 text-sm">
                  {place.matchedInterests.length > 0 && `Matches: ${place.matchedInterests.map(key => interests.find(([value]) => value === key)?.[1]).join(', ')}.`}
                  {place.inSeason ? ' Listed as a best month to visit.' : ' Outside its listed best months; check local conditions.'}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
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
