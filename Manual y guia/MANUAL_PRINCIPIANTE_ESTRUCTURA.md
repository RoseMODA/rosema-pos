# 📚 Manual para Principiantes - Estructura del Proyecto Rosema POS

## 🎯 ¿Qué es este proyecto?

Este es un **Sistema de Punto de Venta (POS)** hecho con React que permite:
- Vender productos
- Gestionar inventario
- Manejar clientes
- Ver estadísticas de ventas
- Todo guardado en Firebase (base de datos en la nube)

---

## 📁 Estructura de Carpetas Explicada

### 🏠 Carpeta Raíz (`/`)
```
rosema-pos/
├── 📁 public/          ← Archivos que ve el navegador
├── 📁 src/             ← Tu código principal (aquí trabajas)
├── 📁 scripts/         ← Scripts para importar datos
├── 📄 package.json     ← Lista de dependencias (librerías)
├── 📄 vite.config.js   ← Configuración del servidor
└── 📄 firebase.json    ← Configuración de Firebase
```

### 📁 Carpeta `public/`
**¿Qué hace?** Archivos estáticos que el navegador puede acceder directamente.

```
public/
├── index.html              ← Página HTML base
├── rosemalognegro.png      ← Logo negro de Rosema
└── rosemalogysubwhite.png  ← Logo blanco de Rosema
```

**Para principiantes:** Si quieres cambiar el logo, reemplaza estos archivos.

### 📁 Carpeta `src/` (La más importante)
**¿Qué hace?** Contiene todo tu código React.

```
src/
├── 📁 components/    ← Piezas reutilizables de la interfaz
├── 📁 hooks/         ← Lógica personalizada reutilizable
├── 📁 pages/         ← Páginas completas de la app
├── 📁 services/      ← Comunicación con Firebase
├── 📁 utils/         ← Funciones de ayuda
├── App.jsx           ← Componente principal
├── main.jsx          ← Punto de entrada de la app
└── style.css         ← Estilos globales
```

---

## 📄 Archivos Principales Explicados

### 🚀 `src/main.jsx`
**¿Qué hace?** Es el primer archivo que se ejecuta. Inicia toda la aplicación.

