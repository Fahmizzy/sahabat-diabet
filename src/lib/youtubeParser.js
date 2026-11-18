// src/lib/youtubeParser.js
// Ekstraktor dan validator ID video YouTube yang ketat
// Parser ini hanya mengizinkan host resmi YouTube dan ID tepat 11 karakter

// Pola validasi tepat 11 karakter ID video YouTube
const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/

// Daftar host YouTube yang diizinkan secara ketat
const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
])

/**
 * Mengekstrak ID video dari URL YouTube
 * Menerima bentuk watch?v=ID, youtu.be/ID, dan embed/ID
 * Mengembalikan string ID (11 karakter) atau null jika tidak valid
 */
export function extractYouTubeVideoId(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null
  }

  try {
    const parsed = new URL(rawUrl.trim())

    // 1. Validasi protokol: hanya http atau https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }

    const host = parsed.hostname.toLowerCase()

    // 2. Validasi host resmi YouTube
    if (!ALLOWED_HOSTS.has(host)) {
      return null
    }

    let candidateId = null

    if (host === 'youtu.be') {
      // Bentuk: https://youtu.be/ID
      candidateId = parsed.pathname.slice(1)
    } else {
      // Host youtube.com / www.youtube.com / m.youtube.com
      if (parsed.pathname === '/watch') {
        // Bentuk: https://www.youtube.com/watch?v=ID
        candidateId = parsed.searchParams.get('v')
      } else if (parsed.pathname.startsWith('/embed/')) {
        // Bentuk: https://www.youtube.com/embed/ID
        candidateId = parsed.pathname.slice(7)
      }
    }

    if (!candidateId) {
      return null
    }

    // Bersihkan kemungkinan trailing slash atau parameter query tambahan
    const cleanId = candidateId.split('/')[0].split('?')[0].split('&')[0]

    // 3. Validasi ketat panjang dan format karakter ID (11 karakter)
    if (YOUTUBE_ID_REGEX.test(cleanId)) {
      return cleanId
    }

    return null
  } catch {
    // URL tidak dapat diparsing (bukan URL valid)
    return null
  }
}
