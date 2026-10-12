import { useState } from 'react'
import { api, useApi } from '../api.js'

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
  const { data: feedbackData } = useApi('/api/recommendation-feedback/summary')
  const [district, setDistrict] = useState('All')
  const [region, setRegion] = useState('Any')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [selectedInterests, setSelectedInterests] = useState([])
  const [ratings, setRatings] = useState({})
  const [feedbackState, setFeedbackState] = useState({ busyId: '', ratedIds: [], message: '', error: '' })
  const all = data?.places || []
  const districts = ['All', ...[...new Set(all.map(p => p.district))].sort()]
  const ratingSummary = new Map((feedbackData?.ratings || []).map(summary => [summary.destinationId, summary]))
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

  async function rateRecommendation(place, rating) {
    setFeedbackState(current => ({ ...current, busyId: place.id, message: '', error: '' }))
    try {
      await api('/api/recommendation-feedback', {
        method: 'POST',
        body: JSON.stringify({
          destinationId: place.id,
          rating,
          region,
          month: Number(month),
          interests: selectedInterests,
        }),
      }, { includeAuth: false })
      setFeedbackState(current => ({
        ...current,
        busyId: '',
        ratedIds: [...current.ratedIds, place.id],
        message: 'Thanks. Your anonymous rating was saved.',
      }))
    } catch (requestError) {
      setFeedbackState(current => ({ ...current, busyId: '', error: requestError.message }))
    }
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
                {ratingSummary.has(place.id) && (
                  <p className="mt-2 text-sm text-ink/70">
                    Visitor suggestion rating: {ratingSummary.get(place.id).averageRating}/5
                    {' · '}{ratingSummary.get(place.id).count} anonymous ratings
                  </p>
                )}
                {feedbackState.ratedIds.includes(place.id)
                  ? <p role="status" className="mt-3 text-sm text-pine">{feedbackState.message}</p>
                  : (
                    <fieldset className="mt-3" disabled={feedbackState.busyId === place.id}>
                      <legend className="text-sm font-medium">How useful is this suggestion?</legend>
                      <div className="mt-1 flex gap-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => rateRecommendation(place, rating)}
                            aria-label={`${rating} out of 5`}
                            className="rounded border border-pine/30 bg-white px-2 py-1 text-sm hover:bg-glacier disabled:opacity-60"
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}
                {feedbackState.busyId === place.id && <p className="mt-2 text-sm" role="status">Saving rating</p>}
                {feedbackState.error && feedbackState.busyId === '' && !feedbackState.ratedIds.includes(place.id) && <p role="alert" className="mt-2 text-sm text-red-800">{feedbackState.error}</p>}
              </li>
            ))}
          </ol>
        )}
        <p className="mt-4 text-xs text-ink/70">Feedback is optional. If you submit a rating, the application stores only the destination, rating, selected interests, region, and month—not your name, email, account, or a browser/session ID. The rating request is sent without your login token. Aggregate rating summaries are public.</p>
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
            {p.sources?.map(source => (
              <p key={source.url} className="mt-3 text-sm text-ink/70">
                Source for {source.verifiedFields.join(', ')}: <a className="underline" href={source.url} target="_blank" rel="noreferrer">{source.organization}</a>
                {' · Checked '}{source.checkedAt}
              </p>
            ))}
            {p.operationalStatus === 'unknown' && (
              <p className="mt-2 text-sm text-ink/70">Current opening/access status: not verified live. Confirm with the relevant local authority before travel.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
