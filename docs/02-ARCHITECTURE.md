# 02 — Arsitektur

## Gambaran
```
[HP / Browser] -> React + Vite (Netlify) -> Supabase (Auth + PostgreSQL + RLS)
                                         -> (opsional) Edge Function + cron -> Telegram Bot API
```

## Teknologi
| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend | React + Vite, Tailwind CSS | Sederhana, banyak tutorial, build statis |
| Routing | react-router-dom | Standar |
| Grafik | Recharts | Mudah dipakai dengan React |
| Backend | Supabase | Database, login, dan RLS tanpa server sendiri |
| Hosting | Netlify | Gratis, deploy otomatis dari GitHub |

## Struktur folder
```
src/
├── components/   # tombol, kartu, form, navbar
├── pages/        # satu file per halaman
├── hooks/        # useAuth, useGlucose, dll.
├── lib/          # supabaseClient.js, helper kategori gula darah
└── App.jsx       # routing + proteksi halaman per peran
```

## Environment variable
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
Isi di `.env` (lokal) dan di pengaturan Netlify (produksi). `.env` wajib masuk `.gitignore`.

## Konfigurasi Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Tambahkan `public/_redirects` berisi: `/*  /index.html  200` (agar routing SPA berfungsi)

## Keputusan desain
- Tanpa SSR (aplikasi tertutup, tidak butuh SEO).
- Otorisasi sepenuhnya lewat RLS, bukan hanya penyembunyian menu di frontend.
- Nilai rujukan gula darah disimpan di database agar mudah diubah.
