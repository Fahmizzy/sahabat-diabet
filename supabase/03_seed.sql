-- ==============================================================================
-- 03_seed.sql — SahabatDiabet (Homecare Ulkus Diabetik)
-- Data Awal: Nilai Rujukan Glukosa, Edukasi, dan Kontak Darurat
-- PERHATIAN: Jalankan skrip ini SEKALI saja (Run ONCE only).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. NILAI RUJUKAN GLUKOSA
-- Interval setengah terbuka: min_value <= nilai AND nilai < max_value
-- ------------------------------------------------------------------------------

-- (A) TARGET KENDALI (control_target)
-- Digunakan otomatis oleh trigger set_glucose_category() pada glucose_logs
INSERT INTO public.glucose_reference_ranges 
  (test_type, unit, purpose, category, min_value, max_value, label, source) 
VALUES
  -- Preprandial (Sebelum Makan / Glukosa Darah Puasa Pemantauan Mandiri)
  ('preprandial', 'mg/dL', 'control_target', 'low', 20, 70, 'Rendah, waspada hipoglikemia', 'PLACEHOLDER: batas <70 mg/dL, verifikasi ke teks pedoman PERKENI/ADA'),
  ('preprandial', 'mg/dL', 'control_target', 'normal', 70, 131, 'Dalam target', 'PERKENI 2021, Pedoman Pemantauan Glukosa Darah Mandiri, Tabel 1'),
  ('preprandial', 'mg/dL', 'control_target', 'high', 131, 1001, 'Di atas target', 'PERKENI 2021, Pedoman Pemantauan Glukosa Darah Mandiri, Tabel 1'),

  -- Postprandial (1-2 Jam Setelah Makan)
  ('postprandial', 'mg/dL', 'control_target', 'low', 20, 70, 'Rendah, waspada hipoglikemia', 'PLACEHOLDER: batas <70 mg/dL, verifikasi ke teks pedoman PERKENI/ADA'),
  ('postprandial', 'mg/dL', 'control_target', 'normal', 70, 180, 'Dalam target', 'PERKENI 2021, Pedoman Pemantauan Glukosa Darah Mandiri, Tabel 1'),
  ('postprandial', 'mg/dL', 'control_target', 'high', 180, 1001, 'Di atas target', 'PERKENI 2021, Pedoman Pemantauan Glukosa Darah Mandiri, Tabel 1')
ON CONFLICT DO NOTHING;

-- (B) KRITERIA DIAGNOSIS (diagnostic)
-- Hanya ditampilkan pada halaman edukasi / informasi tabel rujukan (bukan evaluasi log harian)
INSERT INTO public.glucose_reference_ranges 
  (test_type, unit, purpose, category, min_value, max_value, label, source) 
VALUES
  -- Glukosa Darah Puasa Laboratorium (GDP)
  ('gdp', 'mg/dL', 'diagnostic', 'normal', 20, 100, 'Normal', 'PERKENI 2021, Kriteria Diagnosis DM'),
  ('gdp', 'mg/dL', 'diagnostic', 'prediabetes', 100, 126, 'Prediabetes', 'PERKENI 2021, Kriteria Diagnosis DM'),
  ('gdp', 'mg/dL', 'diagnostic', 'dm', 126, 1001, 'Diabetes Melitus', 'PERKENI 2021, Kriteria Diagnosis DM'),

  -- Glukosa Darah 2 Jam Post-Prandial TTGO (GD2PP)
  ('gd2pp', 'mg/dL', 'diagnostic', 'normal', 20, 140, 'Normal', 'PERKENI 2021, Kriteria Diagnosis DM'),
  ('gd2pp', 'mg/dL', 'diagnostic', 'prediabetes', 140, 200, 'Prediabetes', 'PERKENI 2021, Kriteria Diagnosis DM'),
  ('gd2pp', 'mg/dL', 'diagnostic', 'dm', 200, 1001, 'Diabetes Melitus', 'PERKENI 2021, Kriteria Diagnosis DM'),

  -- Hemoglobin A1c (HbA1c)
  ('hba1c', '%', 'diagnostic', 'normal', 0, 5.7, 'Normal', 'PERKENI 2021, Kriteria Diagnosis DM'),
  ('hba1c', '%', 'diagnostic', 'prediabetes', 5.7, 6.5, 'Prediabetes', 'PERKENI 2021, Kriteria Diagnosis DM'),
  ('hba1c', '%', 'diagnostic', 'dm', 6.5, 25.0, 'Diabetes Melitus', 'PERKENI 2021, Kriteria Diagnosis DM')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. ARTIKEL EDUKASI KESEHATAN
