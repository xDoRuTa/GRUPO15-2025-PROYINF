import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,              // permite acceso por IP si lo necesitas
    port: 5173,              // o el que uses
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // backend
        changeOrigin: true,
        secure: false,                   // por si usas http
        // si alguna vez quieres quitar el prefijo '/api' en el backend:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})