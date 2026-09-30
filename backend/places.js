// SAMPLE data covering all 13 districts. Coordinates, altitudes, seasons and distances are APPROXIMATE.
// To add a place, add one row below: [id, name, district, altitude_m, lat, lng, best_months, tags, highlights (separated by |), optional tip].
// Verify against official sources (e.g. Uttarakhand Tourism) before launch.
const REGION = { Dehradun: 'Garhwal', Haridwar: 'Garhwal', 'Pauri Garhwal': 'Garhwal', 'Tehri Garhwal': 'Garhwal', Uttarkashi: 'Garhwal', Chamoli: 'Garhwal', Rudraprayag: 'Garhwal',
  Nainital: 'Kumaon', Almora: 'Kumaon', Bageshwar: 'Kumaon', Pithoragarh: 'Kumaon', Champawat: 'Kumaon', 'Udham Singh Nagar': 'Kumaon' }
const M = [3, 4, 5, 6, 9, 10, 11] // spring and autumn
const W = [10, 11, 12, 1, 2, 3]   // cool season for the plains
const PERMIT = 'Check permit and registration rules locally, and carry your waste back down.'

const rows = [
  ['dehradun', 'Dehradun', 'Dehradun', 640, 30.32, 78.03, [10, 11, 2, 3, 4], 'culture,relax', 'Walk the Forest Research Institute grounds|Picnic at Robber\'s Cave (Guchhupani)'],
  ['mussoorie', 'Mussoorie', 'Dehradun', 2000, 30.46, 78.07, M, 'relax,views', 'Slow walk along Camel\'s Back Road|Landour bazaar and the Lal Tibba viewpoint', 'Visit on weekdays and walk instead of driving where you can.'],
  ['rishikesh', 'Rishikesh', 'Dehradun', 340, 30.09, 78.27, [2, 3, 4, 9, 10, 11], 'spiritual,adventure', 'Evening aarti at the Ganga ghats|White-water rafting with a licensed operator', 'Stay in a locally run ashram and carry your waste out of riverside camps.'],
  ['haridwar', 'Haridwar', 'Haridwar', 315, 29.95, 78.16, W, 'spiritual,culture', 'Evening Ganga aarti at Har Ki Pauri|Ropeway to Mansa Devi temple'],
  ['lansdowne', 'Lansdowne', 'Pauri Garhwal', 1706, 29.84, 78.68, M, 'relax,views', 'Walk to the Tip-n-Top viewpoint|Boating at Bhulla Tal'],
  ['khirsu', 'Khirsu', 'Pauri Garhwal', 1700, 30.13, 78.83, M, 'relax,views,nature', 'Village walks through apple and cedar forests|Sunrise views of the Garhwal Himalaya'],
  ['tehri', 'Tehri Lake', 'Tehri Garhwal', 770, 30.38, 78.48, M, 'adventure,relax', 'Water sports with certified operators|Lakeside viewpoints'],
  ['dhanaulti', 'Dhanaulti', 'Tehri Garhwal', 2286, 30.42, 78.24, [12, 1, 3, 4, 5, 6, 9, 10, 11], 'relax,nature,spiritual', 'Walk to Surkanda Devi temple|Forest walks in the Eco Park'],
  ['uttarkashi', 'Uttarkashi', 'Uttarkashi', 1158, 30.73, 78.44, [3, 4, 5, 6, 9, 10], 'spiritual,culture', 'Visit Vishwanath temple|See the mountaineering museum at the Nehru Institute'],
  ['gangotri', 'Gangotri', 'Uttarkashi', 3100, 30.99, 78.94, [5, 6, 9, 10], 'spiritual,trek,views', 'Darshan at Gangotri temple|Trek toward Gaumukh with a permit', PERMIT],
  ['dayara', 'Dayara Bugyal', 'Uttarkashi', 3400, 30.83, 78.63, [4, 5, 6, 9, 10, 11], 'trek,nature,views', 'Trek from Raithal village to the meadow|Sunrise views of Bandarpunch', PERMIT],
  ['auli', 'Auli', 'Chamoli', 2500, 30.53, 79.57, [12, 1, 2, 3, 4, 5, 6, 9, 10], 'snow,views,adventure', 'Ropeway ride from Joshimath|Walk to Gorson Bugyal meadow', 'Check road and ropeway status locally in winter and monsoon.'],
  ['vof', 'Valley of Flowers', 'Chamoli', 3400, 30.73, 79.6, [7, 8, 9], 'trek,nature', 'Trek from Govindghat to Ghangaria (about 13 km)|Full day in the Valley of Flowers National Park', 'Confirm permit rules with the forest office and stay on the marked path.'],
  ['badrinath', 'Badrinath', 'Chamoli', 3100, 30.74, 79.49, [5, 6, 9, 10], 'spiritual,culture,views', 'Darshan at Badrinath temple|Visit Mana village', 'The temple opens seasonally. Check dates before you plan.'],
  ['rudraprayag', 'Rudraprayag', 'Rudraprayag', 895, 30.28, 78.98, M, 'spiritual,nature', 'See the Alaknanda and Mandakini rivers meet|Visit the Koteshwar cave temple'],
  ['chopta', 'Chopta', 'Rudraprayag', 2680, 30.49, 79.02, [4, 5, 6, 9, 10, 11], 'trek,views,spiritual,wildlife,nature', 'Trek to Tungnath temple (about 3.5 km)|Continue to Chandrashila summit for wide views', 'Stay on marked trails and take all litter back down with you.'],
  ['kedarnath', 'Kedarnath', 'Rudraprayag', 3583, 30.74, 79.07, [5, 6, 9, 10], 'spiritual,trek', 'Trek from Gaurikund (about 16 km) or book a licensed helicopter|Darshan at Kedarnath temple', 'Complete the registration and check weather and route status before you go.'],
  ['pithoragarh', 'Pithoragarh', 'Pithoragarh', 1650, 29.58, 80.21, M, 'culture,spiritual', 'Explore Pithoragarh Fort and the old bazaar|Visit Thal Kedar temple'],
  ['munsiyari', 'Munsiyari', 'Pithoragarh', 2200, 30.06, 80.24, [4, 5, 6, 9, 10], 'trek,views,culture', 'Panchachuli peak views at sunrise|Trek to Khalia Top', 'The road is long. Allow a rest day and stay with village hosts.'],
  ['chaukori', 'Chaukori', 'Pithoragarh', 2010, 29.93, 80.0, M, 'views,relax,nature', 'Himalayan sunrise views|Walk among the tea gardens'],
  ['bageshwar', 'Bageshwar', 'Bageshwar', 960, 29.84, 79.77, M, 'spiritual,culture', 'Visit Bagnath temple at the Sarju and Gomti confluence|Walk along the river ghats'],
  ['kausani', 'Kausani', 'Bageshwar', 1890, 29.84, 79.6, M, 'views,relax,culture', 'Sunrise over the Himalayan range|Visit Anasakti Ashram', 'Choose a homestay run by a local family.'],
  ['baijnath', 'Baijnath', 'Bageshwar', 1130, 29.92, 79.62, M, 'culture,spiritual,relax', 'See the stone temple complex|Walk in the Garur valley'],
  ['pindari', 'Pindari Glacier (Khati)', 'Bageshwar', 2100, 30.13, 79.9, [4, 5, 6, 9, 10], 'trek,nature,views', 'Trek toward Pindari Glacier via Khati village|Stay in village homestays along the route', PERMIT],
  ['almora', 'Almora', 'Almora', 1640, 29.6, 79.66, M, 'culture,spiritual', 'Explore the old bazaar and try local sweets|Sunset at Bright End Corner', 'Buy crafts and weaves directly from local artisans.'],
  ['ranikhet', 'Ranikhet', 'Almora', 1870, 29.65, 79.43, M, 'relax,views,nature', 'Walk through the pine forests|Visit Jhula Devi temple'],
  ['binsar', 'Binsar', 'Almora', 2400, 29.7, 79.76, M, 'nature,wildlife,views,trek', 'Walk in Binsar Wildlife Sanctuary|Views from Zero Point', 'Sanctuary entry rules apply. Follow the guide and keep noise low.'],
  ['jageshwar', 'Jageshwar', 'Almora', 1870, 29.64, 79.85, M, 'spiritual,culture,nature', 'Explore the temple cluster in the deodar forest|Short walk to Vriddha Jageshwar'],
  ['nainital', 'Nainital', 'Nainital', 2000, 29.38, 79.46, M, 'relax,views', 'Boat ride on Naini Lake|Ride up to the Snow View point', 'Come on weekdays and avoid single-use plastic on the lake.'],
  ['bhimtal', 'Bhimtal', 'Nainital', 1370, 29.35, 79.56, M, 'relax,nature', 'Boat on Bhimtal lake|Lakeside walk'],
  ['mukteshwar', 'Mukteshwar', 'Nainital', 2286, 29.47, 79.65, M, 'spiritual,views,adventure', 'Visit Mukteshwar Dham temple|Views from Chauli Ki Jali'],
  ['corbett', 'Jim Corbett (Ramnagar)', 'Nainital', 400, 29.53, 79.13, [11, 12, 1, 2, 3, 4, 5, 6], 'wildlife,nature', 'Jeep safari in a permitted zone|Birdwatching along the Kosi river', 'Book safaris in advance through official channels and follow guide rules.'],
  ['champawat', 'Champawat', 'Champawat', 1615, 29.34, 80.09, M, 'culture,spiritual', 'Visit Baleshwar temple|See the old Chand-era stonework'],
  ['nanakmatta', 'Nanakmatta', 'Udham Singh Nagar', 220, 28.95, 79.92, W, 'spiritual,relax', 'Visit Nanakmatta Sahib Gurudwara|Walk along the reservoir'],
]

