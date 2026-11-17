// src/components/GlucoseHistory.jsx
// Komponen daftar riwayat pemeriksaan gula darah mandiri pasien
import { useState } from 'react'
import { useGlucose, formatDateTimeIndonesian } from '../hooks/useGlucose'
import CategoryBadge from './CategoryBadge'

function GlucoseHistory() {
  const { filteredLogs, loadingLogs, logsError, dateFilter, setDateFilter, deleteLog, getCategoryMeta } =
    useGlucose()

  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus catatan gula darah ini?')
    if (!confirmed) return

    setDeletingId(id)
    setActionError(null)

    try {
      await deleteLog(id)
    } catch (err) {
      setActionError(err.message || 'Gagal menghapus catatan.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Riwayat Pemeriksaan</h2>
          <p className="text-xs text-slate-500 mt-0.5">Maksimal 50 catatan terbaru</p>
        </div>

        {/* Filter Rentang Tanggal */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`min-h-[36px] px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 ${
              dateFilter === 'all'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('30_days')}
            className={`min-h-[36px] px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 ${
              dateFilter === '30_days'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 Hari
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('7_days')}
            className={`min-h-[36px] px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 ${
              dateFilter === '7_days'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Hari
          </button>
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm"
        >
          {actionError}
        </div>
      )}

      {logsError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm"
        >
          {logsError}
        </div>
      )}

      {loadingLogs && !filteredLogs.length ? (
        <div className="py-10 text-center text-slate-500 text-base">
          Memuat catatan gula darah...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">
            📋
          </div>
          <p className="text-base font-medium text-slate-700">Belum ada catatan gula darah</p>
          <p className="text-sm text-slate-500 mt-1">
            Gunakan form di atas untuk mulai mencatat hasil pemeriksaan glukometer Anda.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredLogs.map((item) => {
            const meta = getCategoryMeta(item.test_type, item.category)
            const isDeleting = deletingId === item.id

            return (
              <div
                key={item.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-slate-900">
                      {item.value_mgdl}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">mg/dL</span>
                    <CategoryBadge category={item.category} label={meta.label} />
                  </div>

                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    {item.test_type === 'preprandial'
                      ? 'Sebelum makan / puasa'
                      : '1–2 jam setelah makan'}
                  </div>

                  <div className="text-xs text-slate-400 mt-0.5">
                    {formatDateTimeIndonesian(item.measured_at)}
                  </div>

                  {item.note && (
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100 italic">
                      &ldquo;{item.note}&rdquo;
                    </p>
                  )}
                </div>

                {/* Tombol Hapus */}
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDelete(item.id)}
                  aria-label="Hapus catatan"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition duration-150 disabled:opacity-50"
                  title="Hapus catatan"
                >
                  {isDeleting ? (
                    <span className="text-xs text-slate-400">...</span>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GlucoseHistory
