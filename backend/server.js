// REST API with MongoDB persistence when MONGODB_URI is configured.
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { createHash, randomUUID, randomBytes } from 'node:crypto'
import { places, buildRoute, buildItinerary } from './places.js'

const PORT = process.env.PORT || 5000
const ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim())
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim()
const EMAIL_FROM = process.env.EMAIL_FROM?.trim()
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL?.trim()
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const STATUSES = ['Pending', 'In Review', 'Resolved', 'Rejected']
const MAX_REPORTS = 1000
const MONGODB_URI = process.env.MONGODB_URI?.trim()
const LIVE_DATA_TTL_MS = 10 * 60 * 1000
const WEATHER_BATCH_SIZE = 5
const WEATHER_RATE_LIMIT_COOLDOWN_MS = 15 * 60 * 1000
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
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, maxlength: 120 },
  hash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], required: true },
  emailVerified: { type: Boolean, default: true },
  verificationTokenHash: String,
  verificationTokenExpiresAt: Date,
}, { timestamps: true, versionKey: false })
const reportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true, maxlength: 40 },
  description: { type: String, required: true, maxlength: 1000 },
  location: { type: String, required: true, maxlength: 200 },
  status: { type: String, enum: STATUSES, required: true },
}, { timestamps: true, versionKey: false })
const User = mongoose.model('User', userSchema)
const Report = mongoose.model('Report', reportSchema)
const text = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
const sign = u => jwt.sign({ sub: u.id, role: u.role }, SECRET, { expiresIn: '7d' })
const pub = u => ({ id: u.id, name: u.name, email: u.email, role: u.role === 'admin' && u.emailVerified === true ? 'admin' : 'user' })
const asyncHandler = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const findUserByEmail = email => MONGODB_URI ? User.findOne({ email }).lean() : users.find(u => u.email === email)
const findUserById = id => MONGODB_URI ? User.findOne({ id }).lean() : users.find(u => u.id === id)
const listReports = () => MONGODB_URI ? Report.find({}, { _id: 0, id: 1, category: 1, description: 1, location: 1, status: 1 }).lean() : reports
const countReports = () => MONGODB_URI ? Report.countDocuments() : reports.length
const hashToken = token => createHash('sha256').update(token).digest('hex')

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '')
  try { req.user = jwt.verify(token, SECRET); next() }
  catch { res.status(401).json({ error: 'Please log in' }) }
}
const adminOnly = asyncHandler(async (req, res, next) => {
  const user = await findUserById(req.user.sub)
  if (user?.role !== 'admin' || user.emailVerified !== true) return res.status(403).json({ error: 'Admin only' })
  next()
})

async function sendAdminVerificationEmail(email, token) {
  const verifyUrl = new URL('/verify-admin', `${PUBLIC_APP_URL.replace(/\/+$/, '')}/`)
  verifyUrl.searchParams.set('token', token)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [email],
      subject: 'Verify your Devbhoomi Yatra admin email',
      text: `Verify your admin account by opening this link within 30 minutes: ${verifyUrl}`,
      html: `<p>Verify your Devbhoomi Yatra admin account by opening this link within 30 minutes:</p><p><a href="${verifyUrl}">Verify admin email</a></p>`,
    }),
  })
  if (!response.ok) throw new Error(`Resend returned status ${response.status}`)
}

async function issueAdminVerification(user) {
  if (!RESEND_API_KEY || !EMAIL_FROM || !PUBLIC_APP_URL) {
    throw new Error('Admin email verification is not configured on the server')
  }
  const token = randomBytes(32).toString('hex')
  const verification = {
    verificationTokenHash: hashToken(token),
    verificationTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
  }
  if (MONGODB_URI) await User.updateOne({ id: user.id }, { $set: verification })
  else Object.assign(user, verification)

  try {
    await sendAdminVerificationEmail(user.email, token)
  } catch (error) {
    if (MONGODB_URI) {
      await User.updateOne({ id: user.id }, { $unset: { verificationTokenHash: 1, verificationTokenExpiresAt: 1 } })
    } else {
      delete user.verificationTokenHash
      delete user.verificationTokenExpiresAt
    }
    throw error
  }
}

// ---- health
app.get('/api/health', (_req, res) => res.json({ ok: true, storage: MONGODB_URI ? 'mongodb' : 'memory' }))