const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function seasonText(ms) {
  const runs = []
  for (const m of [...ms].sort((a, b) => a - b)) { const r = runs.at(-1); r && m === r[1] + 1 ? (r[1] = m) : runs.push([m, m]) }
  if (runs.length > 1 && runs[0][0] === 1 && runs.at(-1)[1] === 12) runs[0][0] = runs.pop()[0]
  return runs.map(([a, b]) => (a === b ? MN[a - 1] : `${MN[a - 1]} to ${MN[b - 1]}`)).join(', ')
}

export const places = rows.map(([id, name, district, altitude, lat, lng, months, tags, hl, tip]) => ({
  id, name, district, region: REGION[district], altitude, lat, lng, months, season: seasonText(months), tags: tags.split(','), highlights: hl.split('|'),
  tip: tip || 'Stay with local hosts, carry your waste out and check road and weather before you travel.',
}))

// Approximate road distance from straight-line distance (hill roads wind), and time at hill or plains speeds.
const rad = d => (d * Math.PI) / 180
function roadKm(a, b) {
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)) * 1.6)
}
for (const p of places) {
  p.next = places.filter(q => q !== p && q.region === p.region)
    .map(q => { const km = roadKm(p, q); return { id: q.id, km, h: Math.max(0.5, Math.round((km / (p.altitude > 800 || q.altitude > 800 ? 30 : 45)) * 2) / 2) } })
    .filter(n => n.km <= 350).sort((a, b) => a.km - b.km).slice(0, 4)
}

