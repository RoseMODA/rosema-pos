# 📄 Manual Detallado de Páginas - Rosema POS

## 🎯 ¿Qué es este Manual?

Este manual explica **archivo por archivo** cada página en `src/pages/`, mostrando:
- Qué hace exactamente cada página
- Qué componentes usa y de dónde vienen
- Qué hooks utiliza y para qué
- Cómo se conecta con Firebase
- Ejemplos de código específicos

---

## 🏠 Home.jsx - Página Principal (Dashboard)

### 📍 **Ubicación:** `src/pages/Home.jsx`

### 🎯 **¿Qué hace?**
Es la página principal que ve el usuario al iniciar sesión. Funciona como un dashboard con:
- Resumen de estadísticas
- Botones de acceso rápido
- Estado del sistema
- Información de la tienda

### 🔧 **Hooks que usa:**
```javascript
import { useAuth } from '../hooks/useAuth';
```
- **useAuth:** Para obtener información del usuario logueado

### 🧩 **Componentes que importa:**
```javascript
import { Link } from 'react-router-dom';           // Para navegación
import FirestoreDebug from '../components/FirestoreDebug';  // Debug de Firebase
```

### 🔥 **Conexión con Firebase:**
- **Indirecta:** A través del componente `FirestoreDebug`
- **No hace llamadas directas** a Firebase

### 📊 **Funciones principales:**
```javascript
const getCurrentDate = () => {
  // Formatea la fecha actual en español
  const today = new Date();
  return today.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  });
};
```

### 🎨 **Secciones de la página:**
1. **Header:** Título, fecha y usuario
2. **Botones de acción rápida:** Ventas y Productos
3. **Estadísticas:** Cards con métricas (actualmente en $0)
4. **Estado del sistema:** Progreso de implementación
5. **Información de la tienda:** Datos de Rosema
6. **Accesos rápidos:** Links a otras secciones
7. **Componente de debug:** Para desarrollo

### 💡 **Para principiantes:**
- Es una página **estática** (no maneja estado complejo)
- Principalmente **navegacional** (enlaces a otras páginas)
- Usa **Tailwind CSS** para estilos
- Las estadísticas están **hardcodeadas** (podrías conectarlas a Firebase)

---

## 🛒 Sales.jsx - Sistema de Ventas

### 📍 **Ubicación:** `src/pages/Sales.jsx`

### 🎯 **¿Qué hace?**
Es la página más compleja del sistema. Permite:
- Buscar productos por código de barras o nombre
- Agregar productos al carrito con variantes (talla/color)
- Manejar múltiples sesiones de venta
- Procesar pagos con diferentes métodos
- Imprimir recibos
- Hacer cambios de productos

### 🔧 **Hooks que usa:**
```javascript
import { useProducts } from '../hooks/useProducts';        // Gestión de productos
import { useSales } from '../hooks/useSales';              // Lógica de ventas
import { useProductSearch } from '../hooks/useProductSearch'; // Búsqueda
import { useModals } from '../hooks/useModal';             // Modales
```

### 🧩 **Componentes que importa:**
```javascript
// Modales
import EditPriceModal from "../components/Sales/EditPriceModal";
import QuickItemModal from '../components/QuickItemModal';
import SalesHistoryModal from '../components/SalesHistoryModal';
import ReturnModal from '../components/ReturnModal';
import PrintReceiptModal from '../components/PrintReceiptModal';
import ProductSelectionModal from '../components/ProductSelectionModal';

// Componentes principales
import ProductSearch from '../components/Sales/ProductSearch';
import SessionTabs from '../components/Sales/SessionTabs';
import PaymentForm from '../components/Sales/PaymentForm';
import SalesCart from '../components/Sales/SalesCart';
```

### 🔥 **Conexión con Firebase:**
- **Directa:** A través de los hooks `useProducts` y `useSales`
- **Operaciones:**
  - Buscar productos en colección `articulos`
  - Guardar ventas en colección `ventas`
  - Actualizar stock de productos
  - Actualizar estadísticas de clientes

### 📊 **Funciones principales:**

