// REST API with in-memory data. Next: Mongoose models to make users and reports permanent.
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { randomUUID, randomBytes } from 'node:crypto'
import { places, buildRoute, buildItinerary } from './places.js'

const PORT = process.env.PORT || 5000
const ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim())
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const STATUSES = ['Pending', 'In Review', 'Resolved', 'Rejected']
const MAX_REPORTS = 1000
const LIVE_DATA_TTL_MS = 10 * 60 * 1000
const NDMA_FEED_URL = 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml'
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast'
const WEATHER_SOURCE_URL = 'https://open-meteo.com/'
const ALERT_SOURCE_URL = 'https://sachet.ndma.gov.in/'

let SECRET = process.env.JWT_SECRET
if (!SECRET) {
  SECRET = randomBytes(32).toString('hex')
  console.warn('JWT_SECRET is empty: using a temporary secret. Everyone is logged out on restart.')
}

const app = express()
app.use(cors({ origin: ORIGINS }))
app.use(express.json({ limit: '10kb' }))

const reports = []
const users = []
const text = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
const sign = u => jwt.sign({ sub: u.id, role: u.role }, SECRET, { expiresIn: '7d' })
const pub = u => ({ id: u.id, name: u.name, email: u.email, role: u.role })

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '')
  try { req.user = jwt.verify(token, SECRET); next() }
  catch { res.status(401).json({ error: 'Please log in' }) }
}
const adminOnly = (req, res, next) => (req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admin only' }))

// ---- health
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// ---- auth
app.post('/api/auth/register', async (req, res) => {
  const name = text(req.body?.name, 60)
  const email = text(req.body?.email, 120)?.toLowerCase()
  const password = req.body?.password
  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Enter your name, a valid email and a password of 8 to 72 characters' })
  }
  if (users.some(u => u.email === email)) return res.status(409).json({ error: 'This email is already registered' })
  const u = { id: randomUUID(), name, email, hash: await bcrypt.hash(password, 10), role: email === ADMIN_EMAIL ? 'admin' : 'user' }
  users.push(u)
  res.status(201).json({ token: sign(u), user: pub(u) })
})

app.post('/api/auth/login', async (req, res) => {
  const email = text(req.body?.email, 120)?.toLowerCase()
  const password = req.body?.password
  const u = users.find(x => x.email === email)
  if (!u || typeof password !== 'string' || !(await bcrypt.compare(password, u.hash))) {
    return res.status(401).json({ error: 'Email or password is incorrect' })
  }
  res.json({ token: sign(u), user: pub(u) })
})

app.get('/api/auth/me', auth, (req, res) => {
  const u = users.find(x => x.id === req.user.sub)
  u ? res.json(pub(u)) : res.status(401).json({ error: 'Please log in' })
})

