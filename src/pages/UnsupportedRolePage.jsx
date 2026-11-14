// src/pages/UnsupportedRolePage.jsx
// Halaman fallback jika akun memiliki peran di luar 'patient' atau 'nurse' (mis. role 'admin')
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function UnsupportedRolePage() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()

  // Tunggu hingga status sesi selesai diperiksa
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="w-10 h-10 border-4 border-slate-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-base font-medium text-slate-700">
          Memeriksa akun...
        </p>
      </div>
    )
  }

  // Jika belum login atau sudah logout, alihkan ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Jika peran ternyata pasien atau perawat, alihkan ke beranda masing-masing
  if (profile?.role === 'patient') {
    return <Navigate to="/" replace />
  }
  if (profile?.role === 'nurse') {
    return <Navigate to="/perawat" replace />
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Peran Belum Didukung
        </h1>
        <p className="text-slate-600 text-base mb-6">
          Akun Anda terdaftar dengan peran{' '}
          <span className="font-semibold text-slate-800">
            {profile?.role || 'tidak dikenal'}
          </span>
          . Antarmuka untuk peran ini belum tersedia pada prototipe aplikasi ini.
        </p>
        <button
          onClick={handleSignOut}
          type="button"
          className="w-full min-h-[44px] px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium text-base rounded-xl transition duration-150"
        >
          Keluar dari Akun
        </button>
      </div>
    </main>
  )
}

export default UnsupportedRolePage