#### **Manejo de Productos:**
```javascript
function handleProductSelection(product, quantity = 1, variant = null, needsModal = false) {
  if (needsModal) {
    openModal('productSelection', product);  // Si tiene múltiples variantes
  } else {
    addToCart(product, quantity, variant);   // Si tiene una sola variante
  }
}
```

#### **Procesamiento de Ventas:**
```javascript
const handleProcessSale = async () => {
  // 1. Validar que hay productos en el carrito
  const validation = validateSaleBeforeProcessing(cart, totals);
  
  // 2. Confirmar con el usuario
  const confirmMessage = generateSaleConfirmationMessage(totals, paymentMethod, discountPercent);
  
  // 3. Procesar la venta en Firebase
  const sale = await finalizeSession(activeSessionId);
};
```

#### **Gestión de Sesiones:**
```javascript
const handleNewSale = () => {
  const sessionCount = Object.keys(sessions).length;
  const newSessionId = createSession(`Cliente ${sessionCount + 1}`);
};
```

### 🎨 **Layout de la página:**
```
┌─────────────────────────────────────────────────────────┐
│ Header: Título + Botones (Nueva Venta, Historial)      │
├─────────────────────────────────────────────────────────┤
│ SessionTabs: Pestañas de sesiones múltiples            │
├─────────────────┬───────────────────────────────────────┤
│ COLUMNA IZQ     │ COLUMNA DERECHA                       │
│ - ProductSearch │ - SalesCart                           │
│ - Botón Cambios │ - Lista de productos                  │
│ - PaymentForm   │ - Totales                             │
│ - Botones       │ - Info del cliente                    │
└─────────────────┴───────────────────────────────────────┘
```

### 💡 **Para principiantes:**
- Es la página **más compleja** del sistema
- Maneja **múltiples estados** (carrito, sesiones, modales)
- Usa **muchos hooks personalizados**
- Tiene **lógica de negocio compleja** (cálculos, validaciones)
- **Interactúa intensivamente** con Firebase

---

## 📦 Products.jsx - Gestión de Productos

### 📍 **Ubicación:** `src/pages/Products.jsx`

### 🎯 **¿Qué hace?**
Página para gestionar el inventario completo:
- Ver lista de todos los productos
- Crear nuevos productos con variantes
- Editar productos existentes
- Eliminar productos
- Filtrar y buscar productos
- Ver estadísticas del inventario
- Imprimir códigos de barras

### 🔧 **Hooks que usa:**
```javascript
import { useProducts } from '../hooks/useProducts';           // CRUD de productos
import { useProviders } from '../hooks/useProviders';        // Lista de proveedores
import { useProductFilters } from '../hooks/useProductFilters'; // Filtros y búsqueda
import { useModals } from '../hooks/useModal';               // Gestión de modales
```

### 🧩 **Componentes que importa:**
```javascript
// Formularios y modales
import ProductForm from '../components/ProductForm';
import BarcodeModal from '../components/BarcodeModal';
import ProductDetailsModal from '../components/Products/ProductDetailsModal';

// Componentes específicos de productos
import ProductsStats from '../components/Products/ProductsStats';
import ProductsFilters from '../components/Products/ProductsFilters';
import ProductsTable from '../components/Products/ProductsTable';

// Componentes comunes
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
```

### 🔥 **Conexión con Firebase:**
- **Directa:** A través de `useProducts` y `useProviders`
- **Operaciones:**
  - Leer productos de colección `articulos`
  - Crear/actualizar/eliminar productos
  - Subir imágenes a Firebase Storage
  - Leer proveedores de colección `proveedores`

### 📊 **Funciones principales:**

#### **CRUD de Productos:**
```javascript
const handleCreateProduct = () => {
  openModal('productForm', { mode: 'create', product: null });
};

const handleEditProduct = (product) => {
  openModal('productForm', { mode: 'edit', product });
};

const handleFormSubmit = async (productData) => {
  const modalData = getModalData('productForm');
  
  if (modalData.mode === 'create') {
    const createdProduct = await addProduct(productData);
    // Preguntar si quiere imprimir código de barras
    if (confirm('¿Deseas imprimir el código de barras?')) {
      openModal('barcodePrint', createdProduct);
    }
  } else {
    await updateProductData(modalData.product.id, productData);
  }
};
```

