import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Configuración de Vite para el proyecto React
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // El SW se actualiza automáticamente
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'POS Rosema',
        short_name: 'POS',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  
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
