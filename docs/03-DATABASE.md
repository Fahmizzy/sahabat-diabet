# 03 — Database dan Keamanan (Supabase / PostgreSQL)

> Draf awal. Agen boleh menyempurnakan, tetapi harus menunjukkan SQL final kepada saya sebelum dijalankan.

## Tabel

### profiles
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK, = auth.users.id) | |
| full_name | text | |
| role | text | `patient` / `nurse` / `admin` |
| phone | text | |
| created_at | timestamptz | default now() |

### patient_nurse
Relasi perawat dan pasien yang ditugaskan.
| Kolom | Tipe |
|---|---|
| id | uuid (PK) |
| patient_id | uuid (FK profiles) |
| nurse_id | uuid (FK profiles) |

### patient_details
| Kolom | Tipe | Keterangan |
|---|---|---|
| patient_id | uuid (PK, FK profiles) | |
| birth_date | date | |
| diabetes_type | text | |
| wound_location | text | |
| notes | text | |

### glucose_reference_ranges
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | serial (PK) | |
| test_type | text | `fasting` / `postprandial` / `random` |
| category | text | `low` / `normal` / `high` |
| min_value | numeric | mg/dL |
| max_value | numeric | mg/dL |
| label | text | teks yang ditampilkan |
| source | text | rujukan (mis. PERKENI / ADA, tahun) |

> **TODO untuk saya:** isi nilai final dari pedoman resmi yang dipakai dosen pembimbing (PERKENI/ADA). Gunakan angka sementara hanya sebagai placeholder.

### glucose_logs
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| patient_id | uuid (FK profiles) | |
| value_mgdl | numeric | |
| test_type | text | |
| measured_at | timestamptz | |
| category | text | hasil klasifikasi saat disimpan |
| note | text | |

### medication_schedules
| Kolom | Tipe |
|---|---|
| id | uuid (PK) |
| patient_id | uuid (FK) |
| drug_name | text |
| dose | text |
| times | text[] (mis. `{07:00,19:00}`) |
| start_date, end_date | date |
| created_by | uuid (FK profiles) |

### wound_care_schedules
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| patient_id | uuid (FK) | |
| type | text | `dressing` / `checkup` / `control` |
| title | text | |
| scheduled_at | timestamptz | |
| recurrence | text | `none` / `daily` / `every_2_days` / `weekly` |
| created_by | uuid (FK profiles) | |

### schedule_logs
Catatan pelaksanaan jadwal.
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| patient_id | uuid (FK) | |
| schedule_type | text | `medication` / `wound_care` |
| schedule_id | uuid | |
| due_at | timestamptz | |
| done_at | timestamptz | null jika belum |
| status | text | `done` / `missed` / `pending` |

### education_articles
| Kolom | Tipe |
|---|---|
| id | uuid (PK) |
| title | text |
| category | text |
| content | text (markdown) |
| video_url | text (YouTube, opsional) |
| published | boolean |
| created_at | timestamptz |

### emergency_contacts
| Kolom | Tipe |
|---|---|
| id | uuid (PK) |
| name | text |
| phone | text |
| whatsapp | text |
| type | text (`nurse` / `hospital` / `ambulance`) |
| patient_id | uuid (nullable; null = kontak umum) |

### nurse_notes
| Kolom | Tipe |
|---|---|
| id | uuid (PK) |
| patient_id | uuid (FK) |
| nurse_id | uuid (FK) |
| note | text |
| created_at | timestamptz |

## Aturan RLS (wajib aktif di semua tabel)
| Tabel | Pasien | Perawat | Publik |
|---|---|---|---|
| profiles | baca/ubah miliknya | baca pasien yang ditugaskan | tidak ada |
| glucose_logs | CRUD miliknya | baca pasien yang ditugaskan | tidak ada |
| medication_schedules, wound_care_schedules | baca miliknya | CRUD untuk pasien yang ditugaskan | tidak ada |
| schedule_logs | baca & ubah status miliknya | baca pasien yang ditugaskan | tidak ada |
| education_articles | baca yang published | CRUD (atau admin saja) | tidak ada |
| glucose_reference_ranges | baca | baca | tidak ada |
| emergency_contacts | baca (umum + miliknya) | CRUD | tidak ada |
| nurse_notes | baca miliknya | CRUD untuk pasien yang ditugaskan | tidak ada |

Prinsip: "boleh hanya jika baris itu milik user, atau user adalah perawat yang ditugaskan (via `patient_nurse`)".

## Pengujian RLS (wajib sebelum lanjut)
1. Buat 2 akun pasien dummy dan 1 akun perawat.
2. Login sebagai pasien A: pastikan tidak bisa melihat data pasien B.
3. Login sebagai perawat: hanya melihat pasien yang ditugaskan.
