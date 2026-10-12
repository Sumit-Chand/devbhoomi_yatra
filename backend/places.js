import { destinationSources } from './destination-sources.js'

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
  ['chakrata', 'Chakrata', 'Dehradun', 2118, 30.70, 77.87, M, 'nature,views,trek', 'Walk among the deodar forests|Visit Tiger Falls with care on the trail', 'Check local road conditions before visiting, especially during heavy rain.'],
  ['yamunotri', 'Yamunotri', 'Uttarkashi', 3293, 31.01, 78.46, [5, 6, 9, 10], 'spiritual,trek,views', 'Visit Yamunotri temple during the open season|Plan the walk from Janki Chatti', 'The temple is seasonal; confirm opening dates, registration and route conditions before travel.'],
  ['joshimath', 'Joshimath', 'Chamoli', 1875, 30.56, 79.57, M, 'spiritual,views,adventure,snow', 'Visit the Narsingh temple|Use Joshimath as a base for nearby mountain destinations', 'Check current road, weather and ropeway status before setting out.'],
  ['gopeshwar', 'Gopeshwar', 'Chamoli', 1550, 30.40, 79.32, M, 'culture,spiritual,views', 'Visit the Gopinath temple|Explore the town bazaar and surrounding mountain views'],
  ['mana', 'Mana Village', 'Chamoli', 3200, 30.77, 79.49, [5, 6, 9, 10], 'culture,views,spiritual', 'Walk through the village near Badrinath|Ask locally about seasonal access and visiting hours', 'Access is seasonal and weather-dependent; confirm locally before travelling.'],
  ['deoria-tal', 'Deoria Tal', 'Rudraprayag', 2438, 30.52, 79.05, [4, 5, 6, 9, 10, 11], 'trek,nature,views', 'Walk to the lake from Sari village|Enjoy mountain views from the lakeside', 'Follow local forest rules and carry all litter back down.'],
  ['dharchula', 'Dharchula', 'Pithoragarh', 915, 29.85, 80.54, M, 'culture,views,nature', 'Walk near the Kali river|Explore the town and local markets', 'Some nearby border areas require permits; confirm current rules with local authorities.'],
  ['patal-bhuvaneshwar', 'Patal Bhuvaneshwar', 'Pithoragarh', 1350, 29.68, 80.03, M, 'spiritual,nature,culture', 'Visit the limestone cave temple with a local guide|Explore nearby village landscapes', 'Follow local cave-entry rules and check access before travelling.'],
  ['lohaghat', 'Lohaghat', 'Champawat', 1745, 29.40, 80.09, M, 'culture,views,relax', 'Explore the old town and nearby viewpoints|Visit Abbott Mount with locally confirmed access'],
  ['ramgarh', 'Ramgarh', 'Nainital', 1789, 29.45, 79.56, M, 'nature,views,relax', 'Walk through the orchard country|Enjoy views from village paths', 'Orchard visits are seasonal and may require permission from the host.'],
  ['kalsi', 'Kalsi', 'Dehradun', 780, 30.52, 77.84, W, 'culture,nature', 'Visit the Ashokan rock edict site|Explore the Yamuna and Tons river area'],
  ['vasudhara-falls', 'Vasudhara Falls', 'Chamoli', 4000, 30.77, 79.48, [5, 6, 9, 10], 'trek,nature,views', 'Trek from Mana village toward the waterfall|Enjoy views of the surrounding high Himalayan valley', 'High-altitude access depends on weather and local conditions; confirm the route locally.'],
  ['hemkund-sahib', 'Hemkund Sahib', 'Chamoli', 4632, 30.70, 79.62, [6, 7, 8, 9], 'spiritual,trek,nature,views', 'Trek from Ghangaria to the high-altitude shrine|Plan for a demanding mountain route', 'Seasonal, high-altitude trek. Confirm registration, opening dates, weather and route conditions before travel.'],
  ['tungnath', 'Tungnath Temple', 'Rudraprayag', 3680, 30.49, 79.22, [4, 5, 6, 9, 10, 11], 'spiritual,trek,views', 'Walk the trail from Chopta to Tungnath|Continue toward Chandrashila only if conditions and fitness allow', 'Confirm seasonal access, weather and trail status with local authorities.'],
  ['gairsain', 'Gairsain', 'Chamoli', 1650, 30.06, 79.29, M, 'culture,nature,views', 'Explore the hill town and surrounding villages|Use local guidance for nearby walks'],
  ['abbott-mount', 'Abbott Mount', 'Champawat', 2000, 29.40, 80.08, M, 'views,nature,relax', 'Walk among the forested slopes|Visit the historic chapel area respectfully', 'Confirm property access and local road conditions before visiting.'],
  ['kaladhungi', 'Kaladhungi', 'Nainital', 405, 29.28, 79.35, W, 'wildlife,nature,culture', 'Visit the Jim Corbett heritage museum|Ask locally about permitted forest activities', 'Do not enter forest areas without the required permissions or an authorized guide.'],
  ['jwalpa-devi', 'Jwalpa Devi Temple', 'Pauri Garhwal', 600, 29.94, 78.70, W, 'spiritual,culture,nature', 'Visit the temple on the banks of the Nawalika river|Check local guidance during festival periods'],
  ['kasar-devi', 'Kasar Devi', 'Almora', 2116, 29.69, 79.66, M, 'spiritual,views,nature', 'Visit the hilltop temple|Walk the surrounding ridge paths'],
  ['katarmal-sun-temple', 'Katarmal Sun Temple', 'Almora', 2116, 29.67, 79.62, M, 'culture,spiritual', 'Explore the historic stone temple complex|Use the marked approach trail'],
  ['dwarahat', 'Dwarahat', 'Almora', 1510, 29.78, 79.43, M, 'culture,spiritual', 'Visit the group of historic temples|Explore the old hill town'],
  ['dunagiri-temple', 'Dunagiri Temple', 'Almora', 2500, 29.84, 79.47, M, 'spiritual,views,nature', 'Climb the temple approach steps|Check local access and weather before the visit'],
  ['lakhudiyar', 'Lakhudiyar Rock Shelters', 'Almora', 1200, 29.74, 79.70, M, 'culture,nature', 'View the prehistoric rock-art site respectfully|Follow local directions to the site'],
  ['kafni-glacier', 'Kafni Glacier Trek', 'Bageshwar', 3860, 30.22, 79.99, [5, 6, 9, 10], 'trek,nature,views', 'Plan the multi-day trek with local guidance|Check weather and route conditions before departure', PERMIT],
  ['sunderdhunga-valley', 'Sunderdhunga Valley', 'Bageshwar', 3200, 30.12, 79.95, [5, 6, 9, 10], 'trek,nature,views', 'Arrange a local guide for the remote valley route|Allow time for changing mountain conditions', PERMIT],
  ['kanda', 'Kanda', 'Bageshwar', 1500, 29.91, 79.83, M, 'culture,views,nature', 'Explore the hill town and nearby village paths|Confirm local transport options'],
  ['vijaypur', 'Vijaypur', 'Bageshwar', 2050, 29.95, 79.68, M, 'views,nature,relax', 'Enjoy views of the Himalayan range on clear days|Support local homestays and shops'],
  ['rudranath', 'Rudranath Temple', 'Chamoli', 3600, 30.49, 79.32, [5, 6, 9, 10], 'spiritual,trek,nature,views', 'Reach the seasonal temple by its mountain trail|Plan the trek with current local guidance', 'Remote seasonal trek; check registration, weather and trail conditions before setting out.'],
  ['kalpeshwar', 'Kalpeshwar Temple', 'Chamoli', 2200, 30.55, 79.41, [4, 5, 6, 9, 10, 11], 'spiritual,culture,nature', 'Visit the temple in the Urgam valley|Check road and trail conditions locally'],
  ['adi-badri', 'Adi Badri Temple Complex', 'Chamoli', 1800, 30.03, 79.22, M, 'spiritual,culture', 'Explore the historic temple complex|Respect local worship and site guidelines'],
  ['gwaldam', 'Gwaldam', 'Chamoli', 1700, 30.04, 79.57, M, 'views,nature,relax', 'Use the town as a base for nearby village walks|Check mountain road conditions before travelling'],
  ['urgam-valley', 'Urgam Valley', 'Chamoli', 2100, 30.55, 79.41, M, 'nature,culture,views', 'Walk among the valley villages|Ask locally before entering farms or private paths'],
  ['purnagiri-temple', 'Purnagiri Temple', 'Champawat', 3000, 29.11, 80.08, [3, 4, 5, 6, 9, 10], 'spiritual,trek,views', 'Follow the marked uphill pilgrimage route|Check seasonal crowd and access information locally', 'The steep route and seasonal conditions require preparation; follow current local advice.'],
  ['devidhura', 'Devidhura', 'Champawat', 1800, 29.37, 80.06, M, 'culture,spiritual,nature', 'Visit the Varahi Devi temple area respectfully|Check local arrangements during festivals'],
  ['shyamlatal', 'Shyamlatal Lake', 'Champawat', 1500, 29.22, 80.10, M, 'nature,relax,spiritual', 'Walk beside the lake|Visit the Vivekananda Ashram with respect for its rules'],
  ['mayawati-ashram', 'Mayawati Advaita Ashram', 'Champawat', 1940, 29.43, 80.07, M, 'spiritual,nature,relax', 'Check visitor guidance before arrival|Keep the quiet ashram grounds peaceful'],
  ['pancheshwar', 'Pancheshwar', 'Champawat', 700, 29.25, 80.27, W, 'nature,views,culture', 'See the Kali and Saryu river confluence|Confirm road and riverside conditions locally'],
  ['sahastradhara', 'Sahastradhara', 'Dehradun', 700, 30.39, 78.13, M, 'nature,relax', 'Visit the waterfall and spring area|Use designated paths and keep the water clean'],
  ['tapkeshwar', 'Tapkeshwar Mahadev Temple', 'Dehradun', 640, 30.37, 78.02, M, 'spiritual,culture,nature', 'Visit the riverside cave temple|Check local access during heavy rain'],
  ['asan-conservation-reserve', 'Asan Conservation Reserve', 'Dehradun', 400, 30.44, 77.67, [10, 11, 12, 1, 2, 3], 'wildlife,nature', 'Observe birds quietly from permitted areas|Follow sanctuary and wetland rules'],
  ['lacchiwala', 'Lachhiwala Nature Park', 'Dehradun', 650, 30.27, 78.10, M, 'nature,relax', 'Use marked paths in the forest recreation area|Check current entry and facility status locally'],
  ['mindrolling-monastery', 'Mindrolling Monastery', 'Dehradun', 600, 30.27, 78.00, M, 'culture,spiritual', 'Visit the monastery grounds respectfully|Check visitor hours and photography rules'],
  ['rajaji-national-park', 'Rajaji National Park (Dehradun zone)', 'Dehradun', 500, 30.07, 78.13, [11, 12, 1, 2, 3, 4, 5, 6], 'wildlife,nature', 'Book permitted safari activities through official channels|Follow guide instructions and wildlife rules', 'Park access is seasonal and zone-specific; confirm current openings and permits.'],
  ['chandi-devi-temple', 'Chandi Devi Temple', 'Haridwar', 290, 29.93, 78.17, W, 'spiritual,culture,views', 'Reach the hilltop temple by the permitted route|Check ropeway operation and walking conditions locally'],
  ['mansa-devi-temple', 'Mansa Devi Temple', 'Haridwar', 290, 29.95, 78.16, W, 'spiritual,culture,views', 'Visit the hilltop shrine|Check ropeway status and crowd advisories locally'],
  ['shantikunj', 'Shantikunj', 'Haridwar', 310, 29.99, 78.17, W, 'spiritual,culture', 'Check visitor and accommodation rules in advance|Respect the campus schedule'],
  ['sapta-rishi-ashram', 'Sapta Rishi Ashram', 'Haridwar', 310, 29.99, 78.19, W, 'spiritual,culture', 'Visit the riverside ashram respectfully|Follow local guidance around the Ganga'],
  ['bharat-mata-mandir', 'Bharat Mata Mandir', 'Haridwar', 310, 29.98, 78.17, W, 'culture,spiritual', 'Explore the multi-storey temple|Check opening hours locally'],
  ['sattal', 'Sattal', 'Nainital', 1370, 29.34, 79.55, M, 'nature,wildlife,relax', 'Walk the forest paths around the lakes|Use designated boating services only'],
  ['naukuchiatal', 'Naukuchiatal', 'Nainital', 1220, 29.33, 79.60, M, 'nature,relax,adventure', 'Walk beside the lake|Choose permitted water activities and local operators'],
  ['kainchi-dham', 'Kainchi Dham', 'Nainital', 1400, 29.42, 79.52, M, 'spiritual,culture', 'Follow the ashram visitor guidelines|Plan for traffic and crowds on busy days'],
  ['pangot', 'Pangot', 'Nainital', 2000, 29.40, 79.43, M, 'wildlife,nature,views', 'Go birdwatching with a responsible local guide|Keep noise low in the forest'],
  ['kilbury', 'Kilbury', 'Nainital', 2200, 29.42, 79.42, M, 'wildlife,nature,views', 'Explore the forest area quietly|Check road conditions and local access'],
  ['ghorakhal', 'Ghorakhal', 'Nainital', 2000, 29.39, 79.47, M, 'spiritual,views,nature', 'Visit the Golu Devta temple respectfully|Check local access and crowd conditions'],
  ['srinagar-garhwal', 'Srinagar Garhwal', 'Pauri Garhwal', 560, 30.22, 78.78, M, 'culture,spiritual', 'Explore the town and riverside ghats|Take care near the river, especially during rains'],
  ['tarkeshwar-mahadev', 'Tarkeshwar Mahadev Temple', 'Pauri Garhwal', 1800, 29.87, 78.83, M, 'spiritual,nature', 'Visit the temple among the deodar forest|Confirm the approach road locally'],
  ['kandoliya', 'Kandoliya Temple and Park', 'Pauri Garhwal', 1800, 30.15, 78.78, M, 'spiritual,views,nature', 'Walk the forested paths near Pauri|Use the designated picnic areas'],
  ['neelkanth-mahadev', 'Neelkanth Mahadev Temple', 'Pauri Garhwal', 1300, 30.12, 78.32, M, 'spiritual,nature,trek', 'Visit the temple by the road or marked route|Check traffic and access locally'],
  ['devprayag', 'Devprayag', 'Tehri Garhwal', 830, 30.15, 78.60, M, 'spiritual,culture,nature', 'View the Alaknanda and Bhagirathi confluence from permitted areas|Use care on steep riverside steps'],
  ['askot', 'Askot Wildlife Sanctuary', 'Pithoragarh', 1650, 29.77, 80.34, M, 'wildlife,nature,views', 'Arrange local guidance before exploring remote areas|Follow forest permissions and wildlife rules'],
  ['gangolihat', 'Gangolihat', 'Pithoragarh', 1750, 29.67, 80.05, M, 'culture,spiritual,views', 'Visit the Hat Kalika temple respectfully|Use local directions for nearby viewpoints'],
  ['berinag', 'Berinag', 'Pithoragarh', 1860, 29.78, 80.07, M, 'views,nature,relax', 'Enjoy mountain views on clear days|Explore local tea gardens only with permission'],
  ['narayan-ashram', 'Narayan Ashram', 'Pithoragarh', 2730, 29.98, 80.54, [4, 5, 6, 9, 10], 'spiritual,nature,views', 'Confirm visitor access before travelling to the remote ashram|Check road and weather conditions'],
  ['jauljibi', 'Jauljibi', 'Pithoragarh', 600, 29.85, 80.34, M, 'culture,nature', 'Visit the Kali and Gori river confluence|Check local border-area guidance and road access'],
  ['guptkashi', 'Guptkashi', 'Rudraprayag', 1319, 30.52, 79.08, M, 'spiritual,culture,views', 'Visit the Vishwanath temple area|Use the town as a base only after checking current routes'],
  ['ukhimath', 'Ukhimath', 'Rudraprayag', 1317, 30.52, 79.20, M, 'spiritual,culture,views', 'Visit the Omkareshwar temple|Confirm seasonal ceremonies and local access'],
  ['triyuginarayan', 'Triyuginarayan Temple', 'Rudraprayag', 1980, 30.64, 78.99, M, 'spiritual,culture,nature', 'Visit the temple village respectfully|Check road conditions and local transport'],
  ['kalimath', 'Kalimath Temple', 'Rudraprayag', 1800, 30.60, 78.95, M, 'spiritual,culture,nature', 'Follow temple customs and local directions|Check access conditions before travelling'],
  ['madhyamaheshwar', 'Madhyamaheshwar Temple Trek', 'Rudraprayag', 3497, 30.63, 79.22, [5, 6, 9, 10], 'spiritual,trek,nature,views', 'Plan the multi-day trek with local guidance|Check weather, accommodation and trail conditions', 'Remote seasonal trek; confirm route and registration requirements locally.'],
  ['new-tehri', 'New Tehri', 'Tehri Garhwal', 1550, 30.38, 78.48, M, 'culture,views,relax', 'Explore the hill town viewpoints|Check local access to lake activities'],
  ['chamba-tehri', 'Chamba', 'Tehri Garhwal', 1676, 30.34, 78.39, M, 'views,nature,relax', 'Enjoy views over the Bhagirathi valley|Use local guidance for nearby village walks'],
  ['kanatal', 'Kanatal', 'Tehri Garhwal', 2590, 30.41, 78.31, M, 'nature,views,relax', 'Walk the forest trails with local guidance|Check road and weather conditions'],
  ['khatling-glacier', 'Khatling Glacier Trek', 'Tehri Garhwal', 3717, 30.68, 78.78, [5, 6, 9, 10], 'trek,nature,views', 'Arrange experienced local support for the remote trek|Check permits, weather and trail conditions', PERMIT],
  ['gularbhoj', 'Gularbhoj Reservoir', 'Udham Singh Nagar', 250, 29.02, 79.20, W, 'nature,relax,wildlife', 'Enjoy the reservoir landscape from public areas|Follow local boating and safety rules'],
  ['begul-reservoir', 'Begul Reservoir', 'Udham Singh Nagar', 230, 28.97, 79.50, W, 'nature,wildlife,relax', 'Observe wetland birds from a respectful distance|Check local access before visiting'],
  ['atariya-temple', 'Atariya Temple', 'Udham Singh Nagar', 220, 28.98, 79.41, W, 'spiritual,culture', 'Visit the temple respectfully|Check opening and festival arrangements locally'],
  ['dronasagar', 'Dronasagar Lake', 'Udham Singh Nagar', 220, 29.21, 78.96, W, 'culture,spiritual,relax', 'Visit the lake and nearby heritage area|Follow local site guidance'],
  ['moteshwar-temple', 'Moteshwar Mahadev Temple', 'Udham Singh Nagar', 220, 29.20, 78.95, W, 'spiritual,culture', 'Visit the temple respectfully|Confirm local access and festival arrangements'],
  ['harsil', 'Harsil', 'Uttarkashi', 2620, 30.74, 78.45, [4, 5, 6, 9, 10, 11], 'nature,views,relax', 'Walk through the valley and village paths|Check road, weather and any local access restrictions'],
  ['dodital', 'Dodital Lake Trek', 'Uttarkashi', 3024, 30.87, 78.55, [4, 5, 6, 9, 10, 11], 'trek,nature,views', 'Plan the trek with local guidance|Check permits, weather and trail conditions', PERMIT],
  ['har-ki-dun', 'Har Ki Dun Valley Trek', 'Uttarkashi', 3566, 31.13, 78.28, [4, 5, 6, 9, 10, 11], 'trek,nature,views', 'Arrange a responsible local guide for the multi-day trek|Check current trail and weather conditions', PERMIT],
  ['nachiketa-tal', 'Nachiketa Tal', 'Uttarkashi', 2450, 30.71, 78.42, M, 'trek,nature,views', 'Reach the lake by the marked forest path|Check local trail conditions before starting'],
  ['maneri-dam', 'Maneri Dam', 'Uttarkashi', 1300, 30.84, 78.51, M, 'nature,views', 'View the river valley from permitted public areas|Respect dam security restrictions'],
  ['gangnani', 'Gangnani Hot Springs', 'Uttarkashi', 2100, 30.89, 78.63, M, 'nature,relax,spiritual', 'Use designated bathing areas and follow local customs|Check access and water conditions locally'],
]

