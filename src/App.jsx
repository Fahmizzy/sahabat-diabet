// src/App.jsx — Pengaturan routing utama aplikasi SahabatDiabet
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { GlucoseProvider } from './hooks/useGlucose.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import PerawatDashboardPage from './pages/PerawatDashboardPage.jsx'
import UnsupportedRolePage from './pages/UnsupportedRolePage.jsx'
import GlucosePage from './pages/GlucosePage.jsx'
import NilaiNormalPage from './pages/NilaiNormalPage.jsx'
import EducationPage from './pages/EducationPage.jsx'
import ArticleDetailPage from './pages/ArticleDetailPage.jsx'

function App() {
  return (
    <AuthProvider>
      <GlucoseProvider>
        <BrowserRouter>
          <Routes>
            {/* Rute Publik (Autentikasi) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/daftar" element={<RegisterPage />} />

            {/* Rute Khusus Pasien (hanya role 'patient') */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gula-darah"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <GlucosePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gula-darah/nilai-normal"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <NilaiNormalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edukasi"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <EducationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edukasi/:id"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <ArticleDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Rute Khusus Perawat (hanya role 'nurse') */}
            <Route
              path="/perawat"
              element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <PerawatDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Rute untuk Peran yang Belum Didukung (mis. admin) */}
            <Route path="/tidak-didukung" element={<UnsupportedRolePage />} />

            {/* Fallback rute tidak dikenal → kembali ke beranda */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </GlucoseProvider>
    </AuthProvider>
  )
}

export default App
