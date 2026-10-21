# 01 — Product Requirements (PRD)

## Tujuan
Membantu pasien ulkus diabetik menjalani perawatan di rumah dengan menjaga kestabilan gula darah, teratur minum obat dan merawat luka, serta tetap terhubung dengan perawat.

## Pengguna
| Peran | Deskripsi |
|---|---|
| Pasien | Pasien ulkus diabetik (atau keluarga yang mendampingi) yang mencatat dan menerima pengingat |
| Perawat | Memantau data pasien yang ditugaskan, mengelola jadwal, dan menjadi penghubung dengan rumah sakit |
| Admin (opsional) | Mengelola konten edukasi dan data referensi |

## Fitur

### F1. Pencatatan kadar gula darah mandiri
Penyembuhan ulkus sangat bergantung pada kestabilan glukosa.
- Pasien mengisi nilai gula darah (mg/dL), jenis pemeriksaan (puasa / 2 jam setelah makan / sewaktu), tanggal dan jam, catatan opsional.
- Sistem otomatis menampilkan kategori (rendah / normal / tinggi) berdasarkan **tabel nilai normal** dengan warna dan label.
- Riwayat dalam bentuk daftar dan grafik tren.
- Tabel nilai normal dapat dilihat pasien di halaman tersendiri.

### F2. Pengingat jadwal minum obat dan perawatan luka
- Jadwal obat: nama obat, dosis sesuai resep, jam, frekuensi, tanggal mulai/selesai.
- Jadwal perawatan: ganti balutan, kontrol rutin, pemeriksaan kesehatan.
- Pasien menandai "sudah dilakukan"; jadwal yang lewat tanpa tanda ditampilkan sebagai "terlambat".
- Tahap 1: pengingat di dalam aplikasi. Tahap 2 (opsional): notifikasi otomatis via Telegram bot.

### F3. Sistem informasi dan edukasi kesehatan
- Artikel: pencegahan penyakit, pola hidup sehat, nutrisi, perawatan pasien di rumah.
- Video perawatan luka (embed YouTube) dan panduan praktis.
- Kategori, pencarian sederhana, dan halaman detail artikel.

### F4. Deteksi dini risiko dan tindak lanjut
- Perawat menjadi penghubung antara data pasien di rumah dan rumah sakit.
- Dashboard perawat: daftar pasien, penanda pasien dengan gula darah di luar batas atau jadwal yang terlewat.
- Kontak darurat: tombol telepon (`tel:`) dan WhatsApp (`wa.me`) ke perawat dan rumah sakit.
- Perawat dapat meninggalkan catatan tindak lanjut untuk pasien.

## Di luar cakupan (tidak dibuat)
- Diagnosis otomatis atau rekomendasi dosis obat
- Pembayaran, telemedicine video, dan integrasi rekam medis rumah sakit
- Aplikasi native Android/iOS (cukup PWA / web responsif)

## Kriteria keberhasilan
- Pasien dapat mencatat gula darah dan melihat kategori + grafik dalam kurang dari 1 menit.
- Pasien tidak dapat melihat data pasien lain (diuji).
- Perawat melihat pasien berisiko pada satu layar.
- Aplikasi dapat diakses lewat tautan Netlify dari HP.