#### **Gestión de Estadísticas:**
```javascript
// Calcula estadísticas del inventario
const stats = calculateProductStats(products);
// Retorna: totalProducts, totalStock, lowStockProducts, etc.
```

### 🎨 **Estructura de la página:**
```
┌─────────────────────────────────────────────────────────┐
│ Header: Título + Botón "Agregar Producto"              │
├─────────────────────────────────────────────────────────┤
│ ProductsStats: Cards con estadísticas del inventario   │
├─────────────────────────────────────────────────────────┤
│ ProductsFilters: Búsqueda, filtros, ordenamiento       │
├─────────────────────────────────────────────────────────┤
│ ProductsTable: Tabla con todos los productos           │
│ - Imagen, nombre, stock, precio, acciones              │
│ - Botones: Ver, Editar, Eliminar, Código de barras     │
└─────────────────────────────────────────────────────────┘
```

### 💡 **Para principiantes:**
- Usa **muchos componentes especializados**
- Implementa **patrón CRUD completo**
- Maneja **subida de archivos** (imágenes)
- Usa **filtros complejos** con múltiples criterios
- **Calcula estadísticas** en tiempo real

---

## 🔐 Login.jsx - Autenticación

### 📍 **Ubicación:** `src/pages/Login.jsx`

### 🎯 **¿Qué hace?**
Página de inicio de sesión del sistema:
- Formulario de email y contraseña
- Validación de credenciales con Firebase Auth
- Redirección automática si ya está logueado
- Manejo de errores de autenticación

### 🔧 **Hooks que usa:**
```javascript
import { useAuth } from '../hooks/useAuth';    // Autenticación
import { Navigate } from 'react-router-dom';   // Redirección
```

### 🔥 **Conexión con Firebase:**
- **Directa:** A través de `useAuth` hook
- **Operaciones:**
  - `signInWithEmailAndPassword()` para login
  - `onAuthStateChanged()` para verificar estado

### 📊 **Funciones principales:**

#### **Manejo del Formulario:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validaciones básicas
  if (!email || !password) return;
  
  setIsSubmitting(true);
  
  try {
    await login(email, password);  // Llama a Firebase Auth
    // El redirect se maneja automáticamente
  } catch (error) {
    // Error se muestra automáticamente por useAuth
  } finally {
    setIsSubmitting(false);
  }
};
```

#### **Redirección Automática:**
```javascript
// Si ya está logueado, redirigir al dashboard
if (isAuthenticated) {
  return <Navigate to="/" replace />;
}
```

### 🎨 **Diseño de la página:**
```
┌─────────────────────────────────────────────────────────┐
│                    Logo Rosema                          │
│                 "Sistema de Punto de Venta"            │
├─────────────────────────────────────────────────────────┤
│ Formulario:                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Email: [________________]                           │ │
│ │ Contraseña: [________________]                      │ │
│ │ [Mensaje de error si existe]                        │ │
│ │ [Botón: Iniciar Sesión]                            │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Info: Rosema - Salto de las Rosas - WhatsApp           │
└─────────────────────────────────────────────────────────┘
```

### 💡 **Para principiantes:**
- Página **simple** con un solo propósito
- Usa **formulario controlado** (useState)
- Maneja **estados de carga** y errores
- Implementa **redirección condicional**
- **No almacena credenciales** (seguridad)

---

## 👥 Customers.jsx - Gestión de Clientes

### 📍 **Ubicación:** `src/pages/Customers.jsx`

### 🎯 **¿Qué hace?**
Sistema CRM completo para gestionar clientes:
- Lista de todos los clientes con estadísticas
- Búsqueda por nombre, teléfono, email o tags
- Crear y editar clientes
- Ver historial de compras de cada cliente
- Análisis de preferencias y comportamiento
- Top clientes más frecuentes

### 🔧 **Hooks que usa:**
```javascript
import { useCustomers } from '../hooks/useCustomers';  // CRUD y análisis de clientes
```

### 🧩 **Componentes que importa:**
```javascript
import CustomerForm from '../components/CustomerForm';       // Formulario crear/editar
import CustomerDetails from '../components/CustomerDetails'; // Modal de detalles
```

### 🔥 **Conexión con Firebase:**
- **Directa:** A través de `useCustomers`
- **Operaciones:**
  - Leer clientes de colección `clientes`
  - Crear/actualizar/eliminar clientes
  - Obtener historial de compras de colección `ventas`
  - Calcular estadísticas y análisis

### 📊 **Funciones principales:**

#### **Búsqueda de Clientes:**
```javascript
const handleSearch = async (term) => {
  setSearchTerm(term);
  if (term.trim()) {
    await searchCustomersByTerm(term);  // Busca en Firebase
    setShowResults(true);
  } else {
    await loadCustomers();  // Carga todos
    setShowResults(false);
  }
};
```

#### **Ordenamiento Dinámico:**
```javascript
const getSortedCustomers = () => {
  const customersCopy = [...customers];
  
  switch (sortBy) {
    case 'name':
      return customersCopy.sort((a, b) => a.nombre.localeCompare(b.nombre));
    case 'purchases':
      return customersCopy.sort((a, b) => (b.totalCompras || 0) - (a.totalCompras || 0));
    case 'spending':
      return customersCopy.sort((a, b) => (b.montoTotalGastado || 0) - (a.montoTotalGastado || 0));
    case 'recent':
    default:
      return customersCopy.sort((a, b) => {
        // Ordenar por fecha de última compra
      });
  }
};
```

#### **Gestión de Estadísticas:**
```javascript
// Obtiene estadísticas calculadas localmente
const stats = getCustomerStatsLocal();
// Retorna: totalCustomers, activeCustomers, newCustomers, averageSpending

