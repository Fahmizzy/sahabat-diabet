# Panduan Pengujian RLS dan Keamanan Basis Data (Tugas 2)

Dokumen ini memandu pengujian keamanan Row Level Security (RLS), trigger klasifikasi glukosa darah, hak akses kolom, dan hak eksekusi fungsi pada Supabase.

> [!IMPORTANT]
> **PENTING: Mengapa harus menggunakan Impersonate / Run as Role?**  
> Di Supabase SQL Editor, kueri dijalankan secara bawaan sebagai superuser (`postgres` / `service_role`) yang **melewati seluruh aturan RLS**.  
> Untuk menguji RLS secara akurat, gunakan salah satu dari dua cara:
> 1. Fitur **Role Impersonation** bawaan Supabase Dashboard di menu SQL Editor (pilih role `authenticated` dan masukkan ID pengguna di dropdown "Auth user").
> 2. Blok transaksi simulasi SQL dengan:
>    ```sql
>    BEGIN;
>      SET LOCAL ROLE authenticated;
>      SET LOCAL "request.jwt.claims" = '{"sub": "<UUID_PENGGUNA>", "role": "authenticated"}';
>      -- Atau versi single-claim: SET LOCAL "request.jwt.claim.sub" = '<UUID_PENGGUNA>';
>      
>      -- [Kueri yang diuji]
>      
>    ROLLBACK;
>    ```
>    *Catatan: Selalu akhiri dengan `ROLLBACK;` agar perubahan data simulasi tidak tersimpan permanen saat pengujian.*

---

## Tahap 1: Persiapan Akun Uji

1. Buka **Supabase Dashboard** > **Authentication** > **Users**.
2. Klik **Add user** > **Create user** untuk membuat 4 akun dummy berikut:
   - Pasien A: `<EMAIL_PASIEN_A>` (Password: `<PASSWORD_AKUN>`, Auto-confirm: Centang)
   - Pasien B: `<EMAIL_PASIEN_B>` (Password: `<PASSWORD_AKUN>`, Auto-confirm: Centang)
   - Perawat 1 (Pembina Pasien A): `<EMAIL_PERAWAT_1>` (Password: `<PASSWORD_AKUN>`, Auto-confirm: Centang)
   - Perawat 2 (Bukan Pembina Pasien A): `<EMAIL_PERAWAT_2>` (Password: `<PASSWORD_AKUN>`, Auto-confirm: Centang)
3. Salin `User UID` masing-masing akun dari tabel dashboard untuk pengujian di bawah.

---

## Tahap 2: Konfigurasi Peran Perawat dan Penugasan Pasien

Jalankan kueri berikut di **SQL Editor** (mode normal/superuser):

```sql
-- 1. Upgrade akun perawat menjadi role 'nurse'
UPDATE public.profiles 
SET role = 'nurse', full_name = 'Ns. Siti Aminah' 
WHERE id = (SELECT id FROM auth.users WHERE email = '<EMAIL_PERAWAT_1>');

UPDATE public.profiles 
SET role = 'nurse', full_name = 'Ns. Ratna Sari' 
WHERE id = (SELECT id FROM auth.users WHERE email = '<EMAIL_PERAWAT_2>');

-- 2. Beri nama lengkap untuk pasien
UPDATE public.profiles 
SET full_name = 'Budi Santoso' 
WHERE id = (SELECT id FROM auth.users WHERE email = '<EMAIL_PASIEN_A>');

UPDATE public.profiles 
SET full_name = 'Ahmad Dahlan' 
WHERE id = (SELECT id FROM auth.users WHERE email = '<EMAIL_PASIEN_B>');

-- 3. Tugaskan Perawat 1 HANYA ke Pasien A (Perawat 2 TIDAK ditugaskan ke Pasien A)
INSERT INTO public.patient_nurse (patient_id, nurse_id)
VALUES (
  (SELECT id FROM auth.users WHERE email = '<EMAIL_PASIEN_A>'),
  (SELECT id FROM auth.users WHERE email = '<EMAIL_PERAWAT_1>')
);

-- 4. Buat data uji awal untuk Pasien A dan Pasien B
INSERT INTO public.glucose_logs (patient_id, value_mgdl, test_type, category)
VALUES 
  ((SELECT id FROM auth.users WHERE email = '<EMAIL_PASIEN_A>'), 110, 'preprandial', 'normal'),
  ((SELECT id FROM auth.users WHERE email = '<EMAIL_PASIEN_B>'), 210, 'preprandial', 'high');

-- 5. Buat jadwal obat Pasien A oleh Perawat 1
INSERT INTO public.medication_schedules (patient_id, drug_name, dose, times, created_by)
VALUES (
  (SELECT id FROM auth.users WHERE email = '<EMAIL_PASIEN_A>'),
  'Metformin',
  '500 mg',
  ARRAY['08:00', '20:00'],
  (SELECT id FROM auth.users WHERE email = '<EMAIL_PERAWAT_1>')
);

-- 6. Buat kontak darurat pribadi untuk Pasien A (patient_id terisi)
INSERT INTO public.emergency_contacts (name, phone, whatsapp, type, patient_id)
VALUES (
  'Keluarga Pasien A (Anak)',
  '<NO_HP_KELUARGA>',
  '<WA_KELUARGA>',
  'nurse',
  (SELECT id FROM auth.users WHERE email = '<EMAIL_PASIEN_A>')
);
```