// ---- auth
app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const name = text(req.body?.name, 60)
  const email = text(req.body?.email, 120)?.toLowerCase()
  const password = req.body?.password
  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Enter your name, a valid email and a password of 8 to 72 characters' })
  }
  const adminCandidate = Boolean(ADMIN_EMAIL) && email === ADMIN_EMAIL
  const existing = await findUserByEmail(email)
  if (existing) return res.status(409).json({ error: 'This email is already registered. Log in to request admin verification if this is the configured admin email.' })
  if (adminCandidate && (!RESEND_API_KEY || !EMAIL_FROM || !PUBLIC_APP_URL)) {
    return res.status(503).json({ error: 'Admin email verification is not configured on the server' })
  }
  const u = {
    id: randomUUID(),
    name,
    email,
    hash: await bcrypt.hash(password, 10),
    role: 'user',
    emailVerified: !adminCandidate,
  }
  if (MONGODB_URI) {
    try { await User.create(u) }
    catch (error) {
      if (error.code === 11000) return res.status(409).json({ error: 'This email is already registered' })
      throw error
    }
  } else users.push(u)
  if (adminCandidate) {
    try { await issueAdminVerification(u) }
    catch (error) {
      console.error('Admin verification email failed:', error.message)
      return res.status(502).json({ error: 'Could not send the admin verification email. Log in to request another link.' })
    }
    return res.status(202).json({ verificationRequired: true, message: 'Check the configured admin email inbox for a verification link. It expires in 30 minutes.' })
  }
  res.status(201).json({ token: sign(u), user: pub(u) })
}))

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const email = text(req.body?.email, 120)?.toLowerCase()
  const password = req.body?.password
  const u = email ? await findUserByEmail(email) : null
  if (!u || typeof password !== 'string' || !(await bcrypt.compare(password, u.hash))) {
    return res.status(401).json({ error: 'Email or password is incorrect' })
  }
  if (u.email === ADMIN_EMAIL && (u.emailVerified !== true || u.role !== 'admin')) {
    try { await issueAdminVerification(u) }
    catch (error) {
      console.error('Admin verification email failed:', error.message)
      return res.status(503).json({ error: 'Could not send the admin verification email. Try again later.' })
    }
    return res.status(202).json({ verificationRequired: true, message: 'Check the configured admin email inbox for a verification link. It expires in 30 minutes.' })
  }
  res.json({ token: sign(u), user: pub(u) })
}))

app.post('/api/auth/verify-admin', asyncHandler(async (req, res) => {
  const token = req.body?.token
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({ error: 'The verification link is invalid or has expired' })
  }
  const tokenHash = hashToken(token)
  let user
  if (MONGODB_URI) {
    user = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL, verificationTokenHash: tokenHash, verificationTokenExpiresAt: { $gt: new Date() } },
      {
        $set: { role: 'admin', emailVerified: true },
        $unset: { verificationTokenHash: 1, verificationTokenExpiresAt: 1 },
      },
      { new: true },
    ).lean()
  } else {
    user = users.find(u => u.email === ADMIN_EMAIL && u.verificationTokenHash === tokenHash && u.verificationTokenExpiresAt > new Date())
    if (user) {
      user.role = 'admin'
      user.emailVerified = true
      delete user.verificationTokenHash
      delete user.verificationTokenExpiresAt
    }
  }
  if (!user) return res.status(400).json({ error: 'The verification link is invalid or has expired' })
  res.json({ message: 'Admin email verified. You can now log in.' })
}))

app.get('/api/auth/me', auth, asyncHandler(async (req, res) => {
  const u = await findUserById(req.user.sub)
  u ? res.json(pub(u)) : res.status(401).json({ error: 'Please log in' })
}))

