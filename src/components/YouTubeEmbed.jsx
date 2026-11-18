// src/components/YouTubeEmbed.jsx
// Komponen embed video YouTube dengan parser URL ketat dan domain youtube-nocookie
import { extractYouTubeVideoId } from '../lib/youtubeParser'

function YouTubeEmbed({ url }) {
  // Ambil ID video dari URL menggunakan parser ketat
  const videoId = extractYouTubeVideoId(url)

  // Jika URL tidak valid atau ID rusak: jangan tampilkan iframe, tampilkan pesan aman
  if (!videoId) {
    return (
      <div className="w-full p-4 my-4 bg-slate-100 border border-slate-200 rounded-2xl text-center text-slate-500 text-sm">
        Video tidak tersedia
      </div>
    )
  }

  return (
    <div className="w-full my-4">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200">
        {/* Iframe dari youtube-nocookie.com tanpa autoplay untuk privasi dan keamanan */}
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="Video Edukasi Kesehatan"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0"
        />
      </div>
    </div>
  )
}

export default YouTubeEmbed