---

## Tahap 3: Pelaksanaan Skenario Uji Keamanan

Ganti placeholder berikut dengan UID akun yang sesuai:
- `<UUID_PASIEN_A>`: UID akun Pasien A
- `<UUID_PASIEN_B>`: UID akun Pasien B
- `<UUID_PERAWAT_1>`: UID akun Perawat 1 (perawat binaan Pasien A)
- `<UUID_PERAWAT_2>`: UID akun Perawat 2 (perawat lain yang tidak membina Pasien A)

---

### Skenario (a): Pasien A Tidak Melihat Data Pasien B
*(Dapat diuji lewat menu Impersonate UI atau blok SQL simulasi di bawah)*
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "<UUID_PASIEN_A>", "role": "authenticated"}';

  -- Pasien A hanya boleh melihat catatannya sendiri
  SELECT id, patient_id, value_mgdl, test_type, category FROM public.glucose_logs;

  -- Pasien A hanya boleh melihat profil dirinya
  SELECT id, full_name, role FROM public.profiles;
ROLLBACK;
```
- **Hasil yang diharapkan:**  
  Tabel `glucose_logs` hanya mengembalikan baris milik Pasien A (nilai 110 mg/dL). Catatan Pasien B (nilai 210 mg/dL) **tidak muncul**.  
  Tabel `profiles` hanya mengembalikan 1 baris (Pasien A).

---

### Skenario (b): Pasien Gagal Mengubah Role Sendiri
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "<UUID_PASIEN_A>", "role": "authenticated"}';

  -- Percobaan eskalasi hak akses (mengubah role menjadi nurse)
  UPDATE public.profiles SET role = 'nurse' WHERE id = '<UUID_PASIEN_A>';
ROLLBACK;
```
- **Hasil yang diharapkan:**  
  Transaksi ditolak dengan pesan kegagalan hak akses (**permission denied** pada kolom `role`).
  
*Pengujian pembaruan profil yang sah (harus berhasil):*
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "<UUID_PASIEN_A>", "role": "authenticated"}';

  UPDATE public.profiles SET full_name = 'Budi Santoso Diperbarui', phone = '<NO_HP_PASIEN_A>' WHERE id = '<UUID_PASIEN_A>';
  SELECT id, full_name, phone, role FROM public.profiles WHERE id = '<UUID_PASIEN_A>';
ROLLBACK;
```
- **Hasil yang diharapkan:** Berhasil diperbarui, kolom `role` tetap `'patient'`.

---

### Skenario (c): Pendaftaran via API dengan Metadata `role='nurse'` Tetap Menjadi `'patient'`
Uji pendaftaran pengguna baru menggunakan Supabase JS SDK atau API SignUp dengan menyisipkan metadata role:
```javascript
const { data, error } = await supabase.auth.signUp({
  email: '<EMAIL_PENYUSUP>',
  password: '<PASSWORD_AKUN>',
  options: {
    data: {
      full_name: 'Penyusup Role',
      role: 'nurse' // mencoba menyuntikkan role perawat
    }
  }
});
```
Periksa baris yang terbentuk di tabel `public.profiles`:
```sql
SELECT id, full_name, role FROM public.profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = '<EMAIL_PENYUSUP>');
```
- **Hasil yang diharapkan:** Kolom `role` bernilai `'patient'`. Trigger `handle_new_user()` mengabaikan metadata `role`.

---

### Skenario (d): Perawat 1 Hanya Melihat Pasien A yang Ditugaskan
*(Dapat diuji lewat Impersonate Perawat 1 atau blok SQL simulasi)*
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "<UUID_PERAWAT_1>", "role": "authenticated"}';

  -- Periksa profil yang dapat dibaca perawat
  SELECT id, full_name, role FROM public.profiles;

  -- Periksa catatan glukosa yang dapat dibaca perawat
  SELECT id, patient_id, value_mgdl, test_type, category FROM public.glucose_logs;
ROLLBACK;
```
- **Hasil yang diharapkan:**  
  Pada `profiles`: hanya profil Perawat 1 dan profil Pasien A yang muncul. Profil Pasien B tidak terlihat.  
  Pada `glucose_logs`: hanya catatan milik Pasien A yang muncul. Catatan Pasien B tidak terlihat.

