// src/pages/LoginPage.jsx
// Halaman masuk untuk pasien dan perawat (/login)
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth, getHomePath } from '../hooks/useAuth'

function LoginPage() {
  const { user, profile, loading, signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Jika sudah terotentikasi dan profil selesai dimuat, langsung alihkan ke beranda perannya
  if (!loading && user && profile) {
    return <Navigate to={getHomePath(profile.role)} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Email dan kata sandi wajib diisi.')
      return
    }

    setSubmitting(true)

    try {
      await signIn({ email, password })
      // Setelah login berhasil, session & profile dimuat oleh AuthProvider,
      // lalu redirect otomatis ke beranda masing-masing (/ atau /perawat)
    } catch (err) {
      // Menggunakan pesan generik ramah untuk seluruh kegagalan kredensial
      setErrorMessage(err.message || 'Email atau kata sandi salah. Silakan periksa kembali.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {/* Header Identitas */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Masuk ke Akun
          </h1>
          <p className="text-base text-slate-500 mt-1">
            SahabatDiabet — Homecare Ulkus Diabetik
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

        {/* Form Masuk */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-base font-medium text-slate-700 mb-1"
            >
              Alamat Email
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
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi Anda"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-medium text-base rounded-xl transition duration-150 shadow-sm"
            >
              {submitting ? 'Sedang Masuk...' : 'Masuk'}
            </button>
          </div>
        </form>

        {/* Tautan ke Halaman Registrasi */}
        <p className="mt-6 text-center text-base text-slate-600">
          Belum memiliki akun pasien?{' '}
          <Link
            to="/daftar"
            className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  )
}

export default LoginPage
