/* eslint-disable react-refresh/only-export-components */
// src/hooks/useGlucose.jsx
// Context dan custom hook useGlucose untuk pengelolaan data gula darah dan nilai rujukan
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

const GlucoseContext = createContext(null)

/**
 * Memformat tanggal ke string lokal Indonesia tanpa pustaka eksternal.
 * @param {string|Date} dateValue
 * @returns {string} contoh: "17 Nov 2026, 14:30"
 */
export function formatDateTimeIndonesian(dateValue) {
  if (!dateValue) return '-'
  const d = new Date(dateValue)
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Menghasilkan nilai default waktu lokal untuk input type="datetime-local".
 * Mencegah pergeseran waktu akibat pemanggilan toISOString() yang berbasis UTC.
 * @param {Date} [date]
 * @returns {string} format "YYYY-MM-DDTHH:mm"
 */
export function getLocalDatetimeInputValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Memformat rentang nilai menjadi notasi manusiawi.
 * - Baris terendah: "< max"
 * - Baris tertinggi: "≥ min"
 * - Baris tengah: "min sampai (max - 1)" untuk mg/dL atau "(max - 0,1)" untuk %
 * Nilai batas buatan (20, 1001, 25) tidak ditampilkan.
 * @param {Object} item - baris dari glucose_reference_ranges
 * @returns {string} notasi rentang ramah pengguna
 */
export function formatRangeNotation(item) {
  if (!item) return '-'
  const { category, min_value, max_value, unit, purpose } = item
  const numMin = Number(min_value)
  const numMax = Number(max_value)
  const isPercent = unit === '%'

  // Format angka dengan koma desimal untuk persen
  const formatNum = (val) => {
    if (isPercent) {
      return val.toFixed(1).replace('.', ',')
    }
    return Math.round(val).toString()
  }

  // Kategori terendah: 'low' pada target kendali, atau 'normal' pada kriteria diagnosis
  const isLowest = category === 'low' || (purpose === 'diagnostic' && category === 'normal')
  // Kategori tertinggi: 'high' pada target kendali, atau 'dm' pada kriteria diagnosis
  const isHighest = category === 'high' || category === 'dm'

  if (isLowest) {
    return `< ${formatNum(numMax)} ${unit}`
  }

  if (isHighest) {
    return `≥ ${formatNum(numMin)} ${unit}`
  }

  // Baris tengah: kurangi batas atas dengan 1 (mg/dL) atau 0.1 (%)
  const subtractor = isPercent ? 0.1 : 1
  const upperBoundary = numMax - subtractor
  return `${formatNum(numMin)} sampai ${formatNum(upperBoundary)} ${unit}`
}

export function GlucoseProvider({ children }) {
  const { user } = useAuth()

  const [referenceRanges, setReferenceRanges] = useState([])
  const [loadingRanges, setLoadingRanges] = useState(true)

  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [logsError, setLogsError] = useState(null)

  // Filter rentang tanggal: '7_days' | '30_days' | 'all'
  const [dateFilter, setDateFilter] = useState('all')

  // 1. Ambil tabel glucose_reference_ranges sekali saat awal
  useEffect(() => {
    let isMounted = true

    async function fetchReferenceRanges() {
      setLoadingRanges(true)
      try {
        const { data, error } = await supabase
          .from('glucose_reference_ranges')
          .select('*')
          .order('id', { ascending: true })

        if (!isMounted) return

        if (!error && data) {
          setReferenceRanges(data)
        }
      } catch {
        // Abaikan atau biarkan state default
      } finally {
        if (isMounted) setLoadingRanges(false)
      }
    }

    fetchReferenceRanges()

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Ambil catatan glukosa milik pasien yang sedang login (maks. 50 catatan terbaru)
  const fetchLogs = useCallback(async () => {
    if (!user?.id) {
      setLogs([])
      return
    }

    setLoadingLogs(true)
    setLogsError(null)

    try {
      const { data, error } = await supabase
        .from('glucose_logs')
        .select('*')
        .eq('patient_id', user.id)
        .order('measured_at', { ascending: false })
        .limit(50)

      if (error) {
        setLogsError('Gagal memuat riwayat gula darah. Silakan coba lagi.')
      } else {
        setLogs(data || [])
      }
    } catch {
      setLogsError('Gagal memuat riwayat gula darah. Periksa koneksi internet.')
    } finally {
      setLoadingLogs(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Cari label kategori dari tabel referensi control_target
  const getCategoryMeta = useCallback(
    (test_type, category) => {
      const matched = referenceRanges.find(
        (r) =>
          r.purpose === 'control_target' &&
          r.test_type === test_type &&
          r.category === category
      )

      if (matched) {
        return {
          label: matched.label,
          category: matched.category,
        }
      }

      // Fallback label ramah jika referensi belum terisi
      const fallbackLabels = {
        low: 'Rendah, waspada hipoglikemia',
        normal: 'Dalam target',
        high: 'Di atas target',
      }
      return {
        label: fallbackLabels[category] || category || 'Belum terklasifikasi',
        category: category || 'normal',
      }
    },
    [referenceRanges]
  )

  // 3. Tambah catatan gula darah baru
  // KEAMANAN & ARSITEKTUR:
  // JANGAN mengirim atau menghitung `category` di frontend!
  // Trigger PostgreSQL `set_glucose_category` yang akan menghitungnya.
  const insertLog = async ({ value_mgdl, test_type, measured_at, note }) => {
    if (!user?.id) {
      throw new Error('Sesi pengguna tidak valid. Silakan masuk kembali.')
    }

    // Insert ke tabel glucose_logs dan minta baris hasil kembali (.select().single())
    const { data, error } = await supabase
      .from('glucose_logs')
      .insert({
        patient_id: user.id,
        value_mgdl,
        test_type,
        measured_at,
        note: note || null,
      })
      .select()
      .single()

    if (error) {
      // Jika trigger melempar exception rentang nilai atau RLS menolak
      throw new Error(
        error.message?.includes('rentang') || error.message?.includes('Kategori')
          ? 'Nilai gula darah di luar rentang rujukan yang diizinkan.'
          : 'Gagal menyimpan catatan gula darah. Silakan periksa kembali data Anda.'
      )
    }

    // Perbarui daftar catatan secara otomatis di state bersama
    await fetchLogs()

    // Ambil label deskriptif dari state referensi
    const meta = getCategoryMeta(data.test_type, data.category)

    return {
      ...data,
      label: meta.label,
    }
  }

  // 4. Hapus catatan gula darah
  const deleteLog = async (id) => {
    const { error } = await supabase
      .from('glucose_logs')
      .delete()
      .eq('id', id)
      .eq('patient_id', user?.id)

    if (error) {
      throw new Error('Gagal menghapus catatan. Silakan coba beberapa saat lagi.')
    }

    // Refresh daftar setelah penghapusan
    await fetchLogs()
  }

  // Filter daftar catatan berdasarkan rentang tanggal
  const filteredLogs = useMemo(() => {
    if (!logs.length) return []
    if (dateFilter === 'all') return logs

    const now = Date.now()
    const daysLimit = dateFilter === '7_days' ? 7 : 30
    const cutoffTime = now - daysLimit * 24 * 60 * 60 * 1000

    return logs.filter((log) => new Date(log.measured_at).getTime() >= cutoffTime)
  }, [logs, dateFilter])

  // Catatan paling terakhir untuk kartu di HomePage
  const lastLog = logs.length > 0 ? logs[0] : null

  const value = {
    referenceRanges,
    loadingRanges,
    logs,
    filteredLogs,
    loadingLogs,
    logsError,
    lastLog,
    dateFilter,
    setDateFilter,
    getCategoryMeta,
    insertLog,
    deleteLog,
    refetchLogs: fetchLogs,
  }

  return <GlucoseContext.Provider value={value}>{children}</GlucoseContext.Provider>
}

export function useGlucose() {
  const context = useContext(GlucoseContext)
  if (!context) {
    throw new Error('useGlucose harus digunakan di dalam GlucoseProvider')
  }
  return context
}
