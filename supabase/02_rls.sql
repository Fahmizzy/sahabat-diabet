-- ==============================================================================
-- 02_rls.sql — SahabatDiabet (Homecare Ulkus Diabetik)
-- Kebijakan Row Level Security (RLS) untuk Semua Tabel
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABEL: profiles
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR public.is_assigned_nurse(id)
  );

CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ------------------------------------------------------------------------------
-- 2. TABEL: patient_nurse
-- ------------------------------------------------------------------------------
ALTER TABLE public.patient_nurse ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_nurse_select_policy"
  ON public.patient_nurse
  FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
    OR nurse_id = (SELECT auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 3. TABEL: patient_details
-- ------------------------------------------------------------------------------
ALTER TABLE public.patient_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_details_select_policy"
  ON public.patient_details
  FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
    OR public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "patient_details_insert_policy"
  ON public.patient_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = (SELECT auth.uid())
    OR public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "patient_details_update_policy"
  ON public.patient_details
  FOR UPDATE
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
    OR public.is_assigned_nurse(patient_id)
  )
  WITH CHECK (
    patient_id = (SELECT auth.uid())
    OR public.is_assigned_nurse(patient_id)
  );

-- ------------------------------------------------------------------------------
-- 4. TABEL: glucose_reference_ranges
-- Hanya baca (SELECT) untuk pengguna terotentikasi
-- ------------------------------------------------------------------------------
ALTER TABLE public.glucose_reference_ranges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "glucose_reference_ranges_select_policy"
  ON public.glucose_reference_ranges
  FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- 5. TABEL: glucose_logs
-- Pasien memiliki hak penuh atas catatan miliknya, perawat binaan hanya membaca
-- ------------------------------------------------------------------------------
ALTER TABLE public.glucose_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "glucose_logs_select_policy"
  ON public.glucose_logs
  FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
    OR public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "glucose_logs_insert_policy"
  ON public.glucose_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = (SELECT auth.uid())
  );

CREATE POLICY "glucose_logs_update_policy"
  ON public.glucose_logs
  FOR UPDATE
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
  )
  WITH CHECK (
    patient_id = (SELECT auth.uid())
  );

CREATE POLICY "glucose_logs_delete_policy"
  ON public.glucose_logs
  FOR DELETE
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 6. TABEL: medication_schedules
-- Pasien hanya membaca; INSERT/UPDATE/DELETE hanya perawat yang ditugaskan.
-- created_by wajib mencatat ID perawat yang melakukan penambahan.
-- ------------------------------------------------------------------------------
ALTER TABLE public.medication_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medication_schedules_select_policy"
  ON public.medication_schedules
  FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
    OR public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "medication_schedules_insert_policy"
  ON public.medication_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_assigned_nurse(patient_id)
    AND created_by = (SELECT auth.uid())
  );

CREATE POLICY "medication_schedules_update_policy"
  ON public.medication_schedules
  FOR UPDATE
  TO authenticated
  USING (
    public.is_assigned_nurse(patient_id)
  )
  WITH CHECK (
    public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "medication_schedules_delete_policy"
  ON public.medication_schedules
  FOR DELETE
  TO authenticated
  USING (
    public.is_assigned_nurse(patient_id)
  );

-- ------------------------------------------------------------------------------
-- 7. TABEL: wound_care_schedules
-- Pasien hanya membaca; INSERT/UPDATE/DELETE hanya perawat yang ditugaskan.
-- created_by wajib mencatat ID perawat yang melakukan penambahan.
-- ------------------------------------------------------------------------------
ALTER TABLE public.wound_care_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wound_care_schedules_select_policy"
  ON public.wound_care_schedules
  FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
    OR public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "wound_care_schedules_insert_policy"
  ON public.wound_care_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_assigned_nurse(patient_id)
    AND created_by = (SELECT auth.uid())
  );

CREATE POLICY "wound_care_schedules_update_policy"
  ON public.wound_care_schedules
  FOR UPDATE
  TO authenticated
  USING (
    public.is_assigned_nurse(patient_id)
  )
  WITH CHECK (
    public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "wound_care_schedules_delete_policy"
  ON public.wound_care_schedules
  FOR DELETE
  TO authenticated
  USING (
    public.is_assigned_nurse(patient_id)
  );

-- ------------------------------------------------------------------------------
-- 8. TABEL: schedule_logs
-- Pasien dapat membaca, membuat, dan memperbarui status pelaksanaan miliknya (tanpa DELETE).
-- Perawat yang ditugaskan HANYA dapat membaca.
-- ------------------------------------------------------------------------------
ALTER TABLE public.schedule_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedule_logs_select_policy"
  ON public.schedule_logs
  FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
    OR public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "schedule_logs_insert_policy"
  ON public.schedule_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = (SELECT auth.uid())
  );

