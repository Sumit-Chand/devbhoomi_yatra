import { NavLink, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Destinations from './pages/Destinations.jsx'
import Report from './pages/Report.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Alerts from './pages/Alerts.jsx'
import Planner from './pages/Planner.jsx'
import Login from './pages/Login.jsx'
import { useAuth } from './auth.jsx'

const link = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-marigold text-ink' : 'text-snow hover:bg-white/10'}`

function RequireAuth({ children }) {
  const { user } = useAuth()
  const loc = useLocation()
  return user ? children : <Navigate to="/login" state={{ from: loc.pathname }} replace />
}

export default function App() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-pine">
        <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-1" aria-label="Main">
          <Link to="/" className="font-display text-xl text-snow mr-auto">Devbhoomi Yatra</Link>
          <NavLink to="/destinations" className={link}>Destinations</NavLink>
          <NavLink to="/alerts" className={link}>Alerts</NavLink>
          <NavLink to="/planner" className={link}>Trip planner</NavLink>
          <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
          <NavLink to="/report" className={link}>Report an issue</NavLink>
          {user
            ? <button onClick={logout} className="px-3 py-2 text-sm text-snow hover:bg-white/10 rounded-md">Log out ({user.name})</button>
            : <NavLink to="/login" className={link}>Log in</NavLink>}
        </nav>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<Report />} />
          <Route path="/login" element={<Login />} />
          <Route path="/planner" element={<RequireAuth><Planner /></RequireAuth>} />
          <Route path="*" element={
            <div className="max-w-5xl mx-auto px-4 py-16">
              <h1 className="text-3xl font-bold">Page not found</h1>
              <p className="mt-2">Check the address, or <Link className="underline" to="/">go back home</Link>.</p>
            </div>} />
        </Routes>
      </main>
      <footer className="bg-ink text-snow/80 text-sm">
        <p className="max-w-5xl mx-auto px-4 py-4">Destination and alert information on this site is sample data. Confirm road, weather and permit details with local authorities before you travel.</p>
      </footer>
    </div>
  )
}