const KEYWORDS = {
  trek: /trek|hik/i, spiritual: /temple|spirit|yoga|pilgrim/i, wildlife: /wild|safari|bird|tiger/i, snow: /snow|ski/i,
  adventure: /advent|raft|camp/i, relax: /relax|quiet|peace|lake|calm/i, views: /view|sunrise|mountain|scenic/i,
  culture: /cultur|food|village|craft|local/i, nature: /nature|flower|forest/i,
}

// Picks stops in the region, favouring the season and interests, and chains each stop to a nearby next stop.
export function buildRoute({ region, days, month, interests }) {
  const want = Object.entries(KEYWORDS).filter(([, re]) => re.test(interests)).map(([k]) => k)
  const pool = places.filter(p => p.region === region)
  const score = p => (month && p.months.includes(month) ? 3 : 0) + p.tags.filter(t => want.includes(t)).length * 2
  const stops = Math.max(1, Math.min(pool.length, Math.ceil(days / 2)))
  const route = []
  let cur = [...pool].sort((a, b) => score(b) - score(a))[0]
  let leg = null
  while (cur) {
    route.push({ place: cur, leg, from: route.at(-1)?.place.name || null })
    if (route.length === stops) break
    const link = cur.next
      .map(n => ({ ...n, p: pool.find(x => x.id === n.id) }))
      .filter(n => n.p && !route.some(r => r.place.id === n.id))
      .sort((a, b) => score(b.p) - score(a.p) || a.km - b.km)[0]
    if (link) { cur = link.p; leg = { km: link.km, h: link.h } }
    else { cur = pool.filter(p => !route.some(r => r.place.id === p.id)).sort((a, b) => score(b) - score(a))[0]; leg = null }
  }
  const base = Math.floor(days / route.length), extra = days % route.length
  return route.map((r, i) => ({ ...r, days: base + (i < extra ? 1 : 0), inSeason: !month || r.place.months.includes(month) }))
}

export function buildItinerary(route, dayLabel) {
  const out = []
  let n = 0
  for (const s of route) {
    for (let i = 0; i < s.days; i++) {
      const travel = i === 0 && s.from ? (s.leg ? `Travel from ${s.from} (about ${s.leg.km} km, ${s.leg.h} h by road). ` : `Travel from ${s.from} (check the road distance locally). `) : ''
      out.push({ day: ++n, date: dayLabel ? dayLabel(n - 1) : null, place: s.place.name, text: travel + s.place.highlights[i % s.place.highlights.length] })
    }
  }
  return out
}