const districtNames = [
  'Uttarakhand', 'Dehradun', 'Haridwar', 'Pauri Garhwal', 'Tehri Garhwal', 'Uttarkashi',
  'Chamoli', 'Rudraprayag', 'Nainital', 'Almora', 'Bageshwar', 'Pithoragarh',
  'Champawat', 'Udham Singh Nagar',
]
const districtPattern = new RegExp(`\\b(?:${districtNames.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i')
const weatherPoints = places.filter((place, index) => places.findIndex(p => p.district === place.district) === index)
const liveCache = {
  warnings: { data: null, fetchedAt: 0, pending: null, retryAt: 0 },
  weather: { data: null, fetchedAt: 0, pending: null, retryAt: 0 },
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
  const payload = []
  for (let i = 0; i < weatherPoints.length; i += WEATHER_BATCH_SIZE) {
    const batch = weatherPoints.slice(i, i + WEATHER_BATCH_SIZE)
    const params = new URLSearchParams({
      latitude: batch.map(p => p.lat).join(','),
      longitude: batch.map(p => p.lng).join(','),
      current: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m',
      hourly: 'precipitation_probability',
      forecast_days: '1',
      timezone: 'Asia/Kolkata',
    })
    const response = await fetch(`${WEATHER_API_URL}?${params}`, { signal: AbortSignal.timeout(12000) })
    if (!response.ok) {
      const error = new Error(`Weather forecast source returned ${response.status}`)
      error.status = response.status
      const retryAfter = response.headers.get('retry-after')
      const retryDelay = retryAfter && /^\d+$/.test(retryAfter)
        ? Number(retryAfter) * 1000
        : retryAfter && Number.isFinite(Date.parse(retryAfter))
          ? Math.max(0, Date.parse(retryAfter) - Date.now())
          : WEATHER_RATE_LIMIT_COOLDOWN_MS
      if (response.status === 429) error.retryAt = new Date(Date.now() + retryDelay).toISOString()
      throw error
    }
    const result = await response.json()
    const forecasts = Array.isArray(result) ? result : [result]
    if (forecasts.length !== batch.length) throw new Error('Weather forecast source returned unexpected data')
    payload.push(...forecasts)
  }

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
  if (cache.retryAt > Date.now()) {
    const error = new Error('The weather provider is temporarily rate limiting requests.')
    error.retryAt = new Date(cache.retryAt).toISOString()
    if (cache.data) {
      return { data: cache.data, updatedAt: new Date(cache.fetchedAt).toISOString(), stale: true, error: error.message, retryAt: error.retryAt }
    }
    throw error
  }
  if (!cache.pending) {
    cache.pending = (source === 'warnings' ? loadOfficialWarnings() : loadWeather())
      .then(data => {
        cache.data = data
        cache.fetchedAt = Date.now()
        cache.retryAt = 0
        return data
      })
      .catch(error => {
        if (source === 'weather' && error.status === 429) {
          cache.retryAt = error.retryAt ? Date.parse(error.retryAt) : Date.now() + WEATHER_RATE_LIMIT_COOLDOWN_MS
        }
        throw error
      })
      .finally(() => { cache.pending = null })
  }
  try {
    const data = await cache.pending
    return { data, updatedAt: new Date(cache.fetchedAt).toISOString(), stale: false }
  } catch (error) {
    if (cache.retryAt > Date.now()) error.retryAt = new Date(cache.retryAt).toISOString()
    if (cache.data) return { data: cache.data, updatedAt: new Date(cache.fetchedAt).toISOString(), stale: true, error: error.message, retryAt: error.retryAt }
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
    retryAt: weatherResult.value.retryAt || null,
    source: WEATHER_SOURCE_URL,
  } : { forecasts: null, error: weatherResult.reason.message, retryAt: weatherResult.reason.retryAt || null, source: WEATHER_SOURCE_URL }
  if (warningsResult.status === 'rejected' && weatherResult.status === 'rejected') {
    return res.status(502).json({ error: 'Live alert and weather sources are currently unavailable', warnings, weather })
  }
  res.json({ warnings, weather })
})

// ---- reports
app.get('/api/reports', asyncHandler(async (_req, res) => res.json(await listReports())))

app.post('/api/reports', asyncHandler(async (req, res) => {
  const category = text(req.body?.category, 40)
  const description = text(req.body?.description, 1000)
  const location = text(req.body?.location, 200)
  if (!category || !description || !location) {
    return res.status(400).json({ error: 'category, description and location are required text fields' })
  }
  if (await countReports() >= MAX_REPORTS) return res.status(503).json({ error: 'Report storage is full (demo limit)' })
  const r = { id: 'RPT-' + randomUUID().slice(0, 8).toUpperCase(), category, description, location, status: 'Pending' }
  if (MONGODB_URI) await Report.create(r)
  else reports.push(r)
  res.status(201).json(r)
}))

app.patch('/api/reports/:id', auth, adminOnly, asyncHandler(async (req, res) => {
  const { status } = req.body ?? {}
  if (!STATUSES.includes(status)) return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` })
  let r
  if (MONGODB_URI) {
    r = await Report.findOneAndUpdate({ id: req.params.id }, { $set: { status } }, { new: true, projection: { _id: 0, id: 1, category: 1, description: 1, location: 1, status: 1 } }).lean()
  } else {
    r = reports.find(x => x.id === req.params.id)
    if (r) r.status = status
  }
  if (!r) return res.status(404).json({ error: 'Report not found' })
  res.json(r)
}))

// ---- dashboard stats
const tally = (items, key) => Object.entries(items.reduce((m, r) => ((m[r[key]] = (m[r[key]] || 0) + 1), m), {})).map(([name, count]) => ({ name, count }))
app.get('/api/stats', asyncHandler(async (_req, res) => {
  const items = await listReports()
  res.json({ total: items.length, byCategory: tally(items, 'category'), byStatus: tally(items, 'status') })
}))

// ---- places data + trip planner (login required so the AI key cannot be used anonymously)
app.get('/api/places', (_req, res) => res.json({ demo: false, curated: true, places: places.map(({ next, ...p }) => p) }))

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
  if (MONGODB_URI && mongoose.connection.readyState !== 1) {
    console.error('Persistent storage is unavailable:', err)
    return res.status(503).json({ error: 'Persistent storage is temporarily unavailable' })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

async function start() {
  if (MONGODB_URI) {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    console.log('Connected to MongoDB')
  } else {
    console.warn('MONGODB_URI is empty: users and reports are stored in memory and will be lost on restart.')
  }
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
}

start().catch(error => {
  console.error('Backend startup failed:', error.message)
  process.exitCode = 1
})
