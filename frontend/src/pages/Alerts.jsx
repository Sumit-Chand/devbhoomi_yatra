import { useApi } from '../api.js'

const severityTone = {
  Extreme: 'bg-red-100 text-red-900',
  Severe: 'bg-orange-100 text-orange-900',
  Moderate: 'bg-marigold/30 text-ink',
  Minor: 'bg-glacier text-pine',
}

function timestamp(value) {
  return value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'time unavailable'
}

function SourceStatus({ source, updatedAt, stale, error }) {
  return (
    <p className="mt-2 text-sm text-ink/70">
      Source: <a className="underline" href={source} target="_blank" rel="noreferrer">{source.includes('open-meteo') ? 'Open-Meteo' : 'NDMA SACHET'}</a>
      {updatedAt && ` · Updated ${timestamp(updatedAt)}`}
      {stale && ' · Showing last retrieved data; refresh failed.'}
      {error && !stale && ` · Source unavailable: ${error}`}
    </p>
  )
}

export default function Alerts() {
  const { loading, error, data } = useApi('/api/alerts')
  const warnings = data?.warnings
  const weather = data?.weather
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine">Live travel updates</h1>
      <p className="mt-1 text-ink/70">Official public alerts and current model forecasts. Forecasts are not official warnings, and this page does not report live road closures.</p>
      {loading && <p className="mt-6">Loading live updates</p>}
      {error && <p className="mt-6 text-red-800">Could not load updates: {error}</p>}

      {warnings && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-pine">Official Uttarakhand alerts</h2>
          <SourceStatus {...warnings} />
          {warnings.error && <p className="mt-3 text-red-800">Could not refresh official alerts: {warnings.error}</p>}
          {warnings.alerts?.length === 0 && <p className="mt-4">No current Uttarakhand-specific alerts were found in the feed. This does not guarantee that travel conditions are safe.</p>}
          <ul className="mt-4 space-y-3">
            {warnings.alerts?.map(alert => (
              <li key={alert.id} className="bg-white border border-pine/15 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded ${severityTone[alert.severity] || 'bg-glacier text-pine'}`}>{alert.severity}</span>
                  <h3 className="font-semibold">{alert.title}</h3>
                </div>
                {alert.detail && <p className="mt-2">{alert.detail}</p>}
                <p className="mt-2 text-sm text-ink/70">Area: {alert.area} · Issued {timestamp(alert.issuedAt)} · Valid until {timestamp(alert.expiresAt)}</p>
                <p className="mt-1 text-sm text-ink/70">Issued by {alert.sender} · <a className="underline" href={alert.sourceUrl} target="_blank" rel="noreferrer">View source alert</a></p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {weather && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-pine">Weather by district</h2>
          <p className="mt-1 text-ink/70">Model forecast for one representative location per district; mountain conditions can differ substantially nearby.</p>
          <SourceStatus {...weather} />
          {weather.error && <p className="mt-3 text-red-800">Could not refresh forecasts: {weather.error}</p>}
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {weather.forecasts?.map(forecast => (
              <li key={forecast.district} className="bg-white border border-pine/15 rounded-lg p-4">
                <h3 className="font-semibold text-pine">{forecast.district}</h3>
                <p className="text-sm text-ink/70">Near {forecast.location} · {timestamp(forecast.time)}</p>
                <p className="mt-2">{forecast.condition} · {forecast.temperatureC}°C (feels like {forecast.apparentTemperatureC}°C)</p>
                <p className="mt-1 text-sm">Rain chance next 6 hours: {forecast.precipitationChanceNext6h == null ? 'unavailable' : `${forecast.precipitationChanceNext6h}%`} · Wind {forecast.windKmh} km/h</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
