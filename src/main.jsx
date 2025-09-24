import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './style.css'

// Importar registro del service worker PWA
import { registerSW } from 'virtual:pwa-register'

// Registrar el service worker
registerSW({ immediate: true })

// Punto de entrada principal de la aplicación React
// Se renderiza dentro de BrowserRouter para habilitar el routing
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Hay una nueva versión disponible. ¿Actualizar?")) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log("La app está lista para usarse offline ✅")
  },
})
