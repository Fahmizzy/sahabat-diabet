# SahabatDiabet

SahabatDiabet adalah prototipe aplikasi web *self-monitoring* dan *homecare* untuk pasien ulkus diabetik yang dikembangkan untuk keperluan penelitian skripsi bidang keperawatan (*nursing care*) dengan menggunakan data dummy. Aplikasi ini dirancang ramah pengguna (terutama pasien lansia) untuk membantu pencatatan dan pemantauan tren gula darah, pengingat jadwal obat dan perawatan luka, edukasi kesehatan mandiri, serta akses cepat ke kontak darurat dan tenaga kesehatan pembina.

## Teknologi yang Digunakan

- **Frontend**: React (JavaScript) + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Grafik / Visualisasi**: Recharts
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Deployment**: Netlify

## Cara Menjalankan Secara Lokal

1. **Salin file environment**  
   Salin file konfigurasi contoh ke `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan lengkapi nilai variabel `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sesuai dengan proyek Supabase Anda.

   > **PENTING: Jangan pernah meng-commit file .env.** Selalu pastikan file `.env` diabaikan oleh Git agar kredensial proyek tidak bocor ke repositori publik maupun privat.

2. **Pasang dependensi**
   ```bash
   npm install
   ```

3. **Jalankan aplikasi di mode pengembangan**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses melalui browser pada alamat lokal yang ditampilkan di terminal (biasanya `http://localhost:5173`).