// Carga top clientes desde Firebase
const loadTopCustomers = async () => {
  const top = await getTopCustomersData(5);
  setTopCustomers(top);
};
```

### 🎨 **Layout de la página:**
```
┌─────────────────────────────────────────────────────────┐
│ Header + Barra de búsqueda                              │
├─────────────────────────────────────────────────────────┤
│ Botones: [Agregar Cliente] [Ordenar por: ▼]            │
├─────────────────────────────────────────────────────────┤
│ Stats: [Total] [Activos] [Nuevos] [Gasto Promedio]     │
├─────────────────┬───────────────────────────────────────┤
│ LISTA CLIENTES  │ PANEL LATERAL                         │
│ ┌─────────────┐ │ ┌─────────────────────────────────────┐ │
│ │ Cliente 1   │ │ │ TOP CLIENTES                        │ │
│ │ 📞 teléfono │ │ │ 1. Juan - 5 compras - $15,000      │ │
│ │ Tags        │ │ │ 2. María - 3 compras - $8,500       │ │
│ │ [Ver][Edit] │ │ │ ...                                 │ │
│ └─────────────┘ │ └─────────────────────────────────────┘ │
│ ┌─────────────┐ │ ┌─────────────────────────────────────┐ │
│ │ Cliente 2   │ │ │ RESUMEN INGRESOS                    │ │
│ │ ...         │ │ │ Total facturado: $50,000            │ │
│ └─────────────┘ │ │ Promedio por cliente: $2,500        │ │
└─────────────────┴─┴─────────────────────────────────────┘
```

### 💡 **Para principiantes:**
- Implementa **sistema CRM completo**
- Usa **búsqueda en tiempo real**
- Maneja **ordenamiento dinámico**
- Calcula **estadísticas complejas**
- **Layout de dos columnas** (lista + panel lateral)

---

## 🏪 Suppliers.jsx - Gestión de Proveedores

### 📍 **Ubicación:** `src/pages/Suppliers.jsx`

### 🎯 **¿Qué hace?**
Gestiona la información de proveedores:
- Lista de proveedores
- Crear y editar proveedores
- Ver detalles y estadísticas de cada proveedor

### 🔧 **Hooks que usa:**
```javascript
import { useProviders } from '../hooks/useProviders';  // CRUD de proveedores
```

### 🧩 **Componentes que importa:**
```javascript
import ProviderForm from '../components/ProviderForm';       // Formulario
import ProviderDetails from '../components/ProviderDetails'; // Detalles
```

### 🔥 **Conexión con Firebase:**
- **Directa:** A través de `useProviders`
- **Operaciones:**
  - Leer proveedores de colección `proveedores`
  - Crear/actualizar/eliminar proveedores
  - Calcular estadísticas de productos por proveedor

### 💡 **Para principiantes:**
- Similar a **Customers.jsx** pero más simple
- Buen ejemplo para **entender patrones CRUD**
- Menos funcionalidades que clientes

---

## 📊 Statistics.jsx - Estadísticas (Página Simple)

### 📍 **Ubicación:** `src/pages/Statistics.jsx`

### 🎯 **¿Qué hace?**
Página básica que actualmente solo muestra un mensaje. Está preparada para mostrar estadísticas del negocio.

### 🔧 **Hooks que usa:**
```javascript
import React from 'react';  // Solo React básico
```

### 🔥 **Conexión con Firebase:**
- **Ninguna** actualmente

### 📊 **Contenido actual:**
```javascript
const Statistics = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Estadísticas</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">
          Página de estadísticas en desarrollo...
        </p>
      </div>
    </div>
  );
};
```

### 💡 **Para principiantes:**
- Página **placeholder** (marcador de posición)
- **Fácil de expandir** agregando hooks y componentes
- Lugar ideal para **practicar** agregando funcionalidades

---

## 🎯 Goals.jsx - Metas (Página Simple)

### 📍 **Ubicación:** `src/pages/Goals.jsx`

### 🎯 **¿Qué hace?**
Página básica para gestión de metas del negocio. Actualmente en desarrollo.

### 🔧 **Hooks que usa:**
```javascript
import React from 'react';  // Solo React básico
```

### 💡 **Para principiantes:**
- Otra página **placeholder**
- Oportunidad para **agregar funcionalidades**

---

## 🧾 Invoices.jsx - Facturas (Página Simple)

### 📍 **Ubicación:** `src/pages/Invoices.jsx`

### 🎯 **¿Qué hace?**
Página para gestión de facturas. Muestra información sobre funcionalidades planeadas.

### 🔧 **Hooks que usa:**
```javascript
import React from 'react';  // Solo React básico
```

### 📊 **Contenido actual:**
- Lista de funcionalidades planeadas
- Información sobre integración con Firebase Storage
- Placeholder para desarrollo futuro

### 💡 **Para principiantes:**
- Página **informativa**
- Muestra **roadmap** de funcionalidades

---

## 🆕 SalesNew.jsx - Nueva Interfaz de Ventas

### 📍 **Ubicación:** `src/pages/SalesNew.jsx`

### 🎯 **¿Qué hace?**
Versión alternativa del sistema de ventas con interfaz diferente.

### 🔧 **Hooks que usa:**
```javascript
import SalesInterface from '../components/SalesInterface';  // Interfaz alternativa
import SalesHistory from '../components/SalesHistory';      // Historial
```

### 💡 **Para principiantes:**
- **Versión experimental** del sistema de ventas
- Usa componentes diferentes a `Sales.jsx`
- Permite **comparar enfoques** diferentes

---

## 🔗 Conexiones Entre Páginas

### **Flujo de Navegación:**
```
Login.jsx → Home.jsx → [Cualquier página]
    ↓         ↓
    ↓    ┌─→ Sales.jsx
    ↓    ├─→ Products.jsx  
    ↓    ├─→ Customers.jsx
    ↓    ├─→ Suppliers.jsx
    ↓    ├─→ Statistics.jsx
    ↓    ├─→ Goals.jsx
    ↓    └─→ Invoices.jsx
    ↓
    └─→ (Si no está autenticado)
