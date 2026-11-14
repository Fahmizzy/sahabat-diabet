/* eslint-disable react-refresh/only-export-components */
// src/hooks/useAuth.jsx
// AuthProvider dan custom hook useAuth() untuk mengelola sesi dan profil pengguna
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

/**
 * Menentukan rute beranda berdasarkan peran pengguna.
 * Mencegah loop pengalihan jika pengguna memiliki peran tertentu.
 * @param {string} role - peran pengguna ('patient' | 'nurse' | 'admin' | string)
 * @returns {string} path tujuan
 */
export function getHomePath(role) {
  if (role === 'patient') return '/'
  if (role === 'nurse') return '/perawat'
  return '/tidak-didukung'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)

  // Profil pengguna dari tabel public.profiles
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileNotFound, setProfileNotFound] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // 1. Inisialisasi sesi awal dan dengarkan perubahan status autentikasi
  useEffect(() => {
    // Ambil sesi awal yang tersimpan
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        setSession(initialSession)
      })
      .catch(() => {
        setSession(null)
      })
      .finally(() => {
        setLoadingSession(false)
      })

    // Dengarkan event perubahan sesi (login, logout, token refresh)
    // CATATAN KEAMANAN & ARSITEKTUR:
    // JANGAN memanggil Supabase query (await supabase...) di dalam callback ini
    // untuk mencegah race condition atau potensi deadlock.
    // Callback ini HANYA menyimpan session ke state.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // 2. Muat data profil dari tabel public.profiles secara terpisah
  // Bergantung pada session?.user?.id dan retryCount (untuk tombol coba lagi)
  useEffect(() => {
    let isMounted = true
    const userId = session?.user?.id

    if (!userId) {
      setProfile(null)
      setProfileError(null)
      setProfileNotFound(false)
      setLoadingProfile(false)
      return
    }

    async function loadUserProfile() {
      setLoadingProfile(true)
      setProfileError(null)
      setProfileNotFound(false)

      try {
        // KEAMANAN: Role HANYA dibaca dari tabel profiles, bukan dari metadata klien
        // Menggunakan maybeSingle() agar jika baris tidak ada, tidak dianggap error oleh PostgreSQL
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, phone')
          .eq('id', userId)
          .maybeSingle()

        if (!isMounted) return

        if (error) {
          // Terjadi kegagalan jaringan atau query database
          setProfile(null)
          setProfileError('Gagal memuat profil, coba lagi')
          setProfileNotFound(false)
        } else if (!data) {
          // Baris di tabel profiles belum ada untuk user ini
          setProfile(null)
          setProfileError(null)
          setProfileNotFound(true)
        } else {
          // Profil berhasil dimuat
          setProfile(data)
          setProfileError(null)
          setProfileNotFound(false)
        }
      } catch {
        if (!isMounted) return
        setProfile(null)
        setProfileError('Gagal memuat profil, coba lagi')
        setProfileNotFound(false)
      } finally {
        if (isMounted) {
          setLoadingProfile(false)
        }
      }
    }

    loadUserProfile()

    return () => {
      isMounted = false
    }
  }, [session?.user?.id, retryCount])

  // Fungsi untuk memicu pemuatan ulang profil jika terjadi error jaringan
  const refetchProfile = () => {
    setRetryCount((prev) => prev + 1)
  }

  // Fungsi Masuk (Sign In)
  // Menggunakan pesan generik ramah untuk mencegah enumerasi akun
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      throw new Error('Email atau kata sandi salah. Silakan periksa kembali.')
    }

    return data
  }

  // Fungsi Registrasi (Sign Up)
  // Selalu mendaftar sebagai pasien tanpa mengirim parameter role ke auth metadata
  const signUp = async ({ email, password, full_name, phone }) => {
    // consent_at dicatat saat pengguna menyetujui checkbox dan mengirim form
    // CATATAN: consent_at hanya catatan riwayat persetujuan, bukan penentu keamanan
    const consent_at = new Date().toISOString()

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: full_name.trim(),
          phone: phone ? phone.trim() : null,
          consent_at,
        },
      },
    })

    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('already registered') || error.status === 422) {
        throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.')
      }
      throw new Error(error.message || 'Pendaftaran gagal. Silakan coba beberapa saat lagi.')
    }

    return data
  }

  // Fungsi Keluar (Sign Out)
  const signOut = async () => {
    // Reset state lokal sebelum memanggil Supabase
    setSession(null)
    setProfile(null)
    setProfileError(null)
    setProfileNotFound(false)
    await supabase.auth.signOut()
  }

  // State loading mencakup dua tahap:
  // 1. Memeriksa keberadaan sesi aktif (loadingSession)
  // 2. Jika sesi ada, menunggu profil selesai dimuat (loadingProfile atau profile belum siap)
  const isProfilePending = Boolean(session?.user?.id) && profile === null && !profileError && !profileNotFound
  const loading = loadingSession || loadingProfile || isProfilePending

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    profileError,
    profileNotFound,
    refetchProfile,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }
  return context
}
