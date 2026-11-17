// src/components/GlucoseForm.jsx
// Form pencatatan kadar gula darah mandiri pasien
import { useState } from 'react'
import { useGlucose, getLocalDatetimeInputValue } from '../hooks/useGlucose'
import CategoryBadge from './CategoryBadge'

function GlucoseForm() {
  const { insertLog } = useGlucose()

  const [valueInput, setValueInput] = useState('')
  const [testType, setTestType] = useState('preprandial')
  const [measuredAtInput, setMeasuredAtInput] = useState(() => getLocalDatetimeInputValue())
  const [note, setNote] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [savedResult, setSavedResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setSavedResult(null)

    const rawValue = valueInput.trim()

    // 1. Validasi nilai glukosa: wajib bilangan bulat murni (tolak desimal dan eksponen 'e')
    if (!/^\d+$/.test(rawValue)) {
      setErrorMessage('Nilai gula darah harus berupa angka bilangan bulat (tanpa desimal atau koma).')
      return
    }

    const numValue = Number(rawValue)
    if (!Number.isInteger(numValue) || numValue < 20 || numValue > 1000) {
      setErrorMessage('Nilai gula darah harus berada di antara 20 dan 1000 mg/dL.')
      return
    }

    // 2. Validasi waktu: tidak boleh di masa depan (toleransi 5 menit)
    const selectedTime = new Date(measuredAtInput).getTime()
    const maxAllowedTime = Date.now() + 5 * 60 * 1000
    if (isNaN(selectedTime) || selectedTime > maxAllowedTime) {
      setErrorMessage('Waktu pemeriksaan tidak boleh lebih dari waktu sekarang.')
      return
    }

    setSubmitting(true)

    try {
      // Simpan catatan ke database via hook useGlucose
      // Konversi waktu lokal ke format ISO UTC saat pengiriman
      const isoMeasuredAt = new Date(measuredAtInput).toISOString()

      const result = await insertLog({
        value_mgdl: numValue,
        test_type: testType,
        measured_at: isoMeasuredAt,
        note: note.trim() || null,
      })

      // Tampilkan hasil penyimpanan
      setSavedResult(result)

      // Reset form
      setValueInput('')
      setNote('')
      setMeasuredAtInput(getLocalDatetimeInputValue())
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan catatan gula darah. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setSavedResult(null)
    setErrorMessage(null)
    setValueInput('')
    setNote('')
    setMeasuredAtInput(getLocalDatetimeInputValue())
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Catat Kadar Gula Darah
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Gunakan hasil glukometer dari darah ujung jari (kapiler).
      </p>

      {/* Banner Pesan Error */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-base leading-relaxed"
        >
          {errorMessage}
        </div>
      )}

      {/* Banner Hasil Simpan Berhasil */}
      {savedResult && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hasil Tersimpan
            </span>
            <CategoryBadge
              category={savedResult.category}
              label={savedResult.label}
            />
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {savedResult.value_mgdl}
            </span>
            <span className="text-base text-slate-600 font-medium">mg/dL</span>
            <span className="text-sm text-slate-500 ml-2">
              (
              {savedResult.test_type === 'preprandial'
                ? 'Sebelum makan / puasa'
                : '1–2 jam setelah makan'}
              )
            </span>
          </div>

          {/* Peringatan khusus jika gula darah rendah (hipoglikemia) */}
          {/* TODO: Konsultasikan pesan peringatan dan instruksi medis hipoglikemia bersama pembimbing saat integrasi kontak darurat di Tugas 6 */}
          {savedResult.category === 'low' && (
            <div className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-sm sm:text-base font-medium">
              ⚠️ <strong>Peringatan:</strong> Gula darah Anda rendah. Segera hubungi perawat atau kontak darurat.
            </div>
          )}

          {/* Kalimat Wajib Batasan Medis */}
          <p className="mt-3 text-xs sm:text-sm text-slate-500 italic">
            * Hasil ini bukan diagnosis. Konsultasikan dengan perawat atau dokter.
          </p>

          <button
            type="button"
            onClick={handleResetForm}
            className="mt-4 w-full min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-medium rounded-xl transition duration-150"
          >
            + Catat Nilai Lainnya
          </button>
        </div>
      )}

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Angka Gula Darah */}
        <div>
          <label
            htmlFor="value_mgdl"
            className="block text-base font-semibold text-slate-800 mb-1"
          >
            Nilai Gula Darah (mg/dL) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="value_mgdl"
              type="number"
              inputMode="numeric"
              min="20"
              max="1000"
              step="1"
              required
              disabled={submitting}
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              placeholder="Contoh: 120"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-lg font-semibold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none">
              mg/dL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Masukkan angka bulat antara 20 sampai 1000.
          </p>
        </div>

        {/* Pilihan Jenis Pemeriksaan */}
        <div>
          <span className="block text-base font-semibold text-slate-800 mb-1.5">
            Waktu / Jenis Pemeriksaan <span className="text-rose-500">*</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setTestType('preprandial')}
              className={`min-h-[44px] p-3 text-left rounded-xl border transition duration-150 ${
                testType === 'preprandial'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-semibold text-base">Sebelum Makan / Puasa</div>
              <div className="text-xs text-slate-500 mt-0.5">Preprandial (target 70–130)</div>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => setTestType('postprandial')}
              className={`min-h-[44px] p-3 text-left rounded-xl border transition duration-150 ${
                testType === 'postprandial'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-semibold text-base">1–2 Jam Setelah Makan</div>
              <div className="text-xs text-slate-500 mt-0.5">Postprandial (target 70–179)</div>
            </button>
          </div>
        </div>

        {/* Waktu Pengukuran (Waktu Lokal) */}
        <div>
          <label
            htmlFor="measured_at"
            className="block text-base font-semibold text-slate-800 mb-1"
          >
            Waktu Pengukuran <span className="text-rose-500">*</span>
          </label>
          <input
            id="measured_at"
            type="datetime-local"
            required
            disabled={submitting}
            value={measuredAtInput}
            onChange={(e) => setMeasuredAtInput(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100"
          />
          <p className="text-xs text-slate-500 mt-1">
            Waktu sesuai jam pemeriksaan glukometer Anda.
          </p>
        </div>

        {/* Catatan Opsional */}
        <div>
          <label
            htmlFor="note"
            className="block text-base font-semibold text-slate-800 mb-1"
          >
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            id="note"
            rows="2"
            disabled={submitting}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Merasa pusing setelah olahraga, baru makan nasi uduk"
            className="w-full px-3.5 py-2 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100"
          />
        </div>

        {/* Kalimat Pemberitahuan Non-Diagnosis */}
        <p className="text-xs text-slate-500">
          Aplikasi ini mencatat dan mengelompokkan nilai sesuai tabel rujukan kendali. Hasil ini bukan diagnosis medis.
        </p>

        {/* Tombol Simpan */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[44px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold text-base rounded-xl transition duration-150 shadow-sm"
        >
          {submitting ? 'Sedang Menyimpan...' : 'Simpan Catatan'}
        </button>
      </form>
    </div>
  )
}

export default GlucoseForm
