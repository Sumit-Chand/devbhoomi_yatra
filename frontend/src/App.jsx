import { NavLink, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Destinations from './pages/Destinations.jsx'
import Report from './pages/Report.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Alerts from './pages/Alerts.jsx'
import Planner from './pages/Planner.jsx'
import Login from './pages/Login.jsx'
import VerifyAdmin from './pages/VerifyAdmin.jsx'
import { useAuth } from './auth.jsx'
import { Mountain } from 'lucide-react'

const scenicBackgrounds = {
  '/destinations': {
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Panorama_of_Himalayas_from_Ranikhet%2C_Uttarakhand%2C_India.jpg/1920px-Panorama_of_Himalayas_from_Ranikhet%2C_Uttarakhand%2C_India.jpg',
    pageUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Himalayas_from_Ranikhet,_Uttarakhand,_India.jpg',
    credit: 'Harshit SR / UnpetitproleX · CC BY-SA 4.0',
  },
  '/alerts': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Symmetrical_Himalayas.jpg',
    pageUrl: 'https://commons.wikimedia.org/wiki/File:Symmetrical_Himalayas.jpg',
    credit: 'Shubhang99 · CC BY-SA 4.0',
  },
  '/planner': {
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Mountains_as_seen_from_Valley_of_Flowers%2C_Uttarakhand.jpg/1280px-Mountains_as_seen_from_Valley_of_Flowers%2C_Uttarakhand.jpg',
    pageUrl: 'https://commons.wikimedia.org/wiki/File:Mountains_as_seen_from_Valley_of_Flowers,_Uttarakhand.jpg',
    credit: 'Kp.vasant · CC BY-SA 4.0',
  },
  '/dashboard': {
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Mountains_as_seen_from_Valley_of_Flowers%2C_Uttarakhand.jpg/1280px-Mountains_as_seen_from_Valley_of_Flowers%2C_Uttarakhand.jpg',
    pageUrl: 'https://commons.wikimedia.org/wiki/File:Mountains_as_seen_from_Valley_of_Flowers,_Uttarakhand.jpg',
    credit: 'Kp.vasant · CC BY-SA 4.0',
  },
  '/report': {
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Valley_of_Flowers_National_Park_05.JPG/1280px-Valley_of_Flowers_National_Park_05.JPG',
    pageUrl: 'https://commons.wikimedia.org/wiki/File:Valley_of_Flowers_National_Park_05.JPG',
    credit: 'Guptaele · CC BY-SA 4.0',
  },
}

const link = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-marigold text-ink' : 'text-snow hover:bg-white/10'}`

function RequireAuth({ children }) {
  const { user } = useAuth()
  const loc = useLocation()
  return user ? children : <Navigate to="/login" state={{ from: loc.pathname }} replace />
}

export default function App() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const background = scenicBackgrounds[pathname]
  return (
    <div className="min-h-screen flex flex-col">
      <header className="site-header">
        <nav className="site-nav" aria-label="Main">
          <Link to="/" className="site-brand"><span className="site-brand__symbol" aria-hidden="true"><Mountain size={19} strokeWidth={1.8} /></span><span>Devbhoomi Yatra</span></Link>
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
      <main
        className={`site-main flex-1${background ? ' site-main--scenic' : ''}`}
        style={background ? { '--site-background-image': `url("${background.image}")` } : undefined}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<Report />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-admin" element={<VerifyAdmin />} />
          <Route path="/planner" element={<RequireAuth><Planner /></RequireAuth>} />
          <Route path="*" element={
            <div className="max-w-5xl mx-auto px-4 py-16">
              <h1 className="text-3xl font-bold">Page not found</h1>
              <p className="mt-2">Check the address, or <Link className="underline" to="/">go back home</Link>.</p>
            </div>} />
        </Routes>
        {background && (
            <a
              className="photo-credit site-background-credit"
              href={background.pageUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Background photo attribution: ${background.credit}`}
              title={`Background photo: ${background.credit}`}
            >
              Background photo · {background.credit}
            </a>
        )}
      </main>
    </div>
  )
}
