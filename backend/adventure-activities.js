const activityReference = (label, url) => ({ label, url })

export const adventureActivities = [
  {
    district: 'Almora',
    region: 'Kumaon',
    activities: [
      { name: 'Day hikes and nature trails', locations: ['Binsar Wildlife Sanctuary (permitted trails)', 'Jageshwar forest paths', 'Ranikhet forest walks'], note: 'Use marked routes; sanctuary entry and guide rules apply.' },
    ],
    sources: [activityReference('Almora District Administration', 'https://almora.nic.in/places-of-interest/')],
  },
  {
    district: 'Bageshwar',
    region: 'Kumaon',
    activities: [
      { name: 'Multi-day trekking', locations: ['Pindari Glacier route via Khati', 'Kafni Glacier route', 'Sunderdhunga Valley'], note: 'Remote mountain routes; confirm permits, guides, weather, and trail status locally.' },
    ],
    sources: [activityReference('Bageshwar District Administration', 'https://bageshwar.nic.in/tourist-places/')],
  },
  {
    district: 'Chamoli',
    region: 'Garhwal',
    activities: [
      { name: 'Skiing', locations: ['Auli'], note: 'Snow and lift availability are seasonal; check current operations and use qualified instructors.' },
      { name: 'Trekking', locations: ['Valley of Flowers', 'Hemkund Sahib', 'Kuari Pass', 'Roopkund route'], note: 'Protected areas and remote trails have seasonal access, permits, and route restrictions; verify with authorities.' },
    ],
    sources: [
      activityReference('Chamoli District Administration: Auli', 'https://chamoli.gov.in/tourist-place/auli/'),
      activityReference('Uttarakhand Tourism: Auli', 'https://uttarakhandtourism.gov.in/destination/auli'),
    ],
  },
  {
    district: 'Champawat',
    region: 'Kumaon',
    activities: [
      { name: 'Day hikes and nature walks', locations: ['Abbott Mount area', 'Lohaghat Valley', 'Vanasur Fort approach'], note: 'These are outdoor walks, not a claim of a managed adventure-sports operator; confirm trail access locally.' },
    ],
    sources: [activityReference('Champawat District Administration', 'https://champawat.nic.in/places-of-interest/')],
  },
  {
    district: 'Dehradun',
    region: 'Garhwal',
    activities: [
      { name: 'White-water rafting', locations: ['Rishikesh rafting stretch'], note: 'Run only by permitted operators when authorities allow; river conditions and operating stretches can change.' },
      { name: 'Trekking and day hikes', locations: ['Chakrata and Tiger Falls trail', 'Mussoorie and George Everest area'], note: 'Confirm trail access, weather, and any local restrictions.' },
    ],
    sources: [
      activityReference('Uttarakhand Tourism: Rishikesh', 'https://uttarakhandtourism.gov.in/destination/rishikesh'),
      activityReference('Dehradun District Administration: Rishikesh', 'https://dehradun.nic.in/tourist-place/rishikesh/'),
    ],
  },
  {
    district: 'Haridwar',
    region: 'Garhwal',
    activities: [],
    note: 'No organized adventure-sport location in Haridwar district is listed here without a verified activity-specific source. Do not assume rafting or other activities advertised for nearby Rishikesh are within Haridwar district.',
    sources: [activityReference('Haridwar District Administration', 'https://haridwar.nic.in/tourist-places/')],
  },
  {
    district: 'Nainital',
    region: 'Kumaon',
    activities: [
      { name: 'Boating', locations: ['Naini Lake, Nainital', 'Bhimtal Lake', 'Sattal', 'Naukuchiatal'], note: 'Use authorized boats and jetties; availability, permitted craft, and lake rules vary by site.' },
    ],
    sources: [activityReference('Nainital District Administration', 'https://nainital.nic.in/tourist-places/')],
  },
  {
    district: 'Pauri Garhwal',
    region: 'Garhwal',
    activities: [
      { name: 'Trekking and forest hikes', locations: ['Lansdowne trails', 'Tarkeshwar Mahadev approach', 'Charekh Danda area'], note: 'Check access and weather locally; follow cantonment, forest, and temple rules where applicable.' },
      { name: 'Bungee jumping and giant swing (operator-dependent)', locations: ['Mohan Chatti area near Rishikesh'], note: 'Commercial activity; verify the operator, site jurisdiction, current permissions, insurance, and safety standards before booking.' },
    ],
    sources: [
      activityReference('Pauri Garhwal District Administration', 'https://pauri.nic.in/tourist-places/'),
      activityReference('Jumpin Heights (operator)', 'https://www.jumpinheights.com/'),
    ],
  },
  {
    district: 'Pithoragarh',
    region: 'Kumaon',
    activities: [
      { name: 'High-altitude trekking', locations: ['Khalia Top, Munsiyari', 'Milam Glacier route', 'Ralam Glacier route'], note: 'Remote/high-altitude routes; check permits, border-area restrictions, acclimatization, weather, and authorized guide requirements.' },
      { name: 'Pilgrimage trekking', locations: ['Adi Kailash and Om Parvat routes'], note: 'Access is permit- and condition-dependent. Confirm current rules with the district administration before travel.' },
    ],
    sources: [activityReference('Pithoragarh District Administration', 'https://pithoragarh.nic.in/tourist-places/')],
  },
  {
    district: 'Rudraprayag',
    region: 'Garhwal',
    activities: [
      { name: 'Trekking and summit hikes', locations: ['Kedarnath route', 'Chopta–Tungnath–Chandrashila route', 'Madhyamaheshwar route', 'Deoria Tal trail'], note: 'Seasonal mountain trails; check registration, weather, route openings, and local advisories.' },
    ],
    sources: [activityReference('Rudraprayag District Administration', 'https://rudraprayag.gov.in/tourist-places/')],
  },
  {
    district: 'Tehri Garhwal',
    region: 'Garhwal',
    activities: [
      { name: 'Lake water activities', locations: ['Tehri Lake: boating, jet-ski rides, water skiing, banana-boat and other towable rides (as listed by the district page)'], note: 'The district page lists these activities, but current operators and availability are not confirmed here. Check official local notices and use authorized providers.' },
      { name: 'Trekking and hill hikes', locations: ['Surkanda Devi trail', 'Kunjapuri trail', 'Khatling Glacier route'], note: 'Confirm trail status, permits, weather, and transport before setting out.' },
    ],
    sources: [
      activityReference('Tehri Garhwal District Administration: Tehri Lake', 'https://tehri.nic.in/tehri-lake/'),
      activityReference('Tehri Garhwal District Administration', 'https://tehri.nic.in/tourist-places/'),
    ],
  },
  {
    district: 'Udham Singh Nagar',
    region: 'Kumaon',
    activities: [],
    note: 'No organized adventure-sport location in this district is listed here without a verified activity-specific source. Check with local authorities before assuming boating or water sports are available at a reservoir.',
    sources: [activityReference('Udham Singh Nagar District Administration', 'https://usnagar.nic.in/tourist-places/')],
  },
  {
    district: 'Uttarkashi',
    region: 'Garhwal',
    activities: [
      { name: 'Trekking and high-altitude hiking', locations: ['Dayara Bugyal', 'Dodital', 'Har Ki Dun', 'Gaumukh route (permit required)'], note: 'Check forest/route permits, registration, weather, and current access; use experienced local guides for remote routes.' },
    ],
    sources: [activityReference('Uttarkashi District Administration', 'https://uttarkashi.nic.in/tourist-places/')],
  },
]

export const adventureActivityNotes = {
  currentAvailability: 'not-verified-live',
  note: 'Activities and locations are indicative travel ideas, not confirmation that an operator is open, licensed, or authorized today. Check current district/forest/river rules, permits, weather, and operator safety credentials before booking.',
}
