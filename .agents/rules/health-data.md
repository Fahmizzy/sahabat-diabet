# Aturan Data Kesehatan

- Data kesehatan termasuk data pribadi sensitif (UU PDP). Perlakukan dengan hati-hati walau hanya prototipe.
- Semua tabel yang berisi data pasien wajib punya RLS aktif sebelum diisi data apa pun.
- Jangan menampilkan data pasien lain di halaman pasien, termasuk lewat pesan error atau log.
- Jangan mencatat (console.log) data kesehatan di produksi.
- Tampilkan pernyataan persetujuan (consent) saat pasien pertama kali mendaftar.
- Untuk pengujian ke pasien sungguhan, diperlukan izin etik (ethical clearance) dan informed consent dari institusi. Sebelum itu gunakan data dummy.
- Setiap kategori hasil (normal / tinggi / rendah) harus disertai kalimat: "Hasil ini bukan diagnosis. Konsultasikan dengan perawat atau dokter."