const districtNames = [
  'Uttarakhand', 'Dehradun', 'Haridwar', 'Pauri Garhwal', 'Tehri Garhwal', 'Uttarkashi',
  'Chamoli', 'Rudraprayag', 'Nainital', 'Almora', 'Bageshwar', 'Pithoragarh',
  'Champawat', 'Udham Singh Nagar',
]
const districtPattern = new RegExp(`\\b(?:${districtNames.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i')
const weatherPoints = places.filter((place, index) => places.findIndex(p => p.district === place.district) === index)
const liveCache = {
  warnings: { data: null, fetchedAt: 0, pending: null },
  weather: { data: null, fetchedAt: 0, pending: null },
}

function decodeXml(value) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&amp;/g, '&')
    .trim()
}

function xmlField(xml, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = xml.match(new RegExp(`<(?:(?:[\\w.-]+):)?${escaped}\\b[^>]*>([\\s\\S]*?)<\\/(?:(?:[\\w.-]+):)?${escaped}\\s*>`, 'i'))
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, ' ')) : ''
}

async function fetchXml(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { Accept: 'application/xml, application/rss+xml' } })
  if (!response.ok) throw new Error(`Live data source returned ${response.status}`)
  return response.text()
}

function parseRssItems(xml) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(([, item]) => ({
    title: xmlField(item, 'title'),
    author: xmlField(item, 'author'),
    publishedAt: xmlField(item, 'pubDate'),
    link: xmlField(item, 'link'),
    guid: xmlField(item, 'guid'),
  })).filter(item => item.title && item.link && districtPattern.test(item.title))
}

function parseCapAlert(xml, item) {
  const status = xmlField(xml, 'status')
  const messageType = xmlField(xml, 'msgType')
  const sent = xmlField(xml, 'sent')
  const references = xmlField(xml, 'references')
  const infos = [...xml.matchAll(/<(?:[\w.-]+:)?info\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?info\s*>/gi)].map(([, info]) => info)
  const info = infos.find(block => /^en(?:$|-)/i.test(xmlField(block, 'language'))) || infos[0] || ''
  const areas = [...info.matchAll(/<(?:[\w.-]+:)?area\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?area\s*>/gi)]
    .map(([, area]) => xmlField(area, 'areaDesc')).filter(Boolean)
  const area = areas.join(', ')

  if (status !== 'Actual' || (area && !districtPattern.test(area))) return null
  if (!area && !districtPattern.test(item.title)) return null

  const expires = xmlField(info, 'expires')
  if (messageType !== 'Cancel' && (!expires || !Number.isFinite(Date.parse(expires)) || Date.parse(expires) <= Date.now())) return null

  return {
    id: xmlField(xml, 'identifier') || item.guid,
    title: xmlField(info, 'headline') || xmlField(info, 'event') || item.title,
    detail: xmlField(info, 'description') || xmlField(info, 'instruction'),
    area: area || 'Uttarakhand',
    severity: xmlField(info, 'severity') || 'Unknown',
    sender: xmlField(xml, 'sender') || item.author,
    issuedAt: sent || item.publishedAt,
    expiresAt: expires,
    sourceUrl: item.link,
    messageType,
    references,
  }
}

async function loadOfficialWarnings() {
  const feed = await fetchXml(NDMA_FEED_URL)
  const items = parseRssItems(feed).slice(0, 5)
  const alerts = (await Promise.all(items.map(async item => {
    const url = new URL(item.link)
    if (url.hostname !== 'sachet.ndma.gov.in' || url.pathname !== '/cap_public_website/FetchXMLFile') return null
    return parseCapAlert(await fetchXml(url), item)
  }))).filter(Boolean)

  const withdrawn = new Set()
  for (const alert of alerts) {
    if (alert.messageType === 'Update' || alert.messageType === 'Cancel') {
      for (const reference of alert.references.split(/\s+/)) {
        const [, identifier] = reference.split(',')
        if (identifier) withdrawn.add(identifier)
      }
    }
  }
  const currentAlerts = alerts.filter(alert => alert.messageType !== 'Cancel' && !withdrawn.has(alert.id))
    .sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt))
    .map(({ messageType, references, ...alert }) => alert)
  return currentAlerts
}

const weatherCodeNames = {
  0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  56: 'Freezing drizzle', 57: 'Heavy freezing drizzle', 61: 'Light rain', 63: 'Rain',
  65: 'Heavy rain', 66: 'Freezing rain', 67: 'Heavy freezing rain', 71: 'Light snow',
  73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Rain showers',
  81: 'Rain showers', 82: 'Heavy rain showers', 85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
}

async function loadWeather() {
  const params = new URLSearchParams({
    latitude: weatherPoints.map(p => p.lat).join(','),
    longitude: weatherPoints.map(p => p.lng).join(','),
    current: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m',
    hourly: 'precipitation_probability',
    forecast_days: '1',
    timezone: 'Asia/Kolkata',
  })
  const response = await fetch(`${WEATHER_API_URL}?${params}`, { signal: AbortSignal.timeout(12000) })
  if (!response.ok) throw new Error(`Weather forecast source returned ${response.status}`)
  const payload = await response.json()
  if (!Array.isArray(payload) || payload.length !== weatherPoints.length) throw new Error('Weather forecast source returned unexpected data')

  return payload.map((forecast, i) => {
    const point = weatherPoints[i]
    const current = forecast.current
    if (!current || typeof current.temperature_2m !== 'number') throw new Error('Weather forecast source returned incomplete data')
    const nextHour = forecast.hourly?.time?.findIndex(time => time >= current.time) ?? -1
    const probabilities = forecast.hourly?.precipitation_probability || []
    const nextSixHours = nextHour < 0 ? [] : probabilities.slice(nextHour, nextHour + 6).filter(Number.isFinite)
    return {
      district: point.district,
      location: point.name,
      time: current.time,
      temperatureC: current.temperature_2m,
      apparentTemperatureC: current.apparent_temperature,
      condition: weatherCodeNames[current.weather_code] || 'Conditions unavailable',
      precipitationMm: current.precipitation,
      precipitationChanceNext6h: nextSixHours.length ? Math.max(...nextSixHours) : null,
      windKmh: current.wind_speed_10m,
      windGustKmh: current.wind_gusts_10m,
    }
  })
}

async function readLiveData(source) {
  const cache = liveCache[source]
  if (cache.data && Date.now() - cache.fetchedAt < LIVE_DATA_TTL_MS) {
    return { data: cache.data, updatedAt: new Date(cache.fetchedAt).toISOString(), stale: false }
  }
  if (!cache.pending) {
    cache.pending = (source === 'warnings' ? loadOfficialWarnings() : loadWeather())
      .then(data => {
        cache.data = data
        cache.fetchedAt = Date.now()
        return data
      })
      .finally(() => { cache.pending = null })
  }
  try {
    const data = await cache.pending
    return { data, updatedAt: new Date(cache.fetchedAt).toISOString(), stale: false }
  } catch (error) {
    if (cache.data) return { data: cache.data, updatedAt: new Date(cache.fetchedAt).toISOString(), stale: true, error: error.message }
    throw error
  }
}

app.get('/api/alerts', async (_req, res) => {
  const [warningsResult, weatherResult] = await Promise.allSettled([
    readLiveData('warnings'),
    readLiveData('weather'),
  ])
  const warnings = warningsResult.status === 'fulfilled' ? {
    alerts: warningsResult.value.data,
    updatedAt: warningsResult.value.updatedAt,
    stale: warningsResult.value.stale,
    error: warningsResult.value.error || null,
    source: ALERT_SOURCE_URL,
  } : { alerts: null, error: warningsResult.reason.message, source: ALERT_SOURCE_URL }
  const weather = weatherResult.status === 'fulfilled' ? {
    forecasts: weatherResult.value.data,
    updatedAt: weatherResult.value.updatedAt,
    stale: weatherResult.value.stale,
    error: weatherResult.value.error || null,
    source: WEATHER_SOURCE_URL,
  } : { forecasts: null, error: weatherResult.reason.message, source: WEATHER_SOURCE_URL }
  if (warningsResult.status === 'rejected' && weatherResult.status === 'rejected') {
    return res.status(502).json({ error: 'Live alert and weather sources are currently unavailable', warnings, weather })
  }
  res.json({ warnings, weather })
})

// ---- reports
app.get('/api/reports', (_req, res) => res.json(reports))

app.post('/api/reports', (req, res) => {
  const category = text(req.body?.category, 40)
  const description = text(req.body?.description, 1000)
  const location = text(req.body?.location, 200)
  if (!category || !description || !location) {
    return res.status(400).json({ error: 'category, description and location are required text fields' })
  }
  if (reports.length >= MAX_REPORTS) return res.status(503).json({ error: 'Report storage is full (demo limit)' })
  const r = { id: 'RPT-' + randomUUID().slice(0, 8).toUpperCase(), category, description, location, status: 'Pending' }
  reports.push(r)
  res.status(201).json(r)
})

app.patch('/api/reports/:id', auth, adminOnly, (req, res) => {
  const r = reports.find(x => x.id === req.params.id)
  if (!r) return res.status(404).json({ error: 'Report not found' })
  const { status } = req.body ?? {}
  if (!STATUSES.includes(status)) return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` })
  r.status = status
  res.json(r)
})

