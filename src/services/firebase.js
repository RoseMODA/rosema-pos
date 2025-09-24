// Importación de las funciones necesarias del SDK de Firebase
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuración de Firebase con las credenciales del proyecto Rosema POS
const firebaseConfig = {
  apiKey: "AIzaSyAMbdKhLxdzaigZW95MC9G0hPGR4r-b5d0",
  authDomain: "rosema-pos.firebaseapp.com",
  projectId: "rosema-pos",
  storageBucket: "rosema-pos.firebasestorage.app",
  messagingSenderId: "1097595627472",
  appId: "1:1097595627472:web:18e4f622b01b4ec8643bd5",
  measurementId: "G-D7RDWF848P"
}

// Inicialización de Firebase con manejo de errores
let app
try {
  app = initializeApp(firebaseConfig)
  console.log('Firebase inicializado correctamente para Rosema POS')
} catch (error) {
  console.error('Error al inicializar Firebase:', error)
  throw new Error('No se pudo conectar con Firebase. Verifique la configuración.')
}

// ✅ Inicialización de Firestore con persistencia multi-tab
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})

// Inicialización de los demás servicios
export const auth = getAuth(app)
export const storage = getStorage(app)

// Exportar la instancia de la app por si se necesita en otros lugares
export default app

// Configuración adicional para desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Modo desarrollo - Firebase configurado para:', firebaseConfig.projectId)
}
