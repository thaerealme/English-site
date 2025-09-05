import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/English-site/', // Путь к репозиторию
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})