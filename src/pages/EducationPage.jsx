// src/pages/EducationPage.jsx
// Halaman daftar artikel edukasi kesehatan untuk pasien
import { useState, useMemo } from 'react'
import { useEducationList } from '../hooks/useEducation'
import ArticleCard from '../components/ArticleCard'
import BottomNavbar from '../components/BottomNavbar'

function EducationPage() {
  const { articles, loading, error, refreshArticles } = useEducationList()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  // Ekstraksi kategori unik secara dinamis dari data artikel
  const categories = useMemo(() => {
    const unique = new Set()
    articles.forEach((a) => {
      if (a.category && a.category.trim()) {
        unique.add(a.category.trim())
      }
    })
    return ['Semua', ...Array.from(unique)]
  }, [articles])

  // Penyaringan artikel berdasarkan kata kunci pencarian dan filter kategori
  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return articles.filter((article) => {
      const matchCategory =
        selectedCategory === 'Semua' || article.category === selectedCategory

      const matchSearch =
        !q ||
        (article.title && article.title.toLowerCase().includes(q)) ||
        (article.category && article.category.toLowerCase().includes(q))

      return matchCategory && matchSearch
    })
  }, [articles, searchQuery, selectedCategory])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('Semua')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28">
      {/* Header Halaman */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Edukasi Kesehatan
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Panduan mandiri perawatan luka dan diabetes di rumah
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-5">
        {/* Kolom Pencarian */}
        <section aria-label="Pencarian Artikel">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau topik materi..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition"
              aria-label="Cari artikel edukasi"
            />
          </div>
        </section>

        {/* Filter Kategori Dinamis */}
        {categories.length > 1 && (
          <section aria-label="Filter Kategori" className="overflow-x-auto -mx-4 px-4 py-1">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Status Loading */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600">
              Memuat materi edukasi...
            </p>
          </div>
        )}

        {/* Status Error Jaringan */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center space-y-3">
            <p className="text-sm font-medium text-rose-800">{error}</p>
            <button
              type="button"
              onClick={refreshArticles}
              className="min-h-[44px] px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Daftar Artikel atau Keadaan Kosong */}
        {!loading && !error && (
          <section aria-label="Daftar Artikel">
            {filteredArticles.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Menampilkan {filteredArticles.length} artikel
                </p>
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-800">
                  Artikel Tidak Ditemukan
                </h2>
                <p className="text-sm text-slate-600">
                  {searchQuery || selectedCategory !== 'Semua'
                    ? 'Tidak ada artikel yang cocok dengan pencarian atau filter yang dipilih.'
                    : 'Belum ada artikel edukasi yang dipublikasikan.'}
                </p>
                {(searchQuery || selectedCategory !== 'Semua') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="min-h-[44px] px-4 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition"
                  >
                    Reset Pencarian & Filter
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Navigasi Bawah */}
      <BottomNavbar />
    </div>
  )
}

export default EducationPage
