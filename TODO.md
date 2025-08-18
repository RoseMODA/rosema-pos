# TODO - Sistema POS Rosema

## 🎯 Etapa Actual: Etapa 1 - Configuración Base del Proyecto

### ✅ Completado
- [x] Plan completo creado y documentado
- [x] Credenciales de Firebase obtenidas

### 🔄 En Progreso
- [ ] **Paso 1:** Inicialización del proyecto Vite
- [ ] **Paso 2:** Instalación de dependencias
- [ ] **Paso 3:** Configuración de estructura de carpetas
- [ ] **Paso 4:** Configuración de Firebase
- [ ] **Paso 5:** Configuración de TailwindCSS
- [ ] **Paso 6:** Creación de componentes base
- [ ] **Paso 7:** Configuración de rutas
- [ ] **Paso 8:** Configuración de Firebase Hosting
- [ ] **Paso 9:** Testing y verificación

### 📋 Detalles de Implementación

#### Paso 1: Inicialización del proyecto Vite
- Crear nuevo proyecto: `npm create vite@latest rosema-pos --template react`
- Limpiar archivos innecesarios del template

#### Paso 2: Instalación de dependencias
```bash
npm install firebase react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### Paso 3: Estructura de carpetas
```
/src
  /assets          # Imágenes, logos, etc.
  /components      # Componentes reutilizables
  /pages           # Páginas principales (Login, Home, etc.)
  /services        # firebase.js y otros servicios
  /utils           # Funciones utilitarias
  /hooks           # Custom hooks (useAuth, etc.)
main.jsx           # Punto de entrada
style.css          # TailwindCSS
```

#### Paso 4: Configuración Firebase
- Crear `/src/services/firebase.js`
- Configurar Authentication
- Configurar Firestore
- Manejo de errores

#### Paso 5: TailwindCSS
- Configurar `tailwind.config.js`
- Importar directivas en `style.css`

#### Paso 6: Componentes Base
- Login.jsx (página de autenticación)
- Home.jsx (dashboard básico)
- App.jsx (configuración de rutas)

#### Paso 7: Rutas
- Configurar React Router
- Rutas protegidas
- Navegación entre páginas

#### Paso 8: Firebase Hosting
- Crear `firebase.json`
- Crear `.firebaserc`
- Configurar para SPA

#### Paso 9: Testing
- Probar autenticación
- Verificar rutas
- Comprobar responsive design

---

## 📅 Próximas Etapas

### Etapa 2: Dashboard y Navegación
- Menú lateral rojo (#D62818)
- Vista principal con estadísticas
- Botones rápidos

### Etapa 3: Sistema de Ventas
- Búsqueda de productos
- Carrito de compras
- Métodos de pago
- Ventas en espera

### Etapa 4: Gestión de Productos
- CRUD de productos
- Categorías y tags
- Stock y tallas
- Códigos de barras

### Etapa 5: Gestión de Clientes
- CRUD de clientes
- Perfiles y estadísticas

### Etapa 6: Gestión de Proveedores
- CRUD de proveedores
- Información detallada
- Filtros de búsqueda

### Etapa 7: Estadísticas y Metas
- Gráficos de ventas
- Gastos fijos
- Metas financieras

### Etapa 8: Facturas ARCA
- CRUD de facturas
- Integración tributaria

---

## 🔧 Configuración Técnica

### Credenciales Firebase
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAMbdKhLxdzaigZW95MC9G0hPGR4r-b5d0",
  authDomain: "rosema-pos.firebaseapp.com",
  projectId: "rosema-pos",
  storageBucket: "rosema-pos.firebasestorage.app",
  messagingSenderId: "1097595627472",
  appId: "1:1097595627472:web:18e4f622b01b4ec8643bd5",
  measurementId: "G-D7RDWF848P"
};
```

### Paleta de Colores
- Rojo principal: `#D62818`
- Negro: `#222222`
- Blanco: `#ffffff`

---

## 📝 Notas
- Mantener código comentado
- Usar componentes modulares
- Implementar manejo de errores
- Seguir principios de React hooks
- Responsive design con TailwindCSS
