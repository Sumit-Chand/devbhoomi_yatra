# Devbhoomi Yatra

Project layout:

```
devbhoomi-yatra/
├── backend/    # Express API
└── frontend/   # Vite + React + Tailwind (needs src/main.jsx, src/index.css)
```

**Backend** (http://localhost:5000)
```
cd backend && npm install && cp .env.example .env && npm run dev
```

**Frontend** (http://localhost:5173, proxies /api to the backend)
```
cd frontend && npm install && npm run dev
```

Destinations and trip-planner details are curated sample information and may be approximate. The catalog supports at most 100 destination records per district; the backend validates this limit when it loads the curated data. The travel updates page retrieves official public alerts from NDMA SACHET and forecast data from Open-Meteo through the backend. Forecasts are not official warnings, and the project does not have a live road-closure feed. Live data is cached for up to 10 minutes; if a source is unavailable, previously retrieved data is marked as stale.

Weather data is attributed to [Open-Meteo](https://open-meteo.com/). Official alerts are attributed to [NDMA SACHET](https://sachet.ndma.gov.in/).

The destinations page includes an explainable, content-based recommender that ranks curated destinations by selected interest tags, region and listed best months. It is not a trained machine-learning model and does not make safety recommendations. Destination records expose field-level source references where checked; currently verified Tourist Care references cover access for Yamunotri, Gangotri, Kedarnath and Badrinath. Remaining facts and recommendation tags are curated, and every destination's current operating/access status is explicitly unknown until confirmed through a current authority notice. See [backend/destination-sources.js](./backend/destination-sources.js). Check source reuse terms before bulk republication.

Visitors can optionally rate a destination suggestion. Feedback contains the destination ID, 1-5 rating, selected interest tags, region and month; the application does not store names, email addresses, account IDs, or browser/session IDs. The rating request is sent without the user's login token. Only aggregate per-destination rating summaries are returned publicly. MongoDB is required to retain feedback across backend restarts; the in-memory fallback is temporary. Do not train or claim a personalized model until enough real feedback has been collected and evaluated.

The destinations page opens with one district tile per district; selecting a district shows its places as clickable photo tiles, and selecting a place opens its detail dialog with aggregate suggestion-feedback scores. District and place tile images use community-sourced Wikimedia Commons photos when the Commons search returns a clearly named, license-attributed match. Each displayed image links to its Commons file page and includes available creator and license attribution; visitors should verify the image subject and reuse conditions there. The backend caches image lookups for up to six hours. If no matching licensed image is found, the tile uses a labeled fallback instead of substituting an unrelated photo. More destination records are curated and approximate, not a live status feed.

Users and reports are persisted in MongoDB when `MONGODB_URI` is set in `backend/.env`. Without it, the backend explicitly runs in temporary in-memory mode, and those records are lost when it restarts. For local development, you can use a local MongoDB server or a MongoDB Atlas database connection string. Keep the connection string private and never commit it. Existing in-memory records are not automatically migrated into MongoDB.

To enable admin email verification, set `ADMIN_EMAIL`, `RESEND_API_KEY`, `EMAIL_FROM` (a sender address verified with Resend), and `PUBLIC_APP_URL` in `backend/.env`. Only the configured admin email receives an admin role, and only after opening the one-time verification link sent through Resend. Links expire after 30 minutes. Existing unverified admin records must log in with their configured email to request verification; admin-only API actions also check the stored verified role, so old admin tokens alone do not grant access. Keep all mail credentials private and never commit `.env`.

Never commit `.env` (it is git-ignored).
