import { useEffect, useRef, useState } from 'react'
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
const districtCoverIds = {
  Almora: 'almora',
  Bageshwar: 'bageshwar',
  Chamoli: 'badrinath',
  Champawat: 'champawat',
  Dehradun: 'dehradun',
  Haridwar: 'haridwar',
  Nainital: 'nainital',
  'Pauri Garhwal': 'lansdowne',
  Pithoragarh: 'pithoragarh',
  Rudraprayag: 'kedarnath',
  'Tehri Garhwal': 'tehri',
  'Udham Singh Nagar': 'nanakmatta',
  Uttarkashi: 'uttarkashi',
}

function PhotoTile({ title, image, subtitle, loading, onClick, label }) {
  const caption = loading ? 'Loading photo…' : `${image ? '' : 'Photo unavailable · '}${subtitle}`

  return (
    <div className="relative overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-pine via-emerald-900 to-sky-900 text-left shadow-sm transition hover:shadow-lg focus-visible:outline"
      >
        {image && (
          <img
            src={image.thumbnailUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/10" />
        <span className="absolute inset-x-0 bottom-0 p-4 text-white">
          <span className="block text-lg font-bold drop-shadow sm:text-xl">{title}</span>
          <span className="mt-1 block text-sm text-white/90">{caption}</span>
        </span>
      </button>
      {image && (
        <a
          href={image.pageUrl}
          target="_blank"
          rel="noreferrer"
          title={`Photo by ${image.artist}, licensed ${image.license}`}
          aria-label={`Photo attribution: ${image.artist}, ${image.license}; open Wikimedia Commons file`}
          className="absolute right-2 top-2 z-10 max-w-[90%] truncate rounded bg-black/65 px-2 py-1 text-xs text-white underline underline-offset-2"
        >
          {image.artist} · {image.license}
        </a>
      )}
    </div>
  )
}

export default function Destinations() {
  const { loading, error, data } = useApi('/api/places')
  const { data: feedbackData } = useApi('/api/recommendation-feedback/summary')
  const { loading: activitiesLoading, error: activitiesError, data: activitiesData } = useApi('/api/adventure-activities')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [region, setRegion] = useState('Any')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [selectedInterests, setSelectedInterests] = useState([])
  const [feedbackState, setFeedbackState] = useState({ busyId: '', ratedIds: [], message: '', error: '' })
  const [localRatings, setLocalRatings] = useState({})
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [gallery, setGallery] = useState({ loading: false, error: '', images: [] })
  const [thumbnails, setThumbnails] = useState({})
  const galleryRequest = useRef(0)
  const all = data?.places || []
  const groupedPlaces = new Map()
  all.forEach(place => groupedPlaces.set(place.district, [...(groupedPlaces.get(place.district) || []), place]))
  const districts = [...groupedPlaces.keys()].sort()
  const ratingSummary = new Map((feedbackData?.ratings || []).map(summary => [summary.destinationId, summary]))
  const districtPlaces = groupedPlaces.get(selectedDistrict) || []
  const adventureDistricts = activitiesData?.districts || []
  const visibleAdventureDistricts = selectedDistrict
    ? adventureDistricts.filter(item => item.district === selectedDistrict)
    : adventureDistricts
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

  useEffect(() => {
    if (!all.length) return
    const coverIds = districts.map(name => districtCoverIds[name]).filter(Boolean)
    loadThumbnails(coverIds)
  }, [data])

  useEffect(() => {
    if (!selectedDistrict) return
    loadThumbnails(districtPlaces.map(place => place.id))
  }, [selectedDistrict, data])

  useEffect(() => {
    if (!selectedPlace) return undefined
    const onKeyDown = event => {
      if (event.key === 'Escape') setSelectedPlace(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedPlace])

  async function loadThumbnails(ids) {
    const missingIds = ids.filter(id => !thumbnails[id])
    if (!missingIds.length) return
    setThumbnails(current => {
      const next = { ...current }
      missingIds.forEach(id => { next[id] = { loading: true } })
      return next
    })
    try {
      const result = await api(`/api/place-thumbnails?ids=${encodeURIComponent(missingIds.join(','))}`, {}, { includeAuth: false })
      setThumbnails(current => ({ ...current, ...result.thumbnails }))
    } catch (requestError) {
      setThumbnails(current => ({
        ...current,
        ...Object.fromEntries(missingIds.map(id => [id, { error: requestError.message }])),
      }))
    }
  }

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
          region: place.region,
          month: Number(month),
          interests: selectedInterests.filter(interest => place.tags.includes(interest)),
        }),
      }, { includeAuth: false })
      setLocalRatings(current => {
        const previous = current[place.id] || []
        return { ...current, [place.id]: [...previous, rating] }
      })
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

  async function openPlace(place) {
    const requestId = ++galleryRequest.current
    setSelectedPlace(place)
    setGallery({ loading: true, error: '', images: [] })
    try {
      const result = await api(`/api/places/${encodeURIComponent(place.id)}/images`, {}, { includeAuth: false })
      if (galleryRequest.current === requestId) {
        setGallery({ loading: false, error: '', images: result.images || [], updatedAt: result.updatedAt, source: result.source })
      }
    } catch (requestError) {
      if (galleryRequest.current === requestId) setGallery({ loading: false, error: requestError.message, images: [] })
    }
  }

  function closePlace() {
    galleryRequest.current += 1
    setSelectedPlace(null)
    setGallery({ loading: false, error: '', images: [] })
  }

  function ratingFor(placeId) {
    const stored = ratingSummary.get(placeId)
    const recent = localRatings[placeId] || []
    const totalCount = (stored?.count || 0) + recent.length
    const totalRating = (stored ? stored.averageRating * stored.count : 0) + recent.reduce((sum, rating) => sum + rating, 0)
    return totalCount ? { count: totalCount, averageRating: Math.round(totalRating / totalCount * 10) / 10 } : null
  }

  function ratePlace(place) {
    const summary = ratingFor(place.id)
    return (
      <>
        {summary
          ? <p className="mt-2 text-sm text-ink/70">Suggestion usefulness: {summary.averageRating}/5 · {summary.count} anonymous {summary.count === 1 ? 'rating' : 'ratings'}</p>
          : <p className="mt-2 text-sm text-ink/70">No feedback yet. Be the first to rate this suggestion.</p>}
        {feedbackState.ratedIds.includes(place.id)
          ? <p role="status" className="mt-3 text-sm text-pine">Thanks. Your anonymous rating was saved.</p>
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
      </>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine">Destinations</h1>
      <p className="mt-1 text-ink/70">Curated destination information across Uttarakhand. Altitudes, seasons and highlights are approximate; confirm local access, permits and conditions before travel.</p>
      <details className="mt-6 rounded-lg border border-pine/15 bg-glacier/40 p-5">
        <summary className="cursor-pointer font-semibold text-pine">Optional trip recommender</summary>
      <section className="mt-4" aria-labelledby="recommendations-heading">
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
                <h3 className="mt-1 text-lg font-semibold">
                  <button type="button" className="text-left underline decoration-pine/40 underline-offset-2 hover:decoration-pine" onClick={() => openPlace(place)} aria-haspopup="dialog">
                    {place.name}
                  </button>
                </h3>
                <p className="text-sm text-ink/70">{place.district}, {place.region}</p>
                <p className="mt-2 text-sm">
                  {place.matchedInterests.length > 0 && `Matches: ${place.matchedInterests.map(key => interests.find(([value]) => value === key)?.[1]).join(', ')}.`}
                  {place.inSeason ? ' Listed as a best month to visit.' : ' Outside its listed best months; check local conditions.'}
                </p>
                {ratePlace(place)}
              </li>
            ))}
          </ol>
        )}
        <p className="mt-4 text-xs text-ink/70">Feedback is optional. If you submit a rating, the application stores only the destination, rating, selected interests, region, and month—not your name, email, account, or a browser/session ID. The rating request is sent without your login token. Aggregate rating summaries are public.</p>
      </section>
      </details>
      {loading && <p className="mt-6">Loading destinations</p>}
      {error && <p className="mt-6 text-red-800">Could not load destinations: {error}</p>}
      <section className="mt-8" aria-labelledby="districts-heading">
        {!selectedDistrict ? (
          <>
            <h2 id="districts-heading" className="text-2xl font-semibold text-pine">Explore by district</h2>
            <p className="mt-1 text-sm text-ink/70">Choose a district to see its destinations. Photo availability varies; district names stay visible even when no matched photo is available.</p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {districts.map(name => {
                const placeId = districtCoverIds[name]
                const cover = thumbnails[placeId]?.image
                const count = groupedPlaces.get(name)?.length || 0
                return (
                  <li key={name}>
                    <PhotoTile
                      title={name}
                      image={cover}
                      loading={thumbnails[placeId]?.loading}
                      subtitle={`${count} ${count === 1 ? 'place' : 'places'} · Nature scenery`}
                      label={`Open ${name} district and browse ${count} places`}
                      onClick={() => setSelectedDistrict(name)}
                    />
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setSelectedDistrict('')} className="mb-4 rounded-md border border-pine/30 px-3 py-2 font-medium text-pine hover:bg-glacier">
              ← All districts
            </button>
            <h2 id="districts-heading" className="text-2xl font-semibold text-pine">{selectedDistrict} destinations</h2>
            <p className="mt-1 text-sm text-ink/70">{districtPlaces.length} places · Select a place photo to see its details and visitor feedback.</p>
            {districtPlaces.length === 0
              ? <p className="mt-4">No destinations are currently listed for this district.</p>
              : (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {districtPlaces.map(place => (
                    <li key={place.id}>
                      <PhotoTile
                        title={place.name}
                        image={thumbnails[place.id]?.image}
                        loading={thumbnails[place.id]?.loading}
                        subtitle={`Place photo · ${place.altitude.toLocaleString('en-IN')} m`}
                        label={`Open details for ${place.name}`}
                        onClick={() => openPlace(place)}
                      />
                    </li>
                  ))}
                </ul>
              )}
          </>
        )}
      </section>
      <section className="mt-10" aria-labelledby="adventure-heading">
        <h2 id="adventure-heading" className="text-2xl font-semibold text-pine">Adventure sports and outdoor activities</h2>
        <p className="mt-1 text-sm text-ink/70">Browse suggested activities and the places associated with them in each district. This is a guide, not live operator or opening information.</p>
        {activitiesLoading && <p className="mt-4" role="status">Loading district activities</p>}
        {activitiesError && <p className="mt-4 text-red-800" role="alert">Could not load adventure activities: {activitiesError}</p>}
        {!activitiesLoading && !activitiesError && (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {visibleAdventureDistricts.map(item => (
              <li key={item.district} className="rounded-xl border border-pine/15 bg-white p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xl font-semibold text-pine">{item.district}</h3>
                  <span className="text-sm text-ink/60">{item.region}</span>
                </div>
                {item.activities.length > 0 ? (
                  <ul className="mt-3 space-y-4">
                    {item.activities.map(activity => (
                      <li key={activity.name}>
                        <h4 className="font-semibold">{activity.name}</h4>
                        <p className="mt-1 text-sm"><span className="font-medium">Where:</span> {activity.locations.join('; ')}</p>
                        <p className="mt-1 text-sm text-ink/70">{activity.note}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-ink/70">{item.note}</p>
                )}
                {item.sources.length > 0 && (
                  <p className="mt-4 border-t border-pine/10 pt-3 text-xs text-ink/70">
                    Sources: {item.sources.map((source, index) => (
                      <span key={source.url}>
                        {index > 0 && ' · '}
                        <a href={source.url} target="_blank" rel="noreferrer" className="underline">{source.label}</a>
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 rounded-lg bg-glacier/50 p-4 text-sm text-ink/80">
          Availability can change with weather, season, permits, river and forest restrictions, and operator schedules. Check current local rules and use qualified, authorized providers; do not rely on this page for safety or same-day availability.
        </p>
      </section>
      {selectedPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closePlace() }}>
          <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-snow p-5 shadow-xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="place-dialog-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="place-dialog-title" className="text-2xl font-bold text-pine">{selectedPlace.name}</h2>
                <p className="mt-1 text-sm text-ink/70">{selectedPlace.district}, {selectedPlace.region} · {selectedPlace.altitude.toLocaleString('en-IN')} m</p>
              </div>
              <button type="button" autoFocus onClick={closePlace} className="rounded-md border border-pine/30 px-3 py-1.5 font-semibold text-pine" aria-label="Close destination details">Close</button>
            </div>
            <div className="mt-4 grid gap-6 md:grid-cols-[2fr,1fr]">
              <section aria-labelledby="place-photos-heading">
                <h3 id="place-photos-heading" className="text-lg font-semibold text-pine">Photos</h3>
                <p className="text-sm text-ink/70">Each search uses this place’s name and district and prefers outdoor scenery. Commons descriptions can be incomplete, so check the file page to confirm what the photo shows and review its attribution and reuse terms.</p>
                {gallery.loading && <p className="mt-4" role="status">Loading destination photos</p>}
                {gallery.error && <p className="mt-4 text-red-800" role="alert">Could not load photos: {gallery.error}</p>}
                {!gallery.loading && !gallery.error && gallery.images.length === 0 && (
                  <p className="mt-4 rounded-md bg-white p-4">No clearly matched, license-attributed photos were found for this place. We have not substituted unrelated destination images.</p>
                )}
                {gallery.images.length > 0 && (
                  <>
                    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                      {gallery.images.map(image => (
                        <li key={image.id} className="overflow-hidden rounded-lg border border-pine/15 bg-white">
                          <a href={image.pageUrl} target="_blank" rel="noreferrer" aria-label={`Open source photo ${image.title}`}>
                            <img src={image.thumbnailUrl} alt={image.description || image.title} className="h-52 w-full object-cover" loading="lazy" />
                          </a>
                          <div className="p-3 text-sm">
                            <p className="font-medium">{image.title}</p>
                            <p className="mt-1 text-ink/70">By {image.artist} · <a href={image.licenseUrl} target="_blank" rel="noreferrer" className="underline">{image.license}</a></p>
                            <a href={image.pageUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block underline text-pine">Source file</a>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {gallery.updatedAt && <p className="mt-2 text-xs text-ink/70">Image search cached {new Date(gallery.updatedAt).toLocaleString('en-IN')} · <a href={gallery.source} target="_blank" rel="noreferrer" className="underline">Wikimedia Commons</a></p>}
                  </>
                )}
              </section>
              <aside>
                <h3 className="text-lg font-semibold text-pine">About this place</h3>
                <p className="mt-2 text-sm">Best listed in: {selectedPlace.season}. Current opening/access status is not verified live; confirm with local authorities.</p>
                <p className="mt-2 text-sm">{selectedPlace.tip}</p>
                <ul className="mt-2 list-disc pl-5 text-sm">{selectedPlace.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>
                {selectedPlace.sources?.map(source => (
                  <p key={source.url} className="mt-3 text-xs text-ink/70">
                    Source for {source.verifiedFields.join(', ')}: <a href={source.url} target="_blank" rel="noreferrer" className="underline">{source.organization}</a>
                    {' · Checked '}{source.checkedAt}
                  </p>
                ))}
                <p className="mt-3 text-xs text-ink/70">Access and opening status are not live-verified. Confirm the place, route, permits and conditions locally before travel.</p>
                <div className="mt-5 border-t border-pine/15 pt-4">
                  <h3 className="text-lg font-semibold text-pine">Visitor feedback</h3>
                  {ratePlace(selectedPlace)}
                  <p className="mt-3 text-xs text-ink/70">Ratings are optional and anonymous. The app stores no account, name, or browser/session ID with a rating.</p>
                </div>
              </aside>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
