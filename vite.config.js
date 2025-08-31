import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite para el proyecto React
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 8000, // Puerto específico para el desarrollo
    host: true, // Permite acceso desde la red local
    allowedHosts: [
      '3tfwpr-8000.csb.app',
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ]
  },
  build: {
    outDir: 'dist', // Directorio de salida para el build de producción
    sourcemap: true // Generar sourcemaps para debugging
  }
})