CREATE POLICY "schedule_logs_update_policy"
  ON public.schedule_logs
  FOR UPDATE
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
  )
  WITH CHECK (
    patient_id = (SELECT auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 9. TABEL: education_articles
-- Pasien hanya melihat artikel published = true. Perawat/admin melihat semua dan mengelola konten.
-- ------------------------------------------------------------------------------
ALTER TABLE public.education_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "education_articles_select_policy"
  ON public.education_articles
  FOR SELECT
  TO authenticated
  USING (
    published = true
    OR public.current_user_role() IN ('nurse', 'admin')
  );

CREATE POLICY "education_articles_insert_policy"
  ON public.education_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_user_role() IN ('nurse', 'admin')
  );

CREATE POLICY "education_articles_update_policy"
  ON public.education_articles
  FOR UPDATE
  TO authenticated
  USING (
    public.current_user_role() IN ('nurse', 'admin')
  )
  WITH CHECK (
    public.current_user_role() IN ('nurse', 'admin')
  );

CREATE POLICY "education_articles_delete_policy"
  ON public.education_articles
  FOR DELETE
  TO authenticated
  USING (
    public.current_user_role() IN ('nurse', 'admin')
  );

-- ------------------------------------------------------------------------------
-- 10. TABEL: emergency_contacts
-- Pasien HANYA membaca kontak (umum + miliknya).
-- Kontak umum (patient_id IS NULL) dikelola nurse/admin.
-- Kontak pasien dikelola oleh perawat yang ditugaskan (is_assigned_nurse).
-- ------------------------------------------------------------------------------
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emergency_contacts_select_policy"
  ON public.emergency_contacts
  FOR SELECT
  TO authenticated
  USING (
    patient_id IS NULL
    OR patient_id = (SELECT auth.uid())
    OR public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "emergency_contacts_insert_policy"
  ON public.emergency_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (patient_id IS NULL AND public.current_user_role() IN ('nurse', 'admin'))
    OR (patient_id IS NOT NULL AND public.is_assigned_nurse(patient_id))
  );

CREATE POLICY "emergency_contacts_update_policy"
  ON public.emergency_contacts
  FOR UPDATE
  TO authenticated
  USING (
    (patient_id IS NULL AND public.current_user_role() IN ('nurse', 'admin'))
    OR (patient_id IS NOT NULL AND public.is_assigned_nurse(patient_id))
  )
  WITH CHECK (
    (patient_id IS NULL AND public.current_user_role() IN ('nurse', 'admin'))
    OR (patient_id IS NOT NULL AND public.is_assigned_nurse(patient_id))
  );

CREATE POLICY "emergency_contacts_delete_policy"
  ON public.emergency_contacts
  FOR DELETE
  TO authenticated
  USING (
    (patient_id IS NULL AND public.current_user_role() IN ('nurse', 'admin'))
    OR (patient_id IS NOT NULL AND public.is_assigned_nurse(patient_id))
  );

-- ------------------------------------------------------------------------------
-- 11. TABEL: nurse_notes
-- Pasien hanya membaca catatan miliknya; perawat yang ditugaskan memiliki hak CRUD.
-- ------------------------------------------------------------------------------
ALTER TABLE public.nurse_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nurse_notes_select_policy"
  ON public.nurse_notes
  FOR SELECT
  TO authenticated
  USING (
    patient_id = (SELECT auth.uid())
    OR public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "nurse_notes_insert_policy"
  ON public.nurse_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    nurse_id = (SELECT auth.uid())
    AND public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "nurse_notes_update_policy"
  ON public.nurse_notes
  FOR UPDATE
  TO authenticated
  USING (
    nurse_id = (SELECT auth.uid())
    AND public.is_assigned_nurse(patient_id)
  )
  WITH CHECK (
    nurse_id = (SELECT auth.uid())
    AND public.is_assigned_nurse(patient_id)
  );

CREATE POLICY "nurse_notes_delete_policy"
  ON public.nurse_notes
  FOR DELETE
  TO authenticated
  USING (
    nurse_id = (SELECT auth.uid())
    AND public.is_assigned_nurse(patient_id)
  );