const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MAX_PLACES_PER_DISTRICT = 100
const placeIds = new Set()
const placeCounts = new Map()
for (const [id, name, district] of rows) {
  if (placeIds.has(id)) throw new Error(`Duplicate destination ID: ${id}`)
  placeIds.add(id)
  const count = (placeCounts.get(district) || 0) + 1
  if (count > MAX_PLACES_PER_DISTRICT) throw new Error(`Destination limit of ${MAX_PLACES_PER_DISTRICT} exceeded for ${district}`)
  placeCounts.set(district, count)
}

function seasonText(ms) {
  const runs = []
  for (const m of [...ms].sort((a, b) => a - b)) { const r = runs.at(-1); r && m === r[1] + 1 ? (r[1] = m) : runs.push([m, m]) }
  if (runs.length > 1 && runs[0][0] === 1 && runs.at(-1)[1] === 12) runs[0][0] = runs.pop()[0]
  return runs.map(([a, b]) => (a === b ? MN[a - 1] : `${MN[a - 1]} to ${MN[b - 1]}`)).join(', ')
}

export const places = rows.map(([id, name, district, altitude, lat, lng, months, tags, hl, tip]) => ({
  id, name, district, region: REGION[district], altitude, lat, lng, months, season: seasonText(months), tags: tags.split(','), highlights: hl.split('|'),
  operationalStatus: 'unknown',
  sources: destinationSources[id] ? [destinationSources[id]] : [],
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
