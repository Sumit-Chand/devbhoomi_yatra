const checkedAt = '2026-10-12'

export const destinationSources = {
  yamunotri: {
    organization: 'Uttarakhand Tourist Care',
    url: 'https://registrationandtouristcare.uk.gov.in/dham_detail.php?dham=MQ==',
    checkedAt,
    verifiedFields: ['access'],
  },
  gangotri: {
    organization: 'Uttarakhand Tourist Care',
    url: 'https://registrationandtouristcare.uk.gov.in/dham_detail.php?dham=Mg==',
    checkedAt,
    verifiedFields: ['description', 'access', 'altitude'],
  },
  kedarnath: {
    organization: 'Uttarakhand Tourist Care',
    url: 'https://registrationandtouristcare.uk.gov.in/dham_detail.php?dham=Mw==',
    checkedAt,
    verifiedFields: ['access', 'transport'],
  },
  badrinath: {
    organization: 'Uttarakhand Tourist Care',
    url: 'https://registrationandtouristcare.uk.gov.in/dham_detail.php?dham=NA==',
    checkedAt,
    verifiedFields: ['access'],
  },
}

const districtPlaceReferences = {
  Almora: {
    organization: 'Almora District Administration',
    url: 'https://almora.nic.in/places-of-interest/',
    ids: [
      'lala-bazaar-almora', 'bright-end-corner', 'chitai-golu-devta', 'nanda-devi-temple-almora',
      'naithan-devi-temple', 'kumaon-regimental-museum', 'chaubatia-gardens', 'ranikhet-golf-course',
      'jhula-devi-temple', 'ram-mandir-ranikhet', 'herakhan-temple', 'kalika-temple-ranikhet',
      'binsar-mahadev-temple', 'manila-devi-temple', 'shitla-khet', 'syahi-devi-temple',
      'cranks-ridge', 'gb-pant-memorial-khunt',
    ],
  },
  'Almora Jageshwar complex': {
    organization: 'Incredible India: Jageshwar Dham',
    url: 'https://www.incredibleindia.gov.in/en/uttarakhand/almora/jageshwar-dham',
    ids: [],
    additionalIds: [
      'dandeshwar-temple', 'nav-durga-temple-jageshwar', 'chandika-temple-jageshwar',
      'pushti-mata-temple', 'kuber-temple-jageshwar', 'lakulisha-temple', 'tandeswar-temple',
      'jagannath-temple-jageshwar', 'dakshin-mukhi-hanuman-neelkanth',
      'surya-temple-jageshwar', 'navagraha-temple-jageshwar', 'tarkeshwar-temple-jageshwar',
      'batuk-bhairav-temple-jageshwar', 'brahm-kund-jageshwar', 'asi-museum-jageshwar',
    ],
  },
  Bageshwar: {
    organization: 'Bageshwar District Administration and Incredible India',
    url: 'https://bageshwar.nic.in/tourist-places/',
    ids: [
      'anasakti-ashram', 'sumitranandan-pant-museum', 'lakshmi-ashram-kausani', 'kausani-tea-estate',
      'starscapes-kausani', 'kausani-planetarium', 'pinnath-temple', 'rudradhari-falls-caves',
      'kausani-shawl-factory', 'baijnath-lake', 'gauri-udiyar-cave-temple',
      'suraj-kund-bageshwar', 'agni-kund-bageshwar', 'bhileshwar-mountain', 'nileshwar-mountain',
    ],
  },
  Champawat: {
    organization: 'Champawat District Administration',
    url: 'https://champawat.nic.in/places-of-interest/',
    ids: [
      'nagnath-temple-champawat', 'ek-hathiya-naula', 'kranteshwar-mahadev',
      'reetha-sahib', 'vanasur-fort', 'chaumu-shrine-pancheshwar', 'lohaghat-valley',
    ],
  },
  Pithoragarh: {
    organization: 'Incredible India',
    url: 'https://www.incredibleindia.gov.in/en/uttarakhand/pithoragarh',
    ids: [
      'nakuleshwar-temple', 'thalkedar-temple', 'kapileshwar-cave-temple', 'dhwaj-temple',
      'kamakhya-temple-pithoragarh', 'chandak-viewpoint', 'mostamanu-temple',
      'pashupatinath-temple-chandak', 'nagmandir-berinag', 'chaukori-tea-gardens',
      'didihat', 'adi-kailash', 'parvati-sarovar', 'gauri-kund-adi-kailash',
      'om-parvat', 'sarmoli', 'ralam-glacier-trek', 'milam-glacier-trek',
      'purana-bazar-pithoragarh', 'naya-bazar-pithoragarh', 'simalgair-pithoragarh',
      'kumdar-hill-provisional',
    ],
  },
  Chamoli: {
    organization: 'Chamoli District Administration and Incredible India',
    url: 'https://chamoli.gov.in/tourist-places/',
    ids: [
      'tapt-kund', 'vyas-gufa', 'bhim-pul', 'saraswati-river-mana', 'hemkund-lake',
      'nanda-devi-national-park', 'roopkund-lake', 'kuari-pass', 'gopinath-temple',
      'vaitarni-kund', 'oak-view-gopeshwar',
      'vishnuprayag', 'nandprayag', 'karnaprayag-confluence', 'bedni-bugyal',
      'anusuya-devi-temple', 'narsingh-temple-joshimath', 'shankaracharya-math-joshimath',
      'bhavishya-badri', 'yogadhyan-badri', 'vriddha-badri', 'aali-bugyal',
      'bairaskund-temple',
    ],
  },
  'Chamoli secondary references': {
    organization: 'Secondary place references (verify locally)',
    url: 'https://en.wikipedia.org/wiki/Chamoli_district',
    ids: [
      'nagnath-dewar-walla', 'satopanth-tal-provisional', 'ardha-badri', 'dhyan-badri',
      'nauti-nanda-devi-shrine', 'nanda-devi-bedni-shrine', 'latu-devta-temple-bedni',
      'basdeo-temple-joshimath', 'chakratirtha',
    ],
  },
  'Pauri Garhwal': {
    organization: 'Secondary place references (verify locally)',
    url: 'https://en.wikipedia.org/wiki/Pauri_Garhwal_district',
    ids: [
      'lakshmi-narayan-temple-pauri', 'kyunkaleshwar-mahadev', 'nagdevta-temple-pauri',
      'laxman-temple-pauri', 'ulkhagarhi', 'jhandi-dhar-pauri', 'ransi-stadium',
      'danda-nagraja-temple', 'pipli-gurdwara', 'nadbudh-bhairava-temple', 'kanvashram',
      'siddhabali-temple', 'durga-devi-temple-kotdwar', 'st-joseph-church-kotdwar',
      'shoonya-shikhar-ashram', 'charekh-danda', 'garhwal-rifles-museum',
      'lansdowne-war-memorial',
    ],
  },
  'Pauri Garhwal District Administration': {
    organization: 'Pauri Garhwal District Administration',
    url: 'https://pauri.nic.in/tourist-places/',
    ids: [
      'ekeshwar-mahadev', 'kamleshwar-mahadev-srinagar', 'nageshwar-mahadev-srinagar',
      'katkeshwar-mahadev', 'ghandiyal-temple-burhabarsar', 'koteshwar-mahadev-pauri',
      'dhari-devi-temple', 'doodhatoli', 'brahmadungi-memorial', 'tara-kund-pauri',
      'bharat-nagar-pauri', 'kalagarh-ramganga-viewpoint', 'devalgarh', 'rajat-jayanti-park',
    ],
  },
  Rudraprayag: {
    organization: 'Rudraprayag District Administration',
    url: 'https://rudraprayag.gov.in/tourist-place/guptkashi/',
    ids: [
      'ardhanareshwar-temple-guptkashi', 'manikarnik-kund-guptkashi',
      'agasteshwar-temple-augustmuni', 'shiva-temple-rudraprayag', 'jagdamba-temple-rudraprayag',
      'ramgarh-ruins-ronitpur', 'sonprayag-confluence', 'gauri-devi-temple-gaurikund',
      'usha-temple-ukhimath', 'aniruddha-temple-ukhimath', 'bhairav-temple-kedarnath',
      'adi-shankaracharya-samadhi-kedarnath', 'gandhi-sarovar', 'vasuki-tal-rudraprayag',
    ],
  },
  'Rudraprayag provisional reference': {
    organization: 'Secondary place references (verify locally)',
    url: 'https://en.wikipedia.org/wiki/Rudraprayag_district',
    ids: ['nala-stupa-provisional'],
  },
  'Rudraprayag secondary references': {
    organization: 'Secondary place references (verify locally)',
    url: 'https://en.wikipedia.org/wiki/Rudraprayag_district',
    ids: [
      'kartik-swami-temple', 'koteshwar-mahadev-rudraprayag',
      'tungeshwar-mahadev-phalasi', 'basukedar-temple', 'gaurikund',
    ],
  },
  'Tehri Garhwal': {
    organization: 'Tehri Garhwal District Administration',
    url: 'https://tehri.nic.in/tourist-places/',
    ids: [
      'kunjapuri-temple', 'surkanda-devi-temple', 'chandrabadni-temple',
      'dobra-chanti-bridge', 'muni-ki-reti', 'raghunathji-temple-devprayag',
      'brahm-kund-devprayag', 'vasishta-kund-devprayag', 'baital-kund-devprayag',
      'surya-kund-devprayag', 'indradyumna-tirth-devprayag', 'pushyamal-tirth-devprayag',
      'varah-tirth-devprayag', 'pushpavatika-devprayag', 'baitalshila-devprayag',
      'varahishila-devprayag', 'bhairava-shrine-devprayag', 'bhushandi-shrine-devprayag',
      'durga-shrine-devprayag', 'vishveshvara-shrine-devprayag',
      'bharata-temple-devprayag', 'dasharathachal-peak', 'dashrathshila-devprayag',
      'sem-mukhem-temple', 'panwali-kantha', 'masar-tal', 'narendranagar',
      'shanta-stream-devprayag',
    ],
  },
  Dehradun: {
    organization: 'Uttarakhand Tourism',
    url: 'https://uttarakhandtourism.gov.in/destination/mussoorie',
    ids: [
      'kempty-falls', 'gun-hill', 'lal-tibba', 'mussoorie-mall-road',
      'bhatta-falls', 'jharipani-falls', 'george-everest-house',
    ],
  },
  'Dehradun district attractions': {
    organization: 'Dehradun District Administration',
    url: 'https://dehradun.nic.in/tourist-place/rishikesh/',
    ids: ['malsi-deer-park', 'robbers-cave', 'forest-research-institute'],
  },
  Haridwar: {
    organization: 'Haridwar District Administration',
    url: 'https://haridwar.nic.in/tourist-places/',
    ids: ['har-ki-pauri', 'piran-kaliyar', 'sureshwari-devi-temple', 'rajaji-national-park-haridwar'],
  },
  'Haridwar Tourism references': {
    organization: 'Uttarakhand Tourism',
    url: 'https://uttarakhandtourism.gov.in/destination/haridwar',
    ids: ['daksha-mahadev-temple'],
  },
  Nainital: {
    organization: 'Nainital District Administration',
    url: 'https://nainital.nic.in/tourist-places/',
    ids: [
      'naini-lake', 'snow-view-point', 'tiffin-top', 'naina-peak',
      'gb-pant-high-altitude-zoo', 'naina-devi-temple-nainital',
    ],
  },
  'Udham Singh Nagar': {
    organization: 'Secondary place references (verify locally)',
    url: 'https://en.wikipedia.org/wiki/Udham_Singh_Nagar_district',
    ids: ['nanak-sagar', 'chaiti-temple'],
  },
  Uttarkashi: {
    organization: 'Uttarakhand Tourism',
    url: 'https://uttarakhandtourism.gov.in/destination/tapovan',
    ids: [
      'tapovan-uttarkashi', 'shivling-peak-uttarkashi',
      'kedartal-lake', 'gomukh-glacier', 'bhaironghati',
    ],
  },
}

for (const { organization, url, ids = [], additionalIds = [] } of Object.values(districtPlaceReferences)) {
  for (const id of [...ids, ...additionalIds]) {
    destinationSources[id] = {
      organization,
      url,
      checkedAt,
      verifiedFields: ['name', 'district'],
    }
  }
}

export const destinationDataNotes = {
  schemaVersion: 1,
  operationalStatus: 'unknown',
  note: 'Linked district or tourism pages support the named place and district where listed; unreferenced coordinates, altitudes, seasons and route tips are approximate. Sources are not a live open/closed feed. Confirm access locally and verify terms before reuse.',
}