// ---- dashboard stats
const tally = key => Object.entries(reports.reduce((m, r) => ((m[r[key]] = (m[r[key]] || 0) + 1), m), {})).map(([name, count]) => ({ name, count }))
app.get('/api/stats', (_req, res) => res.json({ total: reports.length, byCategory: tally('category'), byStatus: tally('status') }))

// ---- places data + trip planner (login required so the AI key cannot be used anonymously)
app.get('/api/places', (_req, res) => res.json({ demo: false, curated: true, places: places.map(({ next, months, ...p }) => p) }))

app.post('/api/ai/plan-trip', auth, async (req, res) => {
  const days = Math.min(10, Math.max(1, parseInt(req.body?.days, 10) || 3))
  const region = ['Garhwal', 'Kumaon'].includes(req.body?.region) ? req.body.region : 'Garhwal'
  const interests = text(req.body?.interests, 200) || ''
  const startRaw = req.body?.startDate
  const start = typeof startRaw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startRaw) && !isNaN(Date.parse(startRaw)) ? new Date(startRaw + 'T00:00:00Z') : null
  const dayLabel = i => {
    const d = new Date(start)
    d.setUTCDate(d.getUTCDate() + i)
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  }

  const route = buildRoute({ region, days, month: start ? start.getUTCMonth() + 1 : null, interests })
  const itinerary = buildItinerary(route, start ? dayLabel : null)
  const result = {
    route: route.map(s => ({ name: s.place.name, days: s.days, inSeason: s.inSeason, season: s.place.season, tip: s.place.tip, leg: s.leg, from: s.from })),
    itinerary,
  }
  const key = process.env.GEMINI_API_KEY
  if (!key) return res.json({ ...result, demo: true })

  const prompt = `Write a short, friendly overview of this ${days}-day responsible trip in ${region}, Uttarakhand${start ? ` starting ${dayLabel(0)}` : ''}. Use ONLY the places, distances and facts in this JSON, and add 3 practical tips (packing, weather for that time of year, local etiquette). Do not invent prices or phone numbers. Plain text, under 200 words.\n${JSON.stringify(result)}`
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    })
    if (!r.ok) throw new Error('Gemini status ' + r.status)
    const data = await r.json()
    const plan = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('')
    if (!plan) throw new Error('Empty answer')
    res.json({ ...result, demo: false, plan })
  } catch (e) {
    console.error('Trip planner AI failed:', e.message)
    res.json({ ...result, demo: false, aiError: 'The AI summary is unavailable right now, but your route is below.' })
  }
})

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' })
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' })
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
