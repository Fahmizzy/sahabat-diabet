// src/pages/RegisterPage.jsx
// Halaman pendaftaran pasien baru (/daftar)
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, getHomePath } from '../hooks/useAuth'

function RegisterPage() {
  const { user, profile, loading, signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [consent, setConsent] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [confirmationNotice, setConfirmationNotice] = useState(false)

  // Jika sudah terotentikasi dan profil selesai dimuat, alihkan ke beranda peran masing-masing
  if (!loading && user && profile) {
    return <Navigate to={getHomePath(profile.role)} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validasi form sisi klien
    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.')
      return
    }

    if (!email.trim()) {
      setErrorMessage('Alamat email wajib diisi.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Kata sandi harus minimal 8 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.')
      return
    }

    if (!consent) {
      setErrorMessage('Anda wajib menyetujui persetujuan pencatatan data kesehatan untuk mendaftar.')
      return
    }

    setSubmitting(true)

    try {
      // Panggil fungsi signUp (role TIDAK dikirimkan; trigger handle_new_user memastikan role 'patient')
      const result = await signUp({
        email,
        password,
        full_name: fullName,
        phone,
      })

      // Jika pendaftaran berhasil tetapi Supabase mengaktifkan konfirmasi email (tidak langsung ada session)
      if (result?.user && !result?.session) {
        setConfirmationNotice(true)
      } else {
        // Jika langsung ada session, redirect ke beranda pasien
        navigate('/', { replace: true })
      }
    } catch (err) {
      setErrorMessage(err.message || 'Pendaftaran gagal. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  // Tampilan pemberitahuan jika pendaftaran butuh konfirmasi email
  if (confirmationNotice) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ✉️
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Pendaftaran Berhasil!
          </h1>
          <p className="text-base text-slate-600 mb-6">
            Cek email Anda untuk konfirmasi pendaftaran sebelum masuk ke aplikasi.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full min-h-[44px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base rounded-xl transition duration-150"
          >
            Menuju Halaman Masuk
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {/* Header Identitas Aplikasi */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Daftar Pasien Baru
          </h1>
          <p className="text-base text-slate-500 mt-1">
            SahabatDiabet — Pendamping Perawatan Ulkus
          </p>
        </div>

        {/* Banner Pesan Error */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-base"
          >
            {errorMessage}
          </div>
        )}

        {/* Form Pendaftaran */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-base font-medium text-slate-700 mb-1"
            >
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="contoh: Budi Santoso"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-base font-medium text-slate-700 mb-1"
            >
              Nomor HP / WhatsApp
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="contoh: 081234567890"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-base font-medium text-slate-700 mb-1"
            >
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-base font-medium text-slate-700 mb-1"
            >
              Kata Sandi <span className="text-rose-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-base font-medium text-slate-700 mb-1"
            >
              Ulangi Kata Sandi <span className="text-rose-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Masukkan kata sandi yang sama"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Checkbox Persetujuan (Consent) Data Kesehatan — WAJIB */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 min-w-[20px] rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-sm sm:text-base text-slate-700 leading-snug">
                Saya menyetujui data kesehatan saya dicatat dan digunakan untuk pemantauan perawatan. Data ini bersifat pribadi dan ini adalah aplikasi prototipe.
              </span>
            </label>
          </div>

          {/* Tombol Kirim Pendaftaran */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-medium text-base rounded-xl transition duration-150 shadow-sm"
            >
              {submitting ? 'Sedang Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </div>
        </form>

        {/* Tautan ke Halaman Masuk */}
        <p className="mt-6 text-center text-base text-slate-600">
          Sudah memiliki akun?{' '}
          <Link
            to="/login"
            className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  )
}

export default RegisterPage
