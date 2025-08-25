# Plan Completo Sistema POS Rosema

## Etapa 1: Configuración Base del Proyecto ✅

### Objetivo

Configurar un proyecto de POS para la tienda Rosema en React con Vite y Firebase.

### Requisitos Técnicos

- Firebase Authentication (email y contraseña)
- Firestore
- Firebase Hosting
- TailwindCSS
- Código comentado
- Componentes modulares y hooks

### Estructura de Carpetas

```
/src
  /assets
  /components
  /pages
  /services → firebase.js
  /utils
  /hooks
main.jsx
style.css (TailwindCSS)
```

### Implementación Detallada

#### 1. Inicialización del Proyecto

- Crear nuevo proyecto Vite: `npm create vite@latest rosema-pos --template react`
- Instalar dependencias:
  ```bash
  npm install firebase react-router-dom
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

#### 2. Configuración Firebase

- **Archivo:** `/src/services/firebase.js`
- Configurar Firebase con credenciales proporcionadas
- Inicializar Auth y Firestore
- Manejo de errores con try/catch

#### 3. Componentes Base

- **Login Page:** Formulario de autenticación con email/password
- **Home Page:** Dashboard básico de bienvenida
- **App.jsx:** Configuración de rutas con React Router

#### 4. Configuración TailwindCSS

- Importar directivas en `style.css`
- Configurar `tailwind.config.js` para archivos fuente

#### 5. Firebase Hosting

- Crear `firebase.json` y `.firebaserc`
- Configurar para SPA (Single Page Application)

---

## Etapa 2: Dashboard y Navegación

### Objetivo

Crear el Dashboard principal con navegación lateral y vista de resumen.

### Características

- **Menú lateral izquierdo fijo rojo (#D62818)** con secciones:
  - Inicio
  - Estadísticas
  - Ventas
  - Productos
  - Clientes
  - Proveedores
  - Metas
  - Facturas ARCA
- **Vista principal** con:
  - Resumen de estadísticas
  - Botones rápidos: "Realizar venta", "Agregar producto"
  - Fecha actual en la interfaz

### Paleta de Colores

- Rojo principal: `#D62818`
- Negro: `#222222`
- Blanco: `#ffffff`
- Colores complementarios para legibilidad

---

## Etapa 3: Sistema de Ventas

### Objetivo

Implementar sistema completo de ventas con carrito, pagos y gestión de stock.

### Funcionalidades

#### Búsqueda y Carrito

- Buscar productos por código o nombre (Firestore)
- Carrito con modificación de cantidades
- Cálculo automático de totales
- Descuento general ($ o %)

#### Métodos de Pago

- Efectivo
- Transferencia
- Débito
- Crédito
- QR

#### Gestión de Ventas

- Guardar venta en Firestore
- Descontar stock automáticamente
- El boton "realizar cambio de prenda" deber abrir una modal donde se escanee el codigo de barras, seleccione la talla y color, y un campo donde se ponga el precio que pago (porque hay veces que se hace descuento) y que al "agregar" se agregue al carrito de compra donde el precio salga en negativo para que se reste en el total. Y obviamente que al finalizar el articulo que se devolcio pueda reponerse en el stock.
- Botón "artículo rápido" para productos no registrados:
  - Nombre
  - Talla (opcional)
  - Precio
  - Cantidad

#### Historial y Recibos

- historial de ventas, debe haber un buscador. en cada venta registrada debe tener al costado la opcion de eliminarlo, editarlo y ver el recibo.
- Imprimir recibo con:
  - Logo de Rosema
  - Datos de contacto (WhatsApp 260 438-1502, Salto de las Rosas)
  - Detalle de productos
  - Total y descuentos
  - Aviso: "Cambios en 3 días hábiles"

#### Ventas en Espera

- Crear múltiples ventas abiertas
- Identificadores: Cliente 1, Cliente 2, etc.
- Cambiar entre ventas activas
- Finalizar o borrar ventas pendientes

---

## Etapa 4: Gestión de Productos

### Objetivo

Sistema CRUD completo para gestión de inventario y productos.

### Campos de Producto

- Nombre
- Precio de compra
- Precio de venta
- % ganancia (editable)
- Categorías: mujer, hombre, niños, otros
- Tags: invierno, fiesta, jeans, etc.
- Stock con tallas y colores (hexadecimal)
- Múltiples fotos con previsualización
- Proveedor asociado (crear si no existe)

### Funcionalidades Adicionales

