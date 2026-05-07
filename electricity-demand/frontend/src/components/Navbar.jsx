import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import PreviousMap_ from 'postcss/lib/previous-map';
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";


const links = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Predict' },
  { to: '/regions', label: 'Regions' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed  w-full top-0 z-50 glass border-b border-blue-100/60 shadow-sm">
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

        {/* Desktop hidden in mobile Nav */}
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
          <MdOutlineKeyboardArrowRight />
        </button>

        {/* Mobile */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setMenuOpen(prev => !prev)} 
        >
          {menuOpen
            ? <IoMdClose />
            : <GiHamburgerMenu />}
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
                `px-3 py-2.5 rounded-lg text-sm font-semibold ${
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