```

### **Dependencias Compartidas:**
- **Todas las páginas** (excepto Login) usan el Layout
- **Sales, Products, Customers** son las más complejas
- **Statistics, Goals, Invoices** son páginas simples
- **Home** es el punto de entrada principal

### **Hooks Más Usados:**
1. `useAuth` - En casi todas las páginas
2. `useProducts` - En Sales y Products
3. `useSales` - Solo en Sales
4. `useCustomers` - Solo en Customers
5. `useModals` - En páginas complejas

---

## 🧩 Componentes Más Usados por las Páginas

### **Componentes de Formularios:**
- `ProductForm` - Usado en Products.jsx
- `CustomerForm` - Usado en Customers.jsx
- `ProviderForm` - Usado en Suppliers.jsx

### **Componentes de Modales:**
- `ProductSelectionModal` - Usado en Sales.jsx
- `PrintReceiptModal` - Usado en Sales.jsx
- `BarcodeModal` - Usado en Products.jsx

### **Componentes de Tablas:**
- `ProductsTable` - Usado en Products.jsx
- Lista personalizada en Customers.jsx
- Lista personalizada en Suppliers.jsx

### **Componentes Comunes:**
- `LoadingSpinner` - Usado en Products.jsx
- `ErrorMessage` - Usado en Products.jsx
- `Modal` - Base para todos los modales

---

## 🔄 Flujo de Datos Entre Páginas

### **Sales.jsx → Firebase:**
```
1. Buscar productos → useProducts → productsService → Firebase
2. Agregar al carrito → useSales → estado local
3. Procesar venta → useSales → salesService → Firebase
4. Actualizar stock → salesService → productsService → Firebase
```

### **Products.jsx → Firebase:**
```
1. Cargar productos → useProducts → productsService → Firebase
2. Crear producto → ProductForm → useProducts → productsService → Firebase
3. Subir imagen → ProductForm → Firebase Storage
4. Calcular stats → useProducts → cálculos locales
```

### **Customers.jsx → Firebase:**
```
1. Cargar clientes → useCustomers → customersService → Firebase
2. Buscar clientes → useCustomers → customersService → Firebase
3. Crear cliente → CustomerForm → useCustomers → customersService → Firebase
4. Obtener historial → useCustomers → salesService → Firebase
```

---

## 💡 Consejos para Principiantes

### **Páginas para Empezar a Estudiar:**
1. **Login.jsx** - Simple, fácil de entender
2. **Home.jsx** - Navegacional, sin lógica compleja
3. **Statistics.jsx** - Placeholder, puedes practicar aquí
4. **Products.jsx** - CRUD completo, buen ejemplo
5. **Sales.jsx** - La más compleja, estudiar al final

### **Patrones Comunes:**
- **useState** para estado local
- **useEffect** para cargar datos
- **Hooks personalizados** para lógica de negocio
- **Componentes modales** para formularios
- **Manejo de errores** con try/catch

### **Cómo Agregar una Nueva Página:**
1. Crear archivo en `src/pages/NuevaPagina.jsx`
2. Agregar ruta en `src/App.jsx`
3. Agregar enlace en `src/components/Sidebar.jsx`
4. Seguir el patrón de páginas existentes

### **Archivos de Apoyo:**
- `src/utils/constants.js` - Constantes y configuración
- `src/utils/formatters.js` - Formateo de datos
- `src/components/common/` - Componentes reutilizables

### **Debugging Tips:**
- Usa `console.log()` para ver qué datos llegan
- Revisa la consola del navegador para errores
- Usa las herramientas de desarrollo de React
- Verifica que Firebase esté conectado correctamente

---

## 🚀 Próximos Pasos

### **Si eres principiante:**
1. **Empieza por Login.jsx** - Es la más simple
2. **Estudia Home.jsx** - Entiende la navegación
3. **Practica en Statistics.jsx** - Agrega funcionalidades
4. **Analiza Products.jsx** - Aprende patrones CRUD
5. **Desafíate con Sales.jsx** - La más compleja

### **Si quieres expandir:**
1. **Conecta Statistics.jsx** a Firebase para mostrar datos reales
2. **Mejora Goals.jsx** agregando funcionalidades de metas
3. **Expande Invoices.jsx** con generación de PDFs
4. **Optimiza Sales.jsx** mejorando la UX
5. **Agrega nuevas páginas** siguiendo los patrones existentes

¡Recuerda: cada página es un componente React que puede usar hooks, importar otros componentes y conectarse a Firebase! 🚀
