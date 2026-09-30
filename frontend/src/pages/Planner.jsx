import { useState } from 'react'
import { api } from '../api.js'

const toInput = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const today = toInput(new Date())

export default function Planner() {
  const [f, setF] = useState({ startDate: toInput(new Date(Date.now() + 7 * 864e5)), days: 3, region: 'Garhwal', interests: '' })
  const [s, setS] = useState({ busy: false, error: '', result: null })
  const set = k => e => setF(x => ({ ...x, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setS({ busy: true, error: '', result: null })
    try {
      const result = await api('/api/ai/plan-trip', { method: 'POST', body: JSON.stringify(f) })
      setS({ busy: false, error: '', result })
    } catch (x) { setS({ busy: false, error: x.message, result: null }) }
  }
  const field = 'mt-1 w-full border border-pine/30 rounded-md px-3 py-2 bg-white'
  const r = s.result
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine">Trip planner</h1>
      <p className="mt-1 text-ink/70">Pick your dates and interests. We choose places that suit the season and show the next stop on the way.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block font-medium">Start date
          <input type="date" min={today} className={field} value={f.startDate} onChange={set('startDate')} required />
        </label>
        <label className="block font-medium">Number of days
          <input type="number" min="1" max="10" className={field} value={f.days} onChange={set('days')} required />
        </label>
        <label className="block font-medium">Region
          <select className={field} value={f.region} onChange={set('region')}><option>Garhwal</option><option>Kumaon</option></select>
        </label>
        <label className="block font-medium">What do you enjoy?
          <input className={field} value={f.interests} onChange={set('interests')} maxLength={200} placeholder="Trekking, temples, wildlife, snow" />
        </label>
        <button disabled={s.busy} className="bg-pine text-snow font-semibold px-5 py-3 rounded-md disabled:opacity-60 sm:col-span-2 justify-self-start">
          {s.busy ? 'Planning your trip' : 'Plan my trip'}
        </button>
      </form>

      <div aria-live="polite" className="mt-6 space-y-5">
        {s.error && <p className="bg-red-50 text-red-800 rounded-md p-3">{s.error}</p>}
        {r && (
          <>
            <section>
              <h2 className="text-xl font-semibold text-pine">Your route</h2>
              <ol className="mt-3 space-y-3">
                {r.route.map((st, i) => (
                  <li key={st.name} className="bg-white border border-pine/15 rounded-lg p-4">
                    {st.leg && <p className="text-sm text-pine mb-1">Next stop from {st.from}: about {st.leg.km} km, {st.leg.h} h by road</p>}
                    {!st.leg && st.from && <p className="text-sm text-pine mb-1">Next stop from {st.from}: check the road distance locally</p>}
                    <h3 className="font-semibold text-lg">{st.name} <span className="font-normal text-ink/70">({st.days} {st.days === 1 ? 'day' : 'days'})</span></h3>
                    <p className="text-sm text-ink/70">Best months: {st.season}</p>
                    {!st.inSeason && <p className="mt-1 text-sm bg-marigold/30 rounded px-2 py-1 inline-block">Outside the best months, so check weather and road access.</p>}
                    <p className="mt-2">{st.tip}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-pine">Day by day</h2>
              <ul className="mt-3 space-y-2">
                {r.itinerary.map(d => (
                  <li key={d.day} className="bg-white border border-pine/15 rounded-lg p-3">
                    <p className="font-semibold">Day {d.day}{d.date ? `, ${d.date}` : ''}: {d.place}</p>
                    <p>{d.text}</p>
                  </li>
                ))}
              </ul>
            </section>
            {r.plan && <section className="bg-glacier rounded-lg p-4"><h2 className="font-semibold text-pine">Overview and tips</h2><div className="mt-2 whitespace-pre-wrap">{r.plan}</div></section>}
            {r.aiError && <p className="bg-glacier rounded-md p-3">{r.aiError}</p>}
            <p className="text-sm text-ink/70">Places, distances and seasons are approximate sample data. Distances are estimated from map positions, so travel between different valleys can take much longer than shown. Confirm road, weather and permit status locally before you travel.</p>
          </>
        )}
      </div>
    </div>
  )
}
