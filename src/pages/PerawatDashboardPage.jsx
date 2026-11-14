// src/pages/PerawatDashboardPage.jsx
// Halaman Dashboard Perawat (rute '/perawat')
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function PerawatDashboardPage() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  // Nama perawat dari profil
  const nurseName = profile?.full_name?.trim() || 'Perawat'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-6">
        {/* Header Dashboard Perawat */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full mb-1">
              Portal Tenaga Medis
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Dashboard Perawat
            </h1>
            <p className="text-base text-slate-600 mt-0.5">
              Selamat bertugas, {nurseName}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            type="button"
            className="min-h-[44px] px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-base rounded-xl transition duration-150"
          >
            Keluar
          </button>
        </div>

        {/* Info Placeholder Fitur Mendatang */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-950">
            <h2 className="font-semibold text-base mb-1">
              Pemantauan Pasien Homecare
            </h2>
            <p className="text-sm sm:text-base text-indigo-900 leading-relaxed">
              Di halaman ini Anda dapat memantau perkembangan glukosa darah pasien yang ditugaskan, jadwal minum obat, serta catatan tindak lanjut kondisi luka ulkus diabetik.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm sm:text-base">
            <p>
              Daftar pasien binaan dan deteksi dini pasien berisiko (F4) akan diimplementasikan pada Tugas 6.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PerawatDashboardPage
