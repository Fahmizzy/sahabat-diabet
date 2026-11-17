// src/pages/NilaiNormalPage.jsx
// Halaman informasi Tabel Nilai Normal rujukan (/gula-darah/nilai-normal)
import { Link } from 'react-router-dom'
import { useGlucose, formatRangeNotation } from '../hooks/useGlucose'
import CategoryBadge from '../components/CategoryBadge'
import BottomNavbar from '../components/BottomNavbar'

function NilaiNormalPage() {
  const { referenceRanges, loadingRanges } = useGlucose()

  // Pisahkan rentang target kendali harian dan kriteria diagnosis
  const controlTargets = referenceRanges.filter((r) => r.purpose === 'control_target')
  const diagnostics = referenceRanges.filter((r) => r.purpose === 'diagnostic')

  const formatTestTypeLabel = (type) => {
    switch (type) {
      case 'preprandial':
        return 'Sebelum Makan / Puasa'
      case 'postprandial':
        return '1–2 Jam Setelah Makan'
      case 'gdp':
        return 'Glukosa Darah Puasa (Lab)'
      case 'gd2pp':
        return 'Glukosa 2 Jam Post-Prandial (TTGO)'
      case 'hba1c':
        return 'Hemoglobin A1c (HbA1c)'
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pb-24">
      <main className="w-full max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Tombol Kembali & Header */}
        <div>
          <Link
            to="/gula-darah"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 mb-2 min-h-[44px]"
          >
            ← Kembali ke Catat Gula Darah
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            Tabel Nilai Rujukan
          </h1>
          <p className="text-sm text-slate-500">
            Nilai normal resmi berdasarkan pedoman PERKENI 2021
          </p>
        </div>

        {loadingRanges ? (
          <div className="p-12 text-center text-slate-500 text-base">
            Memuat tabel rujukan dari basis data...
          </div>
        ) : (
          <>
            {/* BAGIAN 1: TARGET KENDALI GULA DARAH */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  1. Target Kendali Gula Darah Mandiri
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Digunakan untuk menilai hasil pemeriksaan harian Anda menggunakan glukometer di rumah.
                </p>
              </div>

              {/* Tabel Responsif (dengan overflow-x-auto untuk layar 360px) */}
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[320px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 px-2 font-semibold">Pemeriksaan</th>
                      <th className="py-2.5 px-2 font-semibold">Rentang Nilai</th>
                      <th className="py-2.5 px-2 font-semibold">Kategori / Label</th>
                      <th className="py-2.5 px-2 font-semibold">Sumber</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {controlTargets.map((item) => {
                      const isPlaceholder = item.source?.startsWith('PLACEHOLDER')
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-2 font-medium text-slate-900">
                            {formatTestTypeLabel(item.test_type)}
                          </td>
                          <td className="py-2.5 px-2 font-bold text-slate-800 whitespace-nowrap">
                            {formatRangeNotation(item)}
                          </td>
                          <td className="py-2.5 px-2">
                            <CategoryBadge
                              category={item.category}
                              label={item.label}
                              className="text-xs py-0.5 px-2.5"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-xs text-slate-500">
                            {item.source}
                            {isPlaceholder && (
                              <span className="block text-amber-700 font-semibold mt-0.5">
                                (belum diverifikasi)
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* BAGIAN 2: KRITERIA DIAGNOSIS (INFORMASI EDUKASI UMUM) */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  2. Kriteria Diagnosis Laboratorium
                </h2>
                <div className="mt-2 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs sm:text-sm">
                  ℹ️ <strong>Informasi Umum:</strong> Nilai ini digunakan oleh dokter di laboratorium untuk diagnosis medis. <em>Bukan</em> batas target kendali harian darah kapiler Anda di rumah.
                </div>
              </div>

              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[320px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 px-2 font-semibold">Pemeriksaan</th>
                      <th className="py-2.5 px-2 font-semibold">Rentang</th>
                      <th className="py-2.5 px-2 font-semibold">Klasifikasi</th>
                      <th className="py-2.5 px-2 font-semibold">Sumber</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {diagnostics.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 font-medium text-slate-900">
                          {formatTestTypeLabel(item.test_type)}
                        </td>
                        <td className="py-2.5 px-2 font-bold text-slate-800 whitespace-nowrap">
                          {formatRangeNotation(item)}
                        </td>
                        <td className="py-2.5 px-2 font-semibold text-slate-700">
                          {item.label}
                        </td>
                        <td className="py-2.5 px-2 text-xs text-slate-500">
                          {item.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Navigasi Bawah */}
      <BottomNavbar />
    </div>
  )
}

export default NilaiNormalPage