- Imprimir código de barras del artículo
- Resumen estadístico:
  - Top productos más vendidos
  - Tallas más vendidas por categoría

---


## Etapa 5: Gestión de Proveedores

### Objetivo

Sistema completo de gestión de proveedores con información detallada.

### Campos de Proveedor

- Nombre
- WhatsApp
- Sitio web
- Área (zona de la ciudad)
- Dirección
- Galería (opcional, es donde hay muchos vendedores juntos)
- Número de local (opcional)
- Tags (descriptivos de lo que proveen (ej: jeans, mujer, talles especiales, fiesta, sastrero, etc))
- Redes sociales (Instagram y TikTok)
- CUIL (opcional)
- Ranking de calidad de las prendas
- Notas adicionales

### Funcionalidades

- Ficha detallada mostrando:
  - Productos comprados del proveedor
  - Productos vendidos del proveedor
- Filtros de búsqueda:
  - Por nombre
  - Por tags
  - Por área geográfica

---

## Etapa 6: Gestión de Clientes

### Objetivo

Sistema CRM básico para gestión de clientes.

### Funcionalidades CRUD

- Ver, registrar, editar, eliminar clientes
- Top clientes más frecuentes

### Perfil de Cliente

- Cantidad de compras realizadas
- Tallas más compradas
- Categorías favoritas
- Historial de compras

---

## Etapa 7: Estadísticas y Metas

### Objetivo

Sistema de análisis financiero y establecimiento de objetivos comerciales.

### Estadísticas

- Gráficos con Chart.js o Recharts:
  - Ventas diarias
  - Ventas semanales
  - Ventas mensuales
- Total en $ de activos
- Total en $ invertido en productos

### Sistema de Metas

- Registro de gastos fijos:
  - Alquiler
  - Servicios (luz, agua, etc.)
  - Empleados
  - Membresías
  - Otros gastos operativos
- Cálculo de ganancias reales acumuladas
- Configuración de metas:
  - Meta diaria
  - Meta semanal
  - Meta mensual
- Validación de excedente mínimo:
  - Verificar $2.000.000 de excedente (configurable)
  - Indicador para nuevas compras/inversiones

---

## Etapa 8: Facturas ARCA

### Objetivo

Sistema de facturación electrónica integrado con ARCA.

### Funcionalidades

- CRUD de facturas
- Almacenamiento de PDF en Firebase Storage
- Registro automático para ventas con:
  - Tarjeta débito
  - Tarjeta crédito
  - Código QR
- Preparación de datos para subida a ARCA
- Integración con sistema tributario

---

## Tecnologías y Herramientas

### Frontend

- React 18+
- Vite
- TailwindCSS
- React Router DOM
- Chart.js/Recharts (para gráficos)

### Backend

- Firebase Authentication
- Firestore Database
- Firebase Storage
- Firebase Hosting

### Desarrollo

- Componentes modulares
- **Changes:**
  - Link your Firebase project:
    ```json
    {
      "projects": {
        "default": "rosema-pos"
      }
    }
    ```
- Responsive interface optimized for computers and tablets.

---

## 4. Additional Enhancements and Best Practices

- **Custom Hooks:**  
  Consider adding a custom hook (e.g., `/src/hooks/useAuth.jsx`) to manage Firebase authentication state, caching the user object and handling logout logic.

- **Comments and Error Handling:**  
  Add inline comments throughout the code to describe functionality. Wrap Firebase calls in try/catch blocks to gracefully handle initialization and authentication errors.

- **Environment Variables (Optional):**  
  For production, move Firebase configuration to a `.env` file and use `import.meta.env.VITE_FIREBASE_API_KEY` syntax to keep sensitive credentials secure.

- **Testing:**  
  Test authentication using invalid and valid email/password inputs. Verify that errors are displayed and that routing changes after login. Use Vite’s development server (`npm run dev`) and test locally before deploying with `firebase deploy`.

---

## Summary

- The project is initialized as a Vite React app with a dedicated folder structure, including assets, components, pages, services, utils, and hooks.
- Firebase is configured in `/src/services/firebase.js` using provided credentials with proper error handling.
- The UI features a modern, clean login page styled with TailwindCSS and simple routing between Login and Home pages.
- Custom hooks and modular components ensure code reusability and clear separation of concerns.
- Firebase Authentication and Firestore integration lay the foundation for subsequent POS features.
- Firebase Hosting configuration is added for seamless deployment.
