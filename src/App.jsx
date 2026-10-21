// App.jsx — Komponen utama yang mengatur routing seluruh aplikasi
// Proteksi rute per peran akan ditambahkan di Tugas 3 (useAuth)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'

function App() {
  return (
    // BrowserRouter membungkus semua rute agar react-router-dom berfungsi
    <BrowserRouter>
      <Routes>
        {/* Rute pasien */}
        <Route path="/" element={<HomePage />} />

        {/* Rute autentikasi */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rute tidak dikenal → redirect ke beranda */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
