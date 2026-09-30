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

All destination, alert, dashboard and score data is SAMPLE data and labelled as such.
Never commit `.env` (it is git-ignored).
