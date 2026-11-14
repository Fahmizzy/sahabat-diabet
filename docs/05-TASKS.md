# 05 — Daftar Tugas (kerjakan berurutan, satu per sesi)

Tandai `[x]` setelah selesai dan sudah saya uji. Commit ke Git setiap tugas selesai.

## Persiapan (manual, oleh saya)
- [ ] Akun GitHub, Supabase (region Singapore), Netlify
- [ ] Install Node.js dan Git
- [ ] Buat repo GitHub dan proyek Supabase

## Tugas 1 — Setup proyek
- [x] Inisialisasi React + Vite + Tailwind + react-router-dom
- [x] `src/lib/supabaseClient.js` memakai env variable
- [x] `.gitignore` memuat `.env`; buat `.env.example`
- [x] Struktur folder sesuai `02-ARCHITECTURE.md`
- Uji: `npm run dev` berjalan, halaman kosong tampil. ✅

## Tugas 2 — Database dan RLS
- [x] Tulis SQL tabel sesuai `03-DATABASE.md` (tampilkan dulu untuk persetujuan)
- [x] Aktifkan RLS dan policy semua tabel
- [x] Seed data dummy: 2 pasien, 1 perawat, nilai rujukan, 3 artikel
- Uji: skenario RLS di akhir `03-DATABASE.md`. ✅

## Tugas 3 — Login dan peran
- [ ] Halaman login dan registrasi (dengan consent)
- [ ] Hook `useAuth`, proteksi rute per peran
- [ ] Redirect: pasien ke `/`, perawat ke `/perawat`
- Uji: pasien tidak bisa membuka `/perawat`.

## Tugas 4 — Pencatatan gula darah (F1)
- [ ] Form input + validasi (angka masuk akal, wajib pilih jenis pemeriksaan)
- [ ] Fungsi klasifikasi kategori dari tabel `glucose_reference_ranges`
- [ ] Riwayat + grafik tren (Recharts)
- [ ] Halaman Tabel Nilai Normal
- Uji: input 55, 95, 180, 260 → kategori sesuai tabel.

## Tugas 5 — Edukasi (F3)
- [ ] Daftar artikel + kategori + pencarian
- [ ] Detail artikel (render markdown) + embed video YouTube
- Uji: artikel tampil di HP.

## Tugas 6 — Dashboard perawat dan kontak darurat (F4)
- [ ] Daftar pasien yang ditugaskan
- [ ] Penanda pasien berisiko (gula darah di luar batas, jadwal terlewat)
- [ ] Detail pasien: grafik, riwayat, catatan tindak lanjut
- [ ] Halaman Kontak Darurat (`tel:` dan `wa.me`)
- Uji: perawat hanya melihat pasien yang ditugaskan.

## Tugas 7 — Jadwal dan pengingat (F2, tahap 1)
- [ ] Perawat/pasien menambah jadwal obat dan perawatan luka
- [ ] Daftar jadwal hari ini + tombol "Sudah" + status terlambat
- [ ] Ringkasan jadwal di Beranda
- Uji: jadwal lewat waktu tampil "terlambat".

## Tugas 8 — Deploy
- [ ] `public/_redirects` untuk SPA
- [ ] Hubungkan repo ke Netlify, isi env variable
- [ ] Uji di HP lewat tautan Netlify
- [ ] (Opsional) PWA: manifest + ikon agar bisa "Add to Home Screen"

## Tugas 9 — Opsional (jika waktu cukup)
- [ ] Pengingat otomatis via Telegram bot (Supabase Edge Function + cron)
- [ ] Ekspor riwayat gula darah ke PDF/CSV

## Catatan keputusan
- Uji RLS lolos: (a), (b), (d), kontak darurat. BELUM diuji, wajib sebelum Tugas 8 (deploy): (c) pendaftaran dengan metadata role='nurse' tetap menjadi 'patient', (e) tanpa login, (f) kategori palsu dihitung ulang, (g) update category palsu, (h) pasien tidak bisa mengubah jadwal obat.
- Security Advisor: 2 peringatan tersisa (current_user_role dan is_assigned_nurse dapat dieksekusi pengguna login) bersifat disengaja karena dipakai policy RLS.
- Keterbatasan: schedule_logs ditulis pasien sendiri (laporan mandiri), tidak diverifikasi perawat.
- Akun uji: pasien.a, pasien.b (pasien), pasien.c (dijadikan perawat uji, ditugaskan hanya ke pasien A). Data uji harus dihapus sebelum penggunaan sungguhan.
- Sumber tabel nilai normal yang dipakai: PERKENI 2021 (Pedoman Pemantauan Glukosa Darah Mandiri, Tabel 1 untuk target kendali; Kriteria Diagnosis DM untuk edukasi diagnosa).
