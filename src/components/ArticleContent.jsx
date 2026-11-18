// src/components/ArticleContent.jsx
// Komponen render Markdown yang aman dari XSS tanpa dangerouslySetInnerHTML
import ReactMarkdown from 'react-markdown'

/**
 * Pemetaan komponen kustom untuk ReactMarkdown:
 * - Mengatur tipografi mobile-first (font dasar minimal 16px)
 * - Mencegah horizontal scroll 360px dengan break-words & overflow-x-auto
 * - Menyaring tautan: hanya protokol http dan https yang dijadikan tautan aktif
 * - Menonaktifkan elemen gambar markdown (img)
 */
const customMarkdownComponents = {
  // Hanya izinkan skema http: dan https: untuk tautan. Skema lain dirender sebagai teks biasa
  a: ({ href, children }) => {
    const isSafeScheme =
      typeof href === 'string' &&
      (href.startsWith('http://') || href.startsWith('https://'))

    if (!isSafeScheme) {
      return <span className="underline text-slate-700 break-words">{children}</span>
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-700 underline font-semibold break-words hover:text-emerald-900 transition"
      >
        {children}
      </a>
    )
  },

  // Nonaktifkan render gambar dari konten markdown
  img: () => null,

  // Tipografi heading dengan margin dan hierarki jelas
  h1: ({ children }) => (
    <h1 className="text-2xl font-black text-slate-900 mt-6 mb-3 leading-snug break-words">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-slate-900 mt-5 mb-2.5 leading-snug break-words">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2 leading-snug break-words">
      {children}
    </h3>
  ),

  // Paragraf font dasar minimal 16px (text-base) dengan line-height lega
  p: ({ children }) => (
    <p className="text-base text-slate-800 leading-relaxed mb-4 break-words">
      {children}
    </p>
  ),

  // Daftar butir & nomor dengan indentasi dan bullet/angka eksplisit
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-base text-slate-800 leading-relaxed break-words">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-base text-slate-800 leading-relaxed break-words">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1 break-words">{children}</li>
  ),

  // Kutipan bergaris tepi hijau lembut
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-emerald-600 bg-emerald-50/60 p-3.5 my-4 rounded-r-xl text-slate-700 italic text-base leading-relaxed break-words">
      {children}
    </blockquote>
  ),

  strong: ({ children }) => (
    <strong className="font-bold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-800">{children}</em>
  ),
  hr: () => <hr className="my-6 border-slate-200" />,

  // Kode inline & blok kode dengan overflow-x-auto agar aman di layar 360px
  code: ({ inline, children }) => {
    if (inline) {
      return (
        <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono break-words">
          {children}
        </code>
      )
    }
    return (
      <code className="text-slate-100 font-mono text-xs sm:text-sm">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <div className="overflow-x-auto my-4 max-w-full rounded-xl shadow-inner">
      <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs sm:text-sm font-mono">
        {children}
      </pre>
    </div>
  ),

  // Tabel dibungkus container overflow-x-auto
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 max-w-full border border-slate-200 rounded-xl shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 bg-slate-100 font-bold text-slate-900">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-t border-slate-100 text-slate-700">
      {children}
    </td>
  ),
}

function ArticleContent({ content }) {
  if (!content) {
    return null
  }

  return (
    <div className="article-body">
      <ReactMarkdown
        components={customMarkdownComponents}
        disallowedElements={['img']}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default ArticleContent