```javascript
// Piensa en esto como el "encendido" de tu app
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// "Enciende" la app y la pone en el HTML
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

**Para principiantes:** Raramente necesitas tocar este archivo.

### 🏠 `src/App.jsx`
**¿Qué hace?** Es como el "plano" de tu casa. Define qué página mostrar según la URL.

```javascript
// Define las rutas (URLs) de tu app
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />           {/* Página principal */}
      <Route path="/sales" element={<Sales />} />     {/* Página de ventas */}
      <Route path="/products" element={<Products />} /> {/* Página de productos */}
    </Routes>
  );
}
```

**Para principiantes:** Si quieres agregar una nueva página, aquí defines su ruta.

### 🎨 `src/components/`
**¿Qué hace?** Contiene "piezas" de interfaz que puedes reutilizar.

#### Subcarpetas importantes:

**`components/common/`** - Componentes básicos que usas en toda la app:
- `Modal.jsx` - Ventanas emergentes
- `LoadingSpinner.jsx` - Círculo de carga
- `SearchBar.jsx` - Barra de búsqueda
- `StatsCard.jsx` - Tarjetas de estadísticas

**`components/Sales/`** - Componentes específicos para ventas:
- `SalesCart.jsx` - Carrito de compras
- `PaymentForm.jsx` - Formulario de pago
- `ProductSearch.jsx` - Búsqueda de productos para vender

**`components/Products/`** - Componentes para gestionar productos:
- `ProductsTable.jsx` - Tabla de productos
- `ProductForm.jsx` - Formulario para crear/editar productos

### 🔧 `src/hooks/`
**¿Qué hace?** Contiene lógica reutilizable. Son como "herramientas" que puedes usar en diferentes componentes.

Ejemplos importantes:
- `useAuth.js` - Maneja login/logout
- `useProducts.js` - Maneja la lista de productos
- `useSales.js` - Maneja las ventas
- `useModal.js` - Maneja ventanas emergentes

**Para principiantes:** Los hooks son funciones que empiezan con "use" y te ayudan a no repetir código.

### 📱 `src/pages/`
**¿Qué hace?** Contiene las páginas completas de tu aplicación.

```
pages/
├── Home.jsx        ← Página principal (dashboard)
├── Sales.jsx       ← Página de ventas
├── Products.jsx    ← Página de productos
├── Customers.jsx   ← Página de clientes
├── Login.jsx       ← Página de login
└── Statistics.jsx  ← Página de estadísticas
```

**Para principiantes:** Cada archivo aquí es una página completa que el usuario puede visitar.

### 🔥 `src/services/`
**¿Qué hace?** Se comunica con Firebase (tu base de datos en la nube).

```
services/
├── firebase.js         ← Configuración de Firebase
├── productsService.js  ← Operaciones con productos
├── salesService.js     ← Operaciones con ventas
├── customersService.js ← Operaciones con clientes
└── providersService.js ← Operaciones con proveedores
```

**Para principiantes:** Aquí están las funciones que guardan y obtienen datos de internet.

### 🛠️ `src/utils/`
**¿Qué hace?** Funciones de ayuda que usas en toda la app.

```
utils/
├── formatters.js    ← Formatea precios, fechas, etc.
├── calculations.js  ← Hace cálculos (totales, descuentos)
├── constants.js     ← Valores que no cambian
└── validators.js    ← Valida formularios
```

**Para principiantes:** Son como "calculadoras" y "formateadores" que puedes usar en cualquier parte.

---

## 📦 Dependencias Principales Explicadas

### En `package.json` encontrarás:

#### **React** (`react: ^18.2.0`)
**¿Qué hace?** Es la librería principal para crear interfaces de usuario.
**¿Por qué la usamos?** Permite crear componentes reutilizables y manejar el estado de la app.

#### **Firebase** (`firebase: ^10.14.1`)
**¿Qué hace?** Base de datos en la nube de Google.
**¿Por qué la usamos?** Para guardar productos, ventas, clientes sin necesidad de un servidor propio.

#### **React Router** (`react-router-dom: ^6.20.1`)
**¿Qué hace?** Maneja la navegación entre páginas.
**¿Por qué la usamos?** Para que `/sales` muestre la página de ventas, `/products` muestre productos, etc.

#### **Tailwind CSS** (`tailwindcss: ^3.3.6`)
**¿Qué hace?** Framework de estilos CSS.
**¿Por qué la usamos?** Para hacer la app bonita sin escribir mucho CSS.

#### **JsBarcode** (`jsbarcode: ^3.12.1`)
**¿Qué hace?** Genera códigos de barras.
**¿Por qué la usamos?** Para imprimir etiquetas de productos.

#### **Vite** (`vite: ^5.0.8`)
**¿Qué hace?** Herramienta de desarrollo.
**¿Por qué la usamos?** Para ejecutar la app en desarrollo y crear la versión final.

---

## 🔍 Archivos de Configuración

### `package.json`
**¿Qué hace?** Lista todas las librerías que usa tu proyecto.
**¿Cuándo lo tocas?** Cuando quieres agregar una nueva librería.

### `vite.config.js`
**¿Qué hace?** Configura el servidor de desarrollo.
**¿Cuándo lo tocas?** Raramente, solo para configuraciones avanzadas.

### `tailwind.config.js`
**¿Qué hace?** Configura los estilos de Tailwind.
**¿Cuándo lo tocas?** Para personalizar colores, fuentes, etc.

### `firebase.json`
**¿Qué hace?** Configura Firebase.
**¿Cuándo lo tocas?** Para cambiar reglas de la base de datos.

---

## 🎯 Para Principiantes: ¿Por Dónde Empezar?

### 1. **Primero entiende el flujo:**
1. Usuario abre la app → `main.jsx`
2. Se carga → `App.jsx`
3. Se muestra una página → `pages/`
4. La página usa componentes → `components/`
5. Los componentes usan hooks → `hooks/`
6. Los hooks usan services → `services/`
7. Los services hablan con Firebase

### 2. **Archivos más importantes para entender:**
1. `src/App.jsx` - Rutas de la app
2. `src/pages/Sales.jsx` - Página principal de ventas
3. `src/services/firebase.js` - Conexión con la base de datos
4. `src/hooks/useSales.js` - Lógica de ventas

### 3. **Si quieres hacer cambios simples:**
- **Cambiar textos:** Busca en `src/utils/constants.js`
- **Cambiar estilos:** Modifica las clases de Tailwind en los componentes
- **Agregar una página:** Crea un archivo en `src/pages/` y agrégalo a `App.jsx`

### 4. **Si quieres hacer cambios complejos:**
- **Nueva funcionalidad:** Empieza por crear un hook en `src/hooks/`
- **Nueva página:** Crea el archivo en `src/pages/` y sus componentes en `src/components/`
- **Nuevos datos:** Modifica los services en `src/services/`

---

## 🚨 Archivos que NO debes tocar (por ahora)

- `src/main.jsx` - Punto de entrada
- `vite.config.js` - Configuración del servidor
- `package-lock.json` - Versiones exactas de dependencias
- `.firebaserc` - Configuración de Firebase
- `firestore.rules` - Reglas de seguridad

---

## 💡 Consejos para Principiantes

1. **Empieza por los componentes simples** en `src/components/common/`
2. **Lee los comentarios** en el código, explican qué hace cada función
3. **Usa las herramientas de desarrollo** del navegador (F12)
4. **Haz cambios pequeños** y prueba que funcionen antes de hacer más
5. **No tengas miedo de romper algo**, siempre puedes volver atrás con Git

---

## 📚 Próximos Pasos

1. Lee el **Manual de Flujo de Datos** para entender cómo se mueven los datos
2. Revisa el **Manual de Archivos Residuales** para limpiar código
3. Consulta la **Guía de Mejoras Futuras** para saber qué agregar

¡Recuerda: todos empezamos siendo principiantes! 🚀
