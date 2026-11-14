// src/components/ProtectedRoute.jsx
// Komponen pelindung rute berdasarkan status autentikasi dan peran (role) pengguna
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth, getHomePath } from '../hooks/useAuth'

/**
 * CATATAN KEAMANAN:
 * Pengalihan berdasarkan role di sisi frontend ini HANYA bertujuan untuk kenyamanan
 * antarmuka pengguna (UX), BUKAN mekanisme keamanan akses data.
 * Keamanan data sesungguhnya dilindungi sepenuhnya oleh Row Level Security (RLS) di Supabase.
 *
 * @param {Object} props
 * @param {string[]} [props.allowedRoles] - Daftar peran yang diizinkan mengakses rute ini
 * @param {React.ReactNode} props.children - Komponen anak yang akan dirender jika lolos
 */
function ProtectedRoute({ allowedRoles, children }) {
  const navigate = useNavigate()
  const {
    user,
    profile,
    loading,
    profileError,
    profileNotFound,
    refetchProfile,
    signOut,
  } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  // 1. TAHAP PEMUATAN:
  // Selama sesi DAN profil masih dimuat (loading === true),
  // ProtectedRoute TIDAK BOLEH mengambil keputusan pengalihan atau menampilkan pesan error
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-base font-medium text-slate-700">
          Memeriksa sesi dan profil...
        </p>
      </div>
    )
  }

  // 2. BELUM LOGIN:
  // Alihkan langsung ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 3. ERROR JARINGAN SAAT MEMUAT PROFIL:
  // Tampilkan pesan kendala koneksi dengan tombol Coba Lagi dan Keluar
  // Dirender di tempat (in-place) tanpa memicu loop redirect
  if (profileError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-rose-200 p-6 text-center">
          <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Gagal Memuat Profil
          </h2>
          <p className="text-slate-600 text-base mb-6">
            Terjadi kendala saat menghubungkan ke basis data. Silakan periksa koneksi internet Anda.
          </p>
          <div className="space-y-3">
            <button
              onClick={refetchProfile}
              type="button"
              className="w-full min-h-[44px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base rounded-xl transition duration-150"
            >
              Coba Lagi
            </button>
            <button
              onClick={handleSignOut}
              type="button"
              className="w-full min-h-[44px] px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-base rounded-xl transition duration-150"
            >
              Keluar
            </button>
          </div>
        </div>
      </main>
    )
  }

  // 4. PROFIL BELUM TERSEDIA DI DATABASE (maybeSingle menghasilkan null):
  // Akun ada di auth.users tetapi baris profiles belum terbentuk
  // Tampilkan pesan jelas dan tombol Keluar (jangan crash dan jangan menebak role)
  if (profileNotFound || !profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-amber-200 p-6 text-center">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ℹ️
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Profil Belum Tersedia
          </h2>
          <p className="text-slate-600 text-base mb-6">
            Profil akun Anda belum tersedia di sistem. Silakan hubungi admin atau tenaga medis yang bertugas.
          </p>
          <button
            onClick={signOut}
            type="button"
            className="w-full min-h-[44px] px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium text-base rounded-xl transition duration-150"
          >
            Keluar
          </button>
        </div>
      </main>
    )
  }

  // 5. PERAN TIDAK DIDUKUNG (mis. role 'admin'):
  // Alihkan ke halaman /tidak-didukung
  if (profile.role !== 'patient' && profile.role !== 'nurse') {
    return <Navigate to="/tidak-didukung" replace />
  }

  // 6. PERIKSA KECOCOKAN ROLE:
  // Jika role pengguna tidak termasuk dalam allowedRoles, alihkan ke beranda perannya
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    const destination = getHomePath(profile.role)
    return <Navigate to={destination} replace />
  }

  // Lolos semua pemeriksaan → render komponen target
  return children
}

export default ProtectedRoute
