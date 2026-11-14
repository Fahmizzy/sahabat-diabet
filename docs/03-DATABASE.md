# 03 — Database dan Keamanan (Supabase / PostgreSQL)

Dokumen ini mendefinisikan skema basis data, aturan Row Level Security (RLS), trigger klasifikasi, serta hak akses kolom untuk aplikasi **SahabatDiabet**. File SQL lengkap tersimpan di folder `supabase/`.

---

## Tabel

### profiles
Menyimpan profil pengguna yang terhubung langsung dengan `auth.users`.
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK, FK auth.users.id) | Dibuat otomatis via trigger saat user mendaftar |
| full_name | text | Nama lengkap pengguna |
| role | text | `patient` / `nurse` / `admin` (default: `patient`) |
| phone | text | Nomor telepon / WhatsApp |
| created_at | timestamptz | default now() |

> **Catatan Keamanan Peran:**  
> Hak `UPDATE` pada tabel `profiles` dicabut dari `anon` dan `authenticated`, dan hanya diberikan untuk kolom `(full_name, phone)`. Pasien tidak dapat mengubah role sendiri. Akun perawat diangkat secara manual oleh pengelola sistem melalui SQL Editor:
> ```sql
> UPDATE public.profiles SET role = 'nurse' WHERE id = '<uuid_perawat>';
> ```

---

### patient_nurse
Relasi penugasan antara perawat dan pasien yang dibina.
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| patient_id | uuid (FK profiles) | Pasien yang dibina |
| nurse_id | uuid (FK profiles) | Perawat pembina |
| created_at | timestamptz | default now() |

*Constraint:* UNIQUE (patient_id, nurse_id).

---

### patient_details
Informasi klinis tambahan untuk pasien.
| Kolom | Tipe | Keterangan |
|---|---|---|
| patient_id | uuid (PK, FK profiles) | |
| birth_date | date | Tanggal lahir pasien |
| diabetes_type | text | Tipe diabetes (mis. Tipe 2) |
| wound_location | text | Lokasi luka ulkus |
| notes | text | Catatan riwayat medis singkat |
| created_at | timestamptz | default now() |

---

### glucose_reference_ranges
Nilai rujukan glukosa darah resmi (target kendali harian & kriteria diagnosis).
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | serial (PK) | |
| test_type | text | `preprandial`, `postprandial`, `gdp`, `gd2pp`, `hba1c` |
| unit | text | `mg/dL` atau `%` |
| purpose | text | `control_target` (target kendali) atau `diagnostic` (kriteria diagnosis) |
| category | text | `low`, `normal`, `high`, `prediabetes`, `dm` |
| min_value | numeric | Batas bawah (inklusif: `>= min_value`) |
| max_value | numeric | Batas atas (eksklusif: `< max_value`) |
| label | text | Label deskriptif hasil pemeriksaan |
| source | text | Sumber pedoman resmi (PERKENI / ADA) |

*Constraint:* UNIQUE (purpose, test_type, category).

**Kueri Klasifikasi Glukosa (Interval Setengah Terbuka):**
```sql
SELECT category, label
FROM public.glucose_reference_ranges
WHERE purpose = 'control_target'
  AND test_type = :test_type
  AND :value >= min_value
  AND :value < max_value;
```

---

### glucose_logs
Catatan pemeriksaan glukosa mandiri pasien.
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| patient_id | uuid (FK profiles) | ID pasien pemilik data |
| value_mgdl | integer | Nilai glukosa (CHECK: 20 .. 1000 mg/dL) |
| test_type | text | `preprandial` (sebelum makan) / `postprandial` (setelah makan) |
| measured_at | timestamptz | Waktu pengukuran (default now()) |
| category | text | `low` / `normal` / `high` (dihitung otomatis oleh trigger) |
| note | text | Catatan kondisi fisik/makanan opsional |
| created_at | timestamptz | default now() |

> **Trigger Klasifikasi Otomatis:**  
> Trigger `trg_set_glucose_category` (`BEFORE INSERT OR UPDATE`) selalu menghitung ulang kolom `category` dari `glucose_reference_ranges` (purpose = 'control_target', setengah terbuka). Payload category dari klien diabaikan. Jika nilai di luar rentang, query dibatalkan via `RAISE EXCEPTION`.

---

### medication_schedules
Jadwal pengobatan pasien (hanya dapat dibuat dan diubah oleh perawat yang ditugaskan).
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| patient_id | uuid (FK profiles) | Pasien penerima obat |
| drug_name | text | Nama obat dan kekuatan sediaan |
| dose | text | Dosis dan aturan minum (mis. 1 tablet) |
| times | text[] | Array waktu minum (mis. `{"08:00", "20:00"}`) |
| start_date | date | Tanggal mulai konsumsi |
| end_date | date | Tanggal selesai (opsional) |
| created_by | uuid (FK profiles) | ID perawat pembuat jadwal |
| created_at | timestamptz | default now() |

---

