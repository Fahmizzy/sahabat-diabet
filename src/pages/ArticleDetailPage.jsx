// src/pages/ArticleDetailPage.jsx
// Halaman baca detail artikel edukasi dan pemutaran video
import { useParams, Link } from 'react-router-dom'
import { useEducationDetail } from '../hooks/useEducation'
import ArticleContent from '../components/ArticleContent'
import YouTubeEmbed from '../components/YouTubeEmbed'
import BottomNavbar from '../components/BottomNavbar'

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

function ArticleDetailPage() {
  const { id } = useParams()
  const { article, loading, error, notFound, refetch } = useEducationDetail(id)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28">
      {/* Header Bar dengan Tombol Kembali */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/edukasi"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-950 py-2 px-1 -ml-1 rounded-xl transition min-h-[44px]"
            aria-label="Kembali ke daftar edukasi"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Daftar Edukasi</span>
          </Link>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Materi Pasien
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5">
        {/* Status Loading */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600">
              Memuat artikel...
            </p>
          </div>
        )}

        {/* Status Error Jaringan / Database */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-4 my-6 shadow-sm">
            <p className="text-sm font-medium text-rose-800">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="min-h-[44px] px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Status Artikel Tidak Ditemukan / Tidak Published / Format UUID Salah */}
        {!loading && !error && notFound && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 my-6 shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Artikel tidak ditemukan
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Artikel yang Anda cari tidak tersedia, sudah dihapus, atau belum dipublikasikan.
              </p>
            </div>
            <Link
              to="/edukasi"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              Kembali ke Halaman Edukasi
            </Link>
          </div>
        )}

        {/* Konten Artikel Lengkap */}
        {!loading && !error && !notFound && article && (
          <article className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            {/* Metadata Artikel */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {article.category || 'Edukasi'}
                </span>
                {article.created_at && (
                  <span className="text-xs text-slate-600 font-medium ml-auto">
                    {formatDate(article.created_at)}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-slate-900 leading-snug break-words">
                {article.title}
              </h1>
            </div>

            {/* Video Edukasi jika tersedia URL video */}
            {article.video_url && (
              <section aria-label="Video Pendukung">
                <YouTubeEmbed url={article.video_url} />
              </section>
            )}

            {/* Render Isi Artikel dari Markdown secara Aman */}
            <section aria-label="Isi Artikel">
              <ArticleContent content={article.content} />
            </section>

            {/* Catatan Disclaimer Medis Wajib */}
            <footer className="mt-8 pt-4 border-t border-slate-100">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
                Informasi ini bersifat edukasi umum dan tidak menggantikan anjuran perawat atau dokter Anda.
              </div>
            </footer>
          </article>
        )}
      </main>

      {/* Navigasi Bawah */}
      <BottomNavbar />
    </div>
  )
}

export default ArticleDetailPage
