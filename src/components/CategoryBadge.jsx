// src/components/CategoryBadge.jsx
// Lencana kategori hasil gula darah dengan warna, simbol bentuk, dan teks deskriptif

function CategoryBadge({ category, label, className = '' }) {
  // Pengelompokan gaya berdasarkan kategori hasil
  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-300'
  let symbol = '●' // Bentuk simbol pembantu aksesibilitas

  if (category === 'low') {
    // Rendah / Hipoglikemia: warna oranye/kuning hangat + simbol kotak
    colorClasses = 'bg-amber-100 text-amber-900 border-amber-300'
    symbol = '■'
  } else if (category === 'normal') {
    // Dalam target: warna hijau + simbol lingkaran
    colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-300'
    symbol = '●'
  } else if (category === 'high') {
    // Di atas target: warna merah + simbol segitiga
    colorClasses = 'bg-rose-100 text-rose-900 border-rose-300'
    symbol = '▲'
  }

  // Teks default jika label tidak dikirim
  const defaultLabels = {
    low: 'Rendah, waspada hipoglikemia',
    normal: 'Dalam target',
    high: 'Di atas target',
  }
  const displayText = label || defaultLabels[category] || category || 'Belum terklasifikasi'

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold border rounded-full ${colorClasses} ${className}`}
    >
      <span aria-hidden="true" className="text-xs leading-none">
        {symbol}
      </span>
      <span>{displayText}</span>
    </span>
  )
}

export default CategoryBadge