---

### Skenario (e): Tanpa Login (Anonim) Tidak Ada Data Terbaca
*(Dapat diuji lewat Impersonate anon atau blok SQL simulasi)*
```sql
BEGIN;
  SET LOCAL ROLE anon;

  SELECT * FROM public.profiles;
  SELECT * FROM public.glucose_logs;
  SELECT * FROM public.glucose_reference_ranges;
  SELECT * FROM public.emergency_contacts;
ROLLBACK;
```
- **Hasil yang diharapkan:** Seluruh kueri menghasilkan 0 baris (`empty result`). Pengguna anonim tidak dapat mengakses data apa pun.

---

### Skenario (f): Input Glukosa dengan Kategori Palsu Dihitung Ulang oleh Trigger
Pasien A mencoba mengirim data gula darah sebelum makan tinggi (300 mg/dL), tetapi mengirimkan payload `category: 'normal'`:
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "<UUID_PASIEN_A>", "role": "authenticated"}';

  INSERT INTO public.glucose_logs (patient_id, value_mgdl, test_type, category)
  VALUES ('<UUID_PASIEN_A>', 300, 'preprandial', 'normal');

  SELECT patient_id, value_mgdl, test_type, category 
  FROM public.glucose_logs 
  WHERE patient_id = '<UUID_PASIEN_A>' AND value_mgdl = 300;
ROLLBACK;
```
- **Hasil yang diharapkan:**  
  Nilai `category` yang tersimpan adalah `'high'` (bukan `'normal'`). Trigger `set_glucose_category()` menghitung ulang dari `glucose_reference_ranges`.

---

### Skenario (g): Pasien Gagal Mengubah Category secara Langsung lewat UPDATE
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "<UUID_PASIEN_A>", "role": "authenticated"}';

  -- Pasien mencoba mengubah paksa category menjadi 'normal'
  UPDATE public.glucose_logs 
  SET category = 'normal' 
  WHERE patient_id = '<UUID_PASIEN_A>' AND value_mgdl = 110;

  SELECT patient_id, value_mgdl, category 
  FROM public.glucose_logs 
  WHERE patient_id = '<UUID_PASIEN_A>' AND value_mgdl = 110;
ROLLBACK;
```
- **Hasil yang diharapkan:**  
  Trigger `BEFORE INSERT OR UPDATE` kembali mengevaluasi nilai glukosa dan tabel rujukan, sehingga `category` tetap terhitung sesuai rentang resmi (tidak dapat dipalsukan).

---

### Skenario (h): Pasien Gagal Menghapus atau Mengubah Jadwal Obat
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "<UUID_PASIEN_A>", "role": "authenticated"}';

  -- Pasien mencoba menghapus jadwal obat miliknya
  DELETE FROM public.medication_schedules 
  WHERE patient_id = '<UUID_PASIEN_A>';

  -- Pasien mencoba mengubah dosis obat
  UPDATE public.medication_schedules 
  SET dose = '1000 mg' 
  WHERE patient_id = '<UUID_PASIEN_A>';
ROLLBACK;
```
- **Hasil yang diharapkan:**  
  Operasi `DELETE` dan `UPDATE` menghasilkan 0 baris terpengaruh karena hak modifikasi jadwal obat hanya diizinkan untuk perawat binaan (`is_assigned_nurse`).

---

### Skenario (i): Perawat yang TIDAK Ditugaskan ke Pasien A Gagal Membaca Kontak Darurat Pribadi Pasien A
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "<UUID_PERAWAT_2>", "role": "authenticated"}';

  -- Perawat 2 (yang BUKAN pembina Pasien A) mencoba membaca kontak pribadi Pasien A
  SELECT id, name, phone, type, patient_id 
  FROM public.emergency_contacts 
  WHERE patient_id = '<UUID_PASIEN_A>';

  -- Perawat 2 membaca kontak darurat umum (patient_id IS NULL)
  SELECT id, name, phone, type, patient_id 
  FROM public.emergency_contacts 
  WHERE patient_id IS NULL;
ROLLBACK;
```
- **Hasil yang diharapkan:**  
  Kueri pertama mengembalikan **0 baris** (Perawat 2 tidak dapat melihat kontak pribadi Pasien A karena `is_assigned_nurse('<UUID_PASIEN_A>')` menghasilkan false).  
  Kueri kedua mengembalikan baris kontak darurat umum (ambulans/call center).
