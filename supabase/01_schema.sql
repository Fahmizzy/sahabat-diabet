-- ==============================================================================
-- 01_schema.sql — SahabatDiabet (Homecare Ulkus Diabetik)
-- Skema Tabel, Indeks, Fungsi Keamanan, Trigger, dan Hak Akses Kolom
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABEL: profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'nurse', 'admin')),
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. TABEL: patient_nurse
-- Relasi perawat dan pasien yang ditugaskan
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_nurse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nurse_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_patient_nurse UNIQUE (patient_id, nurse_id)
);

-- ------------------------------------------------------------------------------
-- 3. TABEL: patient_details
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_details (
  patient_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  birth_date date,
  diabetes_type text,
  wound_location text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. TABEL: glucose_reference_ranges
-- Nilai rujukan glukosa (target kendali & kriteria diagnosis)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.glucose_reference_ranges (
  id serial PRIMARY KEY,
  test_type text NOT NULL CHECK (test_type IN ('preprandial', 'postprandial', 'gdp', 'gd2pp', 'hba1c')),
  unit text NOT NULL CHECK (unit IN ('mg/dL', '%')),
  purpose text NOT NULL CHECK (purpose IN ('control_target', 'diagnostic')),
  category text NOT NULL CHECK (category IN ('low', 'normal', 'high', 'prediabetes', 'dm')),
  min_value numeric NOT NULL,
  max_value numeric NOT NULL,
  label text NOT NULL,
  source text NOT NULL,
  CONSTRAINT chk_range_min_max CHECK (min_value < max_value),
  CONSTRAINT chk_purpose_category CHECK (
    (purpose = 'control_target' AND category IN ('low', 'normal', 'high')) OR
    (purpose = 'diagnostic' AND category IN ('normal', 'prediabetes', 'dm'))
  ),
  CONSTRAINT uq_range UNIQUE (purpose, test_type, category)
);

-- ------------------------------------------------------------------------------
-- 5. TABEL: glucose_logs
-- Catatan glukosa mandiri pasien (preprandial / postprandial)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.glucose_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  value_mgdl integer NOT NULL CHECK (value_mgdl >= 20 AND value_mgdl <= 1000),
  test_type text NOT NULL CHECK (test_type IN ('preprandial', 'postprandial')),
  measured_at timestamptz NOT NULL DEFAULT now(),
  category text NOT NULL CHECK (category IN ('low', 'normal', 'high')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. TABEL: medication_schedules
-- Jadwal minum obat pasien
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medication_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  drug_name text NOT NULL,
  dose text NOT NULL,
  times text[] NOT NULL DEFAULT '{}',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. TABEL: wound_care_schedules
-- Jadwal perawatan luka (ganti balutan / kontrol)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wound_care_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('dressing', 'checkup', 'control')),
  title text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  recurrence text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'every_2_days', 'weekly')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 8. TABEL: schedule_logs
-- Catatan eksekusi jadwal obat & perawatan luka
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedule_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_type text NOT NULL CHECK (schedule_type IN ('medication', 'wound_care')),
  schedule_id uuid NOT NULL,
  due_at timestamptz NOT NULL,
  done_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('done', 'missed', 'pending')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 9. TABEL: education_articles
-- Artikel edukasi kesehatan dan ulkus diabetik
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.education_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  video_url text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 10. TABEL: emergency_contacts
-- Kontak darurat (umum [patient_id NULL] atau spesifik pasien)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  type text NOT NULL CHECK (type IN ('nurse', 'hospital', 'ambulance')),
  patient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 11. TABEL: nurse_notes
-- Catatan pemantauan dan tindak lanjut dari perawat untuk pasien
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nurse_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nurse_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- INDEKS PERFORMA
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_glucose_logs_patient_measured 
  ON public.glucose_logs (patient_id, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_nurse_nurse_id 
  ON public.patient_nurse (nurse_id);

CREATE INDEX IF NOT EXISTS idx_patient_nurse_patient_id 
  ON public.patient_nurse (patient_id);

CREATE INDEX IF NOT EXISTS idx_schedule_logs_patient_due 
  ON public.schedule_logs (patient_id, due_at);

-- ------------------------------------------------------------------------------
-- FUNGSI SECURITY DEFINER & TRIGGER
-- ------------------------------------------------------------------------------

-- Fungsi pembantu: mengambil role pengguna saat ini secara aman
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

-- Fungsi pembantu: memverifikasi apakah perawat ditugaskan ke pasien
-- dan memastikan role di profiles benar 'nurse'
CREATE OR REPLACE FUNCTION public.is_assigned_nurse(p_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patient_nurse pn
    JOIN public.profiles pr ON pr.id = pn.nurse_id
    WHERE pn.nurse_id = (SELECT auth.uid())
      AND pn.patient_id = p_patient_id
      AND pr.role = 'nurse'
  );
$$;

-- Trigger saat user baru mendaftar di auth.users
-- KEAMANAN: role SELALU 'patient', tidak membaca metadata role dari klien
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'patient',
    COALESCE(new.raw_user_meta_data->>'phone', NULL)
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger untuk menghitung ulang category pada glucose_logs secara otomatis
-- Berjalan pada BEFORE INSERT OR UPDATE (semua kolom)
-- Menggunakan rentang setengah terbuka: min_value <= nilai AND nilai < max_value
-- Jika tidak ada rentang cocok, melempar EXCEPTION (tidak menyimpan nilai tak terklasifikasi)
CREATE OR REPLACE FUNCTION public.set_glucose_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_category text;
BEGIN
  SELECT category INTO v_category
  FROM public.glucose_reference_ranges
  WHERE purpose = 'control_target'
    AND test_type = NEW.test_type
    AND NEW.value_mgdl >= min_value
    AND NEW.value_mgdl < max_value
  LIMIT 1;

  IF v_category IS NULL THEN
    RAISE EXCEPTION 'Kategori glukosa tidak ditemukan di glucose_reference_ranges untuk nilai % mg/dL dan jenis %', NEW.value_mgdl, NEW.test_type;
  END IF;

  -- Selalu timpa dengan hasil perhitungan tabel rujukan resmi
  NEW.category := v_category;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_glucose_category ON public.glucose_logs;
CREATE TRIGGER trg_set_glucose_category
  BEFORE INSERT OR UPDATE
  ON public.glucose_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_glucose_category();

-- ------------------------------------------------------------------------------
-- KEAMANAN KOLOM: MENCEGAH PENGGUNA MENGUBAH ROLE SENDIRI
-- Akun perawat hanya dibuat secara manual oleh pengelola sistem via SQL Editor:
--   UPDATE public.profiles SET role = 'nurse' WHERE id = '<uuid_perawat>';
-- ------------------------------------------------------------------------------
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (full_name, phone) ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;

-- ------------------------------------------------------------------------------
-- HAK AKSES FUNGSI (FUNCTION PRIVILEGES)
-- Batasi eksekusi fungsi helper hanya untuk pengguna terotentikasi
-- ------------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_assigned_nurse(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_assigned_nurse(uuid) TO authenticated;

-- Fungsi trigger hanya dijalankan otomatis oleh sistem basis data dan tidak boleh dipanggil lewat RPC/API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_glucose_category() FROM PUBLIC, anon, authenticated;
