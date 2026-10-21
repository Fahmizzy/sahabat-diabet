// supabaseClient.js — Klien Supabase tunggal untuk seluruh aplikasi
// Semua query ke database dan autentikasi menggunakan instance ini
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Pengecekan env variable — jika kosong, tampilkan pesan error yang jelas
// agar developer tahu apa yang perlu diisi di file .env
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[SahabatDiabet] ❌ Env variable Supabase belum diisi!\n' +
    'Buat file .env di root proyek dan isi:\n' +
    '  VITE_SUPABASE_URL=https://<project-id>.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=<anon-key-anda>\n' +
    'Lihat .env.example untuk contoh.'
  )
}

// createClient tetap dipanggil agar aplikasi tidak crash sepenuhnya
// (fitur yang membutuhkan database akan gagal secara graceful)
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? ''
)
