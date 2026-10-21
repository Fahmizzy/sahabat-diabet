import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Konfigurasi Vite untuk proyek SahabatDiabet
// Tailwind v4 diintegrasikan via plugin (tidak perlu tailwind.config.js)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
