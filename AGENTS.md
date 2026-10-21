# AGENTS.md — Aturan Proyek Homecare Ulkus Diabetik

## Konteks
Aplikasi web homecare untuk pasien ulkus diabetik (project nursing care / skripsi).
Fitur: pencatatan gula darah, pengingat obat & perawatan luka, edukasi kesehatan, deteksi dini & kontak darurat.
Dokumen lengkap ada di folder `docs/`. **Baca dokumen terkait sebelum mengerjakan tugas apa pun.**

## Stack (jangan diganti tanpa persetujuan saya)
- Frontend: React + Vite (JavaScript, bukan TypeScript), Tailwind CSS
- Routing: react-router-dom
- Grafik: Recharts
- Backend, database, auth: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- Hosting: Netlify (deploy dari GitHub)
- Bahasa antarmuka: **Bahasa Indonesia**

## Cara kerja
1. Kerjakan **satu tugas** dari `docs/05-TASKS.md` per sesi. Jangan lompat atau menggabungkan tugas.
2. Sebelum menulis kode, buat rencana singkat dan tunggu persetujuan saya.
3. Setelah selesai: jelaskan file apa saja yang dibuat/diubah, cara menjalankan, dan cara mengujinya.
4. Jangan menambah fitur di luar `docs/01-PRD.md`.
5. Jika ada keputusan yang ambigu, tanyakan; jangan menebak.

## Aturan kode
- Struktur folder: `src/pages`, `src/components`, `src/lib` (klien Supabase & helper), `src/hooks`.
- Komponen fungsional dengan hooks. Nama komponen PascalCase, file helper camelCase.
- Beri komentar singkat dalam Bahasa Indonesia pada logika penting (saya harus bisa menjelaskan kode ini saat sidang).
- Tangani state loading dan error di setiap pemanggilan Supabase.
- Tampilan mobile-first (pengguna utama memakai HP), tombol besar, teks mudah dibaca (pasien lansia).

## Keamanan (WAJIB)
- Jangan pernah menulis kunci/secret di kode. Gunakan `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) dan pastikan `.env` ada di `.gitignore`.
- Kunci `service_role` **tidak boleh** dipakai di frontend.
- Aktifkan Row Level Security di setiap tabel. Pasien hanya boleh membaca/menulis datanya sendiri; perawat hanya melihat pasien yang ditugaskan kepadanya.
- Gunakan **data dummy** saja. Jangan memasukkan data pasien asli.
- Detail tambahan: `.agent/rules/health-data.md`.

## Batasan medis
- Aplikasi **tidak mendiagnosis** dan tidak memberi saran dosis obat. Aplikasi hanya mencatat, mengingatkan, menampilkan kategori berdasarkan tabel rujukan, dan menyediakan edukasi.
- Nilai rujukan gula darah diambil dari tabel database (`glucose_reference_ranges`), bukan ditulis permanen di kode.
