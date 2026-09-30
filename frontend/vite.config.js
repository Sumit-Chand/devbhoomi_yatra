import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For a sub-path host (e.g. GitHub Pages): VITE_BASE=/repo-name/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000' } }, // dev only, does NOT exist in production
})
