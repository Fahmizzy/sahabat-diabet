// src/pages/HomePage.jsx
// Halaman Beranda Pasien (rute '/')
import { useAuth } from '../hooks/useAuth'

function HomePage() {
  const { profile, signOut } = useAuth()

  // Nama pasien dari profil (fallback ke sapaan umum jika kosong)
  const patientName = profile?.full_name?.trim() || 'Pasien'

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-6">
        {/* Header Sapaan Pasien */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full mb-1">
              Pasien
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Halo, {patientName}
            </h1>
          </div>
          <button
            onClick={signOut}
            type="button"
            className="min-h-[44px] px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-base rounded-xl transition duration-150"
          >
            Keluar
          </button>
        </div>

        {/* Informasi Ringkasan Awal */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900">
            <h2 className="font-semibold text-base mb-1">
              Selamat datang di SahabatDiabet
            </h2>
            <p className="text-sm sm:text-base text-emerald-800 leading-relaxed">
              Aplikasi pendamping mandiri untuk pemantauan kadar gula darah, perawatan luka ulkus, dan pengingat jadwal obat harian Anda.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm sm:text-base">
            <p>
              Fitur pencatatan gula darah mandiri (F1), grafik tren, dan pengingat jadwal perawatan akan hadir pada tugas selanjutnya.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HomePage
