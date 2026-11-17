// src/components/GlucoseChart.jsx
// Grafik tren kadar gula darah pasien menggunakan Recharts
import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { useGlucose, formatDateTimeIndonesian } from '../hooks/useGlucose'

// Komponen kustom penanda titik grafik dengan perbedaan bentuk dan warna
const renderCustomDot = (props) => {
  const { cx, cy, payload } = props
  if (cx == null || cy == null || !payload) return null

  const category = payload.category

  // 1. Kategori Rendah: Simbol KOTAK warna oranye/kuning hangat
  if (category === 'low') {
    return (
      <rect
        key={`dot-${payload.id || cx}`}
        x={cx - 6}
        y={cy - 6}
        width={12}
        height={12}
        fill="#f59e0b"
        stroke="#ffffff"
        strokeWidth={2}
      />
    )
  }

  // 2. Kategori Tinggi: Simbol SEGITIGA warna merah
  if (category === 'high') {
    const points = `${cx},${cy - 7} ${cx - 6},${cy + 5} ${cx + 6},${cy + 5}`
    return (
      <polygon
        key={`dot-${payload.id || cx}`}
        points={points}
        fill="#ef4444"
        stroke="#ffffff"
        strokeWidth={2}
      />
    )
  }

  // 3. Kategori Normal / Target: Simbol LINGKARAN warna hijau
  return (
    <circle
      key={`dot-${payload.id || cx}`}
      cx={cx}
      cy={cy}
      r={6}
      fill="#10b981"
      stroke="#ffffff"
      strokeWidth={2}
    />
  )
}

// Tooltip kustom dengan format tanggal dan label kategori resmi
function CustomChartTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1 border border-slate-700">
        <div className="font-bold text-sm text-emerald-400">
          {data.value_mgdl} mg/dL
        </div>
        <div className="text-slate-300 font-medium">
          {data.test_type === 'preprandial' ? 'Sebelum Makan' : '1–2 Jam Setelah Makan'}
        </div>
        <div className="text-slate-300">
          Kategori:{' '}
          <span className="font-semibold text-white">{data.categoryLabel}</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          {formatDateTimeIndonesian(data.measured_at)}
        </div>
        {data.note && (
          <div className="text-slate-300 border-t border-slate-700 pt-1 mt-1 italic">
            &ldquo;{data.note}&rdquo;
          </div>
        )}
      </div>
    )
  }
  return null
}

function GlucoseChart() {
  const { filteredLogs, referenceRanges, getCategoryMeta } = useGlucose()

  // Tab jenis pemeriksaan: 'preprandial' atau 'postprandial'
  const [activeTab, setActiveTab] = useState('preprandial')

  // Ambil batas garis referensi target normal dari database (purpose='control_target')
  const { lowerTarget, upperTarget } = useMemo(() => {
    const normalRef = referenceRanges.find(
      (r) =>
        r.purpose === 'control_target' &&
        r.test_type === activeTab &&
        r.category === 'normal'
    )

    if (normalRef) {
      const minVal = Number(normalRef.min_value)
      const maxVal = Number(normalRef.max_value)
      // Batas atas sesuai pedoman:
      // - preprandial: max_value - 1 (130)
      // - postprandial: max_value (180)
      const upper = activeTab === 'preprandial' ? maxVal - 1 : maxVal
      return { lowerTarget: minVal, upperTarget: upper }
    }

    // Fallback default PERKENI
    return activeTab === 'preprandial'
      ? { lowerTarget: 70, upperTarget: 130 }
      : { lowerTarget: 70, upperTarget: 180 }
  }, [referenceRanges, activeTab])

  // Data grafik: disaring berdasarkan tab, diurutkan MENAIK menurut waktu (measured_at ASC)
  const chartData = useMemo(() => {
    const filtered = filteredLogs.filter((item) => item.test_type === activeTab)

    // Urutkan ascending berdasarkan tanggal
    return [...filtered]
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
      .map((item) => {
        const d = new Date(item.measured_at)
        const dateShort = d.toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
        })
        const timeShort = d.toLocaleString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })

        const meta = getCategoryMeta(item.test_type, item.category)

        return {
          ...item,
          timeLabel: `${dateShort} ${timeShort}`,
          categoryLabel: meta.label,
        }
      })
  }, [filteredLogs, activeTab, getCategoryMeta])

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Grafik Tren Glukosa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Garis putus-putus hijau menunjukkan rentang target kendali
          </p>
        </div>

        {/* Tab Pemilihan Jenis Pemeriksaan */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('preprandial')}
            className={`min-h-[38px] px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 ${
              activeTab === 'preprandial'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sebelum Makan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('postprandial')}
            className={`min-h-[38px] px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 ${
              activeTab === 'postprandial'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Setelah Makan
          </button>
        </div>
      </div>

      {/* Legenda Bentuk & Warna */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <span className="font-semibold text-slate-700">Keterangan Titik:</span>
        <span className="inline-flex items-center gap-1.5 text-amber-800">
          <span className="w-2.5 h-2.5 bg-amber-500 inline-block" /> Kotak: Rendah
        </span>
        <span className="inline-flex items-center gap-1.5 text-emerald-800">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" /> Lingkaran: Dalam Target
        </span>
        <span className="inline-flex items-center gap-1.5 text-rose-800">
          <span className="text-[11px] text-rose-500">▲</span> Segitiga: Di Atas Target
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <p className="text-base font-medium text-slate-700">
            Belum ada catatan untuk{' '}
            {activeTab === 'preprandial' ? 'Sebelum Makan' : 'Setelah Makan'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Data grafik akan muncul otomatis setelah Anda mencatat hasil pemeriksaan.
          </p>
        </div>
      ) : (
        /* Pembungkus grafik dengan overflow-x-auto agar responsif pada layar kecil (360px) */
        <div className="w-full overflow-x-auto -mx-2 px-2 pb-2">
          <div className="min-w-[320px] h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="timeLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  domain={[
                    (dataMin) => Math.max(0, Math.floor(dataMin / 20) * 20 - 20),
                    (dataMax) => Math.ceil(dataMax / 20) * 20 + 20,
                  ]}
                />
                <Tooltip content={<CustomChartTooltip />} />

                {/* Garis Batas Bawah Target Normal */}
                <ReferenceLine
                  y={lowerTarget}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Batas bawah target (${lowerTarget})`,
                    position: 'insideBottomRight',
                    fill: '#059669',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />

                {/* Garis Batas Atas Target Normal */}
                <ReferenceLine
                  y={upperTarget}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Batas atas target (${upperTarget})`,
                    position: 'insideTopRight',
                    fill: '#059669',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />

                {/* Garis Nilai Glukosa */}
                <Line
                  type="monotone"
                  dataKey="value_mgdl"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={renderCustomDot}
                  activeDot={{ r: 8, strokeWidth: 2, stroke: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlucoseChart
