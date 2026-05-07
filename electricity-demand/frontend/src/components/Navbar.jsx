import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/',          label: 'Home' },
  { to: '/predict',   label: 'Predict' },
  { to: '/regions',   label: 'Regions' },
  { to: '/about',     label: 'About' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass border-b border-blue-100/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md group-hover:shadow-primary-600/40 transition-shadow">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-primary-800 text-base leading-none">PowerDemand</div>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `nav-link text-sm font-semibold transition-colors duration-200 ${
                  isActive ? 'active text-primary-600' : 'text-slate-700 hover:text-slate-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <button
          onClick={() => navigate('/predict')}
          className="hidden md:flex btn-primary text-sm items-center gap-2"
        >
          Start Prediction
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
        </button>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen
            ? <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            : <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={() => { navigate('/predict'); setMenuOpen(false) }}
            className="mt-2 btn-primary text-sm w-full justify-center flex"
          >
            Start Prediction →
          </button>
        </div>
      )}
    </header>
  )
}
