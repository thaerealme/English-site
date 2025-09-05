import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/English-site/', // Исправлено: заглавная буква E
  build: {
    outDir: 'dist'
  }
})