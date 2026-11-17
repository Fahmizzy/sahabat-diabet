// src/components/BottomNavbar.jsx
// Navigasi bawah (bottom navbar) khusus pengguna pasien (mobile-first)
import { Link, useLocation } from 'react-router-dom'

function BottomNavbar() {
  const location = useLocation()
  const currentPath = location.pathname

  const isHomeActive = currentPath === '/'
  const isGlucoseActive = currentPath.startsWith('/gula-darah')

  return (
    <nav
      aria-label="Navigasi Utama Pasien"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.35rem)' }}
    >
      <div className="max-w-md mx-auto px-4 flex items-center justify-around h-16">
        {/* Menu Beranda */}
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition duration-150 rounded-xl ${
            isHomeActive
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <svg
            className="w-6 h-6 mb-0.5"
            fill={isHomeActive ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-xs">Beranda</span>
        </Link>

        {/* Menu Gula Darah */}
        <Link
          to="/gula-darah"
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition duration-150 rounded-xl ${
            isGlucoseActive
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <svg
            className="w-6 h-6 mb-0.5"
            fill={isGlucoseActive ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-xs">Gula Darah</span>
        </Link>
      </div>
    </nav>
  )
}

export default BottomNavbar
