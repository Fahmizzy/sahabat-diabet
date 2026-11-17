// src/pages/HomePage.jsx
// Halaman Beranda Pasien (rute '/')
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useGlucose, formatDateTimeIndonesian } from '../hooks/useGlucose'
import CategoryBadge from '../components/CategoryBadge'
import BottomNavbar from '../components/BottomNavbar'

function HomePage() {
  const { profile, signOut } = useAuth()
  const { lastLog, loadingLogs, getCategoryMeta } = useGlucose()
  const navigate = useNavigate()

  // Nama pasien dari profil (fallback ke sapaan umum jika kosong)
  const patientName = profile?.full_name?.trim() || 'Pasien'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const lastLogMeta = lastLog ? getCategoryMeta(lastLog.test_type, lastLog.category) : null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pb-24">
      <main className="w-full max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Header Profil Pasien & Tombol Keluar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full mb-1">
                Pasien
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Halo, {patientName}
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              type="button"
              className="min-h-[44px] px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-base rounded-xl transition duration-150"
            >
              Keluar
            </button>
          </div>

          <p className="text-sm text-slate-600 mt-4 leading-relaxed">
            Selamat datang di SahabatDiabet. Pantau kestabilan gula darah Anda untuk mendukung proses penyembuhan luka.
          </p>
        </div>

        {/* Kartu Gula Darah Terakhir */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              Gula Darah Terakhir
            </h2>
            <Link
              to="/gula-darah"
              className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 underline"
            >
              Lihat Semua →
            </Link>
          </div>

          {loadingLogs ? (
            <div className="py-6 text-center text-slate-400 text-sm">
              Memeriksa catatan terakhir...
            </div>
          ) : lastLog ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {lastLog.test_type === 'preprandial'
                    ? 'Sebelum makan / puasa'
                    : '1–2 jam setelah makan'}
                </span>
                <CategoryBadge
                  category={lastLog.category}
                  label={lastLogMeta?.label}
                />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">
                  {lastLog.value_mgdl}
                </span>
                <span className="text-base text-slate-600 font-semibold">
                  mg/dL
                </span>
              </div>

              <div className="text-xs text-slate-500">
                Waktu pemeriksaan: {formatDateTimeIndonesian(lastLog.measured_at)}
              </div>

              {/* Kalimat Wajib Batasan Medis */}
              <p className="text-[11px] sm:text-xs text-slate-500 italic pt-1 border-t border-slate-200">
                * Hasil ini bukan diagnosis. Konsultasikan dengan perawat atau dokter.
              </p>
            </div>
          ) : (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
              <p className="text-sm text-slate-600">
                Belum ada catatan gula darah mandiri yang tersimpan.
              </p>
              <Link
                to="/gula-darah"
                className="inline-flex items-center justify-center min-h-[44px] w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base rounded-xl transition duration-150 shadow-sm"
              >
                Catat Gula Darah Sekarang
              </Link>
            </div>
          )}

          {lastLog && (
            <Link
              to="/gula-darah"
              className="mt-4 inline-flex items-center justify-center min-h-[44px] w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base rounded-xl transition duration-150 shadow-sm"
            >
              + Catat Gula Darah Baru
            </Link>
          )}
        </div>
      </main>

      {/* Navigasi Bawah */}
      <BottomNavbar />
    </div>
  )
}

export default HomePage
