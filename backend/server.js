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

// ---- alerts (SAMPLE data: replace with verified sources)
const alerts = [
  { id: 'A1', level: 'Warning', area: 'Garhwal', title: 'Landslide-prone road stretch', detail: 'Sample alert. Travel in daylight and check road status with local police before leaving.' },
  { id: 'A2', level: 'Watch', area: 'Kumaon', title: 'Heavy rain expected in the hills', detail: 'Sample alert. Carry rain gear and keep spare days in your plan.' },
  { id: 'A3', level: 'Info', area: 'Garhwal', title: 'Permit needed for high-altitude trek', detail: 'Sample alert. Confirm permit rules with the forest office before you go.' },
]
app.get('/api/alerts', (_req, res) => res.json({ demo: true, alerts }))

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
app.get('/api/places', (_req, res) => res.json({ demo: true, places: places.map(({ next, months, ...p }) => p) }))

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
