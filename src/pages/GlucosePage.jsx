// src/pages/GlucosePage.jsx
// Halaman utama pencatatan dan riwayat gula darah pasien (/gula-darah)
import { Link } from 'react-router-dom'
import GlucoseForm from '../components/GlucoseForm'
import GlucoseChart from '../components/GlucoseChart'
import GlucoseHistory from '../components/GlucoseHistory'
import BottomNavbar from '../components/BottomNavbar'

function GlucosePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pb-24">
      <main className="w-full max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Header Halaman */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gula Darah
            </h1>
            <p className="text-sm text-slate-500">
              Catat dan pantau kestabilan gula darah mandiri
            </p>
          </div>

          <Link
            to="/gula-darah/nilai-normal"
            className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-xl transition duration-150 text-center"
          >
            Tabel Nilai Normal
          </Link>
        </div>

        {/* 1. Form Pencatatan */}
        <section aria-labelledby="form-section">
          <GlucoseForm />
        </section>

        {/* 2. Grafik Tren Glukosa */}
        <section aria-labelledby="chart-section">
          <GlucoseChart />
        </section>

        {/* 3. Daftar Riwayat Pemeriksaan */}
        <section aria-labelledby="history-section">
          <GlucoseHistory />
        </section>
      </main>

      {/* Navigasi Bawah */}
      <BottomNavbar />
    </div>
  )
}

export default GlucosePage
