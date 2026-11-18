// src/components/ArticleCard.jsx
// Kartu pratinjau artikel edukasi untuk daftar edukasi
import { Link } from 'react-router-dom'

/**
 * Membersihkan sintaks Markdown untuk menghasilkan teks cuplikan murni
 */
function stripMarkdown(text, maxLength = 120) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const plain = text
    .replace(/^#+\s+/gm, '') // Hapus heading #
    .replace(/!\[.*?\]\(.*?\)/g, '') // Hapus gambar
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Ambil teks tautan saja
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Hapus tebal
    .replace(/(\*|_)(.*?)\1/g, '$2') // Hapus miring
    .replace(/^>\s+/gm, '') // Hapus blockquote
    .replace(/`{1,3}.*?`{1,3}/g, '') // Hapus kode
    .replace(/^\s*[-*+]\s+/gm, '') // Hapus bullet list
    .replace(/^\s*\d+\.\s+/gm, '') // Hapus numbered list
    .replace(/\s+/g, ' ') // Gabung spasi berlebih
    .trim()

  if (plain.length <= maxLength) {
    return plain
  }
  return plain.slice(0, maxLength).trim() + '...'
}

/**
 * Format tanggal ke Bahasa Indonesia (sama dengan standar Tugas 4)
 */
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

function ArticleCard({ article }) {
  const { id, title, category, content, video_url, created_at } = article
  const snippet = stripMarkdown(content)
  const formattedDate = formatDate(created_at)

  return (
    <Link
      to={`/edukasi/${id}`}
      className="block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition duration-150 group min-h-[44px]"
      aria-label={`Buka artikel: ${title}`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {/* Badge Kategori */}
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {category || 'Edukasi'}
        </span>

        {/* Badge Video bila tersedia video_url */}
        {video_url && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
            Video
          </span>
        )}

        {/* Tanggal Terbit */}
        {formattedDate && (
          <span className="text-xs text-slate-600 ml-auto font-medium">
            {formattedDate}
          </span>
        )}
      </div>

      {/* Judul Artikel */}
      <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-2 mb-2">
        {title}
      </h2>

      {/* Cuplikan Teks Bersih */}
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
        {snippet}
      </p>

      {/* Tombol Aksi Visual */}
      <div className="mt-4 flex items-center text-sm font-semibold text-emerald-700 group-hover:text-emerald-800">
        <span>Baca selengkapnya</span>
        <svg
          className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition duration-150"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  )
}

export default ArticleCard
