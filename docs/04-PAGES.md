# 04 — Halaman dan Alur

## Navigasi
- Pasien (bottom navbar di HP): Beranda · Gula Darah · Jadwal · Edukasi · Darurat
- Perawat: Dashboard · Pasien · Jadwal · Edukasi

## Halaman umum
| Rute | Halaman | Isi |
|---|---|---|
| `/login` | Login | Email + password |
| `/daftar` | Registrasi | Data dasar + persetujuan (consent) |

## Halaman pasien
| Rute | Halaman | Isi |
|---|---|---|
| `/` | Beranda | Sapaan, gula darah terakhir + kategori, jadwal hari ini, tombol darurat |
| `/gula-darah` | Catat & Riwayat | Form input, daftar riwayat, grafik tren, filter tanggal |
| `/gula-darah/nilai-normal` | Tabel Nilai Normal | Tabel rujukan dari database + sumber |
| `/jadwal` | Jadwal | Tab Obat / Perawatan Luka; tombol "Sudah"; penanda terlambat |
| `/edukasi` | Daftar Edukasi | Kategori, pencarian, kartu artikel/video |
| `/edukasi/:id` | Detail Edukasi | Isi artikel, video embed |
| `/darurat` | Kontak Darurat | Tombol telepon & WhatsApp besar |
| `/profil` | Profil | Data diri, keluar |

## Halaman perawat
| Rute | Halaman | Isi |
|---|---|---|
| `/perawat` | Dashboard | Ringkasan: pasien berisiko (gula darah di luar batas, jadwal terlewat) di atas |
| `/perawat/pasien` | Daftar Pasien | Daftar pasien yang ditugaskan |
| `/perawat/pasien/:id` | Detail Pasien | Grafik gula darah, riwayat jadwal, catatan tindak lanjut |
| `/perawat/pasien/:id/jadwal` | Kelola Jadwal | Tambah/ubah jadwal obat & perawatan luka |
| `/perawat/edukasi` | Kelola Edukasi | Tambah/ubah artikel (opsional) |

## Alur utama
1. **Pasien mencatat gula darah:** Beranda → Catat → isi nilai → simpan → muncul kategori berwarna + pesan "bukan diagnosis".
2. **Pasien menjalankan jadwal:** Beranda/Jadwal → tekan "Sudah" → status `done` tercatat.
3. **Perawat menindaklanjuti:** Dashboard → pasien berisiko → Detail Pasien → tulis catatan / hubungi pasien.
4. **Keadaan darurat:** tombol Darurat di semua halaman pasien → telepon/WhatsApp.

## Kode warna kategori
- Rendah: kuning/oranye
- Normal: hijau
- Tinggi: merah
Selalu sertakan teks label (jangan hanya warna) agar mudah dibaca.

## Aturan UI
- Mobile-first, tombol minimal 44px, font dasar ≥ 16px.
- Bahasa sederhana, hindari istilah medis tanpa penjelasan.
- Halaman perawat boleh responsif untuk laptop.
