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

Destinations and trip-planner details are curated sample information and may be approximate. The travel updates page retrieves official public alerts from NDMA SACHET and forecast data from Open-Meteo through the backend. Forecasts are not official warnings, and the project does not have a live road-closure feed. Live data is cached for up to 10 minutes; if a source is unavailable, previously retrieved data is marked as stale.

Weather data is attributed to [Open-Meteo](https://open-meteo.com/). Official alerts are attributed to [NDMA SACHET](https://sachet.ndma.gov.in/).
Never commit `.env` (it is git-ignored).