### wound_care_schedules
Jadwal perawatan luka ulkus (hanya dapat dibuat dan diubah oleh perawat yang ditugaskan).
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| patient_id | uuid (FK profiles) | Pasien pemilik jadwal |
| type | text | `dressing` / `checkup` / `control` |
| title | text | Judul instruksi perawatan |
| scheduled_at | timestamptz | Waktu pelaksanaan |
| recurrence | text | `none` / `daily` / `every_2_days` / `weekly` |
| created_by | uuid (FK profiles) | ID perawat pembuat jadwal |
| created_at | timestamptz | default now() |

---

### schedule_logs
Catatan pelaksanaan jadwal obat atau perawatan luka.
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| patient_id | uuid (FK profiles) | Pasien pemilik jadwal |
| schedule_type | text | `medication` / `wound_care` |
| schedule_id | uuid | ID jadwal yang bersangkutan |
| due_at | timestamptz | Waktu yang dijadwalkan |
| done_at | timestamptz | Waktu saat pasien menandai selesai (null jika belum) |
| status | text | `done` / `missed` / `pending` |
| created_at | timestamptz | default now() |

---

### education_articles
Artikel edukasi kesehatan dan ulkus diabetik.
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| title | text | Judul artikel edukasi |
| category | text | Kategori artikel |
| content | text | Konten materi dalam format Markdown |
| video_url | text | URL embed video YouTube (opsional) |
| published | boolean | Status tayang (default: false) |
| created_at | timestamptz | default now() |

---

### emergency_contacts
Daftar kontak darurat medis dan perawat.
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| name | text | Nama instansi / kontak |
| phone | text | Nomor telepon darurat |
| whatsapp | text | Nomor WhatsApp (format internasional) |
| type | text | `nurse` / `hospital` / `ambulance` |
| patient_id | uuid (nullable) | NULL untuk kontak umum; terisi untuk kontak pasien |
| created_at | timestamptz | default now() |

---

### nurse_notes
Catatan tindak lanjut dan perkembangan kondisi dari perawat.
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| patient_id | uuid (FK profiles) | Pasien yang dipantau |
| nurse_id | uuid (FK profiles) | Perawat pencatat |
| note | text | Isi catatan klinis / rekomendasi |
| created_at | timestamptz | default now() |

---

## Indeks Performa
1. `idx_glucose_logs_patient_measured`: `glucose_logs(patient_id, measured_at DESC)`
2. `idx_patient_nurse_nurse_id`: `patient_nurse(nurse_id)`
3. `idx_patient_nurse_patient_id`: `patient_nurse(patient_id)`
4. `idx_schedule_logs_patient_due`: `schedule_logs(patient_id, due_at)`

---

## Aturan Row Level Security (RLS)
Semua tabel wajib mengaktifkan Row Level Security (`ENABLE ROW LEVEL SECURITY`) dan menggunakan klausa `TO authenticated` serta `(SELECT auth.uid())`:

| Tabel | Pasien | Perawat Ditugaskan (`is_assigned_nurse`) | Publik / Anon |
|---|---|---|---|
| `profiles` | SELECT & UPDATE (kolom `full_name`, `phone`) miliknya | SELECT pasien yang ditugaskan | Ditolak |
| `patient_nurse` | SELECT relasi miliknya | SELECT relasi miliknya | Ditolak |
| `patient_details` | SELECT, INSERT, UPDATE miliknya | SELECT, INSERT, UPDATE pasien yang ditugaskan | Ditolak |
| `glucose_reference_ranges` | SELECT seluruh baris | SELECT seluruh baris | Ditolak |
| `glucose_logs` | SELECT, INSERT, UPDATE, DELETE miliknya | SELECT pasien yang ditugaskan | Ditolak |
| `medication_schedules` | SELECT miliknya | SELECT, INSERT (created_by=uid), UPDATE, DELETE | Ditolak |
| `wound_care_schedules` | SELECT miliknya | SELECT, INSERT (created_by=uid), UPDATE, DELETE | Ditolak |
| `schedule_logs` | SELECT, INSERT, UPDATE miliknya (tanpa DELETE) | SELECT pasien yang ditugaskan | Ditolak |
| `education_articles` | SELECT baris `published = true` | SELECT semua, INSERT, UPDATE, DELETE | Ditolak |
| `emergency_contacts` | SELECT (kontak umum + miliknya) | CRUD kontak umum (role nurse) & kontak pasien binaan (tidak bisa baca kontak pasien lain) | Ditolak |
| `nurse_notes` | SELECT miliknya | SELECT, INSERT, UPDATE, DELETE pasien yang ditugaskan | Ditolak |

---

## Hak Akses Fungsi (Function Privileges)
Fungsi pembantu `current_user_role()` dan `is_assigned_nurse(uuid)` dicabut dari `PUBLIC` dan `anon` via `REVOKE EXECUTE ... FROM PUBLIC, anon` dan hanya diberikan kepada peran `authenticated` (`GRANT EXECUTE ... TO authenticated`).

---

## Panduan Pengujian RLS
Langkah pengujian verifikasi 9 skenario keamanan (a s.d. i) tersedia lengkap di [supabase/04_rls_test.md](file:///c:/Users/Fahmi%20Alfarizi/Documents/pentink\SahabatDiabet\supabase\04_rls_test.md).
