// src/pages/UnsupportedRolePage.jsx
// Halaman fallback jika akun memiliki peran di luar 'patient' atau 'nurse' (mis. role 'admin')
import { useAuth } from '../hooks/useAuth'

function UnsupportedRolePage() {
  const { profile, signOut } = useAuth()

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
          onClick={signOut}
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