-- TODO: ganti dengan materi terverifikasi dari modul keperawatan / pembimbing
-- ------------------------------------------------------------------------------
INSERT INTO public.education_articles (title, category, content, video_url, published) VALUES
(
  'Perawatan Mandiri Luka Ulkus Diabetik di Rumah (Contoh)',
  'Perawatan Luka',
  E'# Perawatan Mandiri Luka Ulkus Diabetik di Rumah\n\nMenjaga kebersihan luka ulkus diabetik sangat penting untuk mencegah infeksi dan mempercepat proses granulasi jaringan.\n\n### Langkah-langkah Pembersihan Luka:\n1. Cuci tangan dengan sabun dan air mengalir minimal 20 detik.\n2. Buka balutan lama secara perlahan. Jika lengket, basahi dengan cairan fisiologis (NaCl 0.9%).\n3. Bersihkan luka dengan kasa steril dan NaCl 0.9% dari arah dalam ke luar.\n4. Keringkan kulit di sekitar luka dengan menepuk lembut menggunakan kasa kering.\n5. Pasang balutan baru sesuai anjuran perawat.\n\n*Catatan: Jangan gunakan alkohol atau antiseptik keras langsung pada dasar luka tanpa instruksi tenaga medis.*',
  NULL,
  true
),
(
  'Mengenal Tanda Bahaya dan Infeksi pada Luka Diabetes (Contoh)',
  'Deteksi Dini',
  E'# Mengenal Tanda Bahaya dan Infeksi pada Luka Diabetes\n\nPasien dan keluarga pendamping wajib waspada terhadap tanda perburukan luka.\n\n### Tanda-tanda Infeksi yang Memerlukan Tindakan Cepat:\n- Kemerahan meluas di sekitar luka (> 2 cm).\n- Kulit di sekitar luka teraba hangat atau panas.\n- Nyeri yang bertambah hebat secara mendadak.\n- Keluar nanah berbau tidak sedap.\n- Demam atau menggigil.\n\n**Segera hubungi perawat atau fasilitas kesehatan darurat jika Anda menemukan gejala di atas.**',
  NULL,
  true
),
(
  'Pentingnya Menjaga Pola Makan dan Gula Darah Stabil (Contoh)',
  'Nutrisi & Gaya Hidup',
  E'# Pentingnya Menjaga Pola Makan dan Gula Darah Stabil\n\nKadar glukosa darah yang tinggi dapat menghambat aliran oksigen dan nutrisi ke jaringan luka, memperlambat penyembuhan, serta meningkatkan risiko perkembangbiakan bakteri.\n\n### Prinsip Pola Makan (3J):\n1. **Jadwal:** Makan tepat waktu (3 kali makan utama, 2-3 kali selingan ringan).\n2. **Jumlah:** Porsi disesuaikan dengan kebutuhan kalori dan aktivitas.\n3. **Jenis:** Batasi karbohidrat sederhana (gula pasir, sirup, kue manis), perbanyak serat dan protein (ikan, putih telur, tahu/tempe).\n\n*Konsultasikan rencana gizi Anda dengan perawat atau ahli gizi.*',
  NULL,
  true
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. KONTAK DARURAT UMUM
-- TODO: sesuaikan dengan wilayah pengujian / rumah sakit rujukan sebenarnya
-- ------------------------------------------------------------------------------
INSERT INTO public.emergency_contacts (name, phone, whatsapp, type, patient_id) VALUES
('Ambulans Gawat Darurat (118) (Contoh)', '118', NULL, 'ambulance', NULL),
('Call Center Rumah Sakit Rujukan (Contoh)', '021-1234567', '6281234567890', 'hospital', NULL)
ON CONFLICT DO NOTHING;
