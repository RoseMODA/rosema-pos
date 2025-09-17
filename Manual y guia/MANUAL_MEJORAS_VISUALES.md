# 🎨 Manual de Mejoras Visuales - Rosema POS

## 🎯 Problemas Visuales Identificados

Basándome en tu feedback, estos son los problemas principales que necesitas resolver:

### 🚨 **Problemas Críticos:**
1. **Emojis inconsistentes** - No se ven igual en todos los dispositivos
2. **Falta de responsividad** - No se adapta a diferentes pantallas
3. **Iconografía poco profesional** - Emojis en lugar de iconos SVG
4. **Layout rígido** - No funciona bien en móviles/tablets

---

## 🔧 1. REEMPLAZAR EMOJIS POR ICONOS SVG

### 🎯 **¿Por qué cambiar los emojis?**
- Los emojis se ven diferentes en cada sistema operativo
- No son escalables ni personalizables
- Pueden no mostrarse en algunos dispositivos
- No son profesionales para un sistema POS

### 📦 **Instalar Librería de Iconos**
```bash
# Instalar Lucide React (iconos SVG modernos)
npm install lucide-react
```

### 🔄 **Mapeo de Emojis a Iconos**

#### **Crear archivo de mapeo:**
```javascript
// src/utils/iconMapping.js
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Settings,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  Printer,
  Download,
  Upload,
  Check,
  X,
  AlertTriangle,
  Info,
  DollarSign,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  Heart,
  Bookmark,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Save,
  Copy,
  Share,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Menu,
  MoreVertical,
  Bell,
  User,
  LogOut,
  LogIn,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
  Database,
  Server,
  Cloud,
  CloudOff
} from 'lucide-react';

export const iconMap = {
  // Navegación
  '🏠': Home,
  '🛒': ShoppingCart,
  '📦': Package,
  '👥': Users,
  '📊': TrendingUp,
  '⚙️': Settings,
  
  // Acciones
  '🔍': Search,
  '➕': Plus,
  '➖': Minus,
  '✏️': Edit,
  '🗑️': Trash2,
  '👁️': Eye,
  '🖨️': Printer,
  '📥': Download,
  '📤': Upload,
  '✅': Check,
  '❌': X,
  
  // Estados
  '⚠️': AlertTriangle,
  'ℹ️': Info,
  '💰': DollarSign,
  '📅': Calendar,
  '🕒': Clock,
  
  // Contacto
  '📞': Phone,
  '✉️': Mail,
  '📍': MapPin,
  
  // Otros
  '⭐': Star,
  '❤️': Heart,
  '🔖': Bookmark,
  '🔄': RefreshCw,
  '💾': Save,
  '📋': Copy,
  '🔗': Share,
  '🌐': ExternalLink,
  
  // Navegación
  '◀️': ChevronLeft,
  '▶️': ChevronRight,
  '🔼': ChevronUp,
  '🔽': ChevronDown,
  '☰': Menu,
  '⋮': MoreVertical,
  
  // Sistema
  '🔔': Bell,
  '👤': User,
  '🚪': LogOut,
  '🔑': LogIn,
  '🔒': Lock,
  '🔓': Unlock,
  '📶': Wifi,
  '📵': WifiOff,
  '🗄️': Database,
  '🖥️': Server,
  '☁️': Cloud,
  '⛅': CloudOff
};

// Componente Icon reutilizable
export const Icon = ({ name, size = 20, color = 'currentColor', className = '' }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icono no encontrado: ${name}`);
    return <span>{name}</span>; // Fallback al emoji original
  }
  
  return <IconComponent size={size} color={color} className={className} />;
};
```

### 🔄 **Reemplazar Emojis en Componentes**

#### **Ejemplo: Actualizar Sidebar.jsx**
```javascript
// ANTES (con emojis):
const menuItems = [
  { path: '/', label: 'Inicio', icon: '🏠' },
  { path: '/sales', label: 'Ventas', icon: '🛒' },
  { path: '/products', label: 'Productos', icon: '📦' },
  { path: '/customers', label: 'Clientes', icon: '👥' },
];

// DESPUÉS (con iconos SVG):
import { Icon } from '../utils/iconMapping';

const menuItems = [
  { path: '/', label: 'Inicio', icon: '🏠' },
  { path: '/sales', label: 'Ventas', icon: '🛒' },
  { path: '/products', label: 'Productos', icon: '📦' },
  { path: '/customers', label: 'Clientes', icon: '👥' },
];

// En el JSX:
{menuItems.map((item) => (
  <NavLink key={item.path} to={item.path}>
    <Icon name={item.icon} size={20} className="mr-3" />
    {item.label}
  </NavLink>
))}
```

#### **Ejemplo: Actualizar Home.jsx**
```javascript
// ANTES:
<div className="text-3xl mb-4">📊</div>

// DESPUÉS:
import { Icon } from '../utils/iconMapping';
<Icon name="📊" size={48} className="mb-4 text-red-600" />
```

---

## 📱 2. HACER EL DISEÑO COMPLETAMENTE RESPONSIVO

### 🎯 **Estrategia de Responsividad**

#### **Breakpoints Personalizados:**
```javascript
// tailwind.config.js - ACTUALIZAR
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '475px',      // Móviles grandes
        'sm': '640px',      // Tablets pequeñas
        'md': '768px',      // Tablets
        'lg': '1024px',     // Laptops
        'xl': '1280px',     // Desktops
        '2xl': '1536px',    // Pantallas grandes
        
        // Breakpoints personalizados para POS
        'mobile': '320px',  // Móviles pequeños
        'tablet': '768px',  // Tablets
        'desktop': '1024px' // Desktop
      },
      
      // Espaciado responsivo
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      }
    }
  }
}
```

### 🏗️ **Layout Responsivo Principal**

#### **Actualizar Layout.jsx:**
```javascript
// src/components/Layout.jsx - REEMPLAZAR CONTENIDO
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import { Icon } from '../utils/iconMapping';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Solo visible en móviles */}
      <div className="lg:hidden">
        <MobileHeader 
          onMenuClick={() => setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex">
        {/* Sidebar Desktop - Oculto en móviles */}
        <div className="hidden lg:block lg:w-64 lg:fixed lg:h-full lg:z-30">
          <Sidebar />
        </div>

        {/* Sidebar Mobile - Overlay en móviles */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Rosema POS</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <Icon name="❌" size={20} />
                </button>
              </div>
              <Sidebar onItemClick={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <main className="flex-1 lg:ml-64">
          {/* Espaciado para header móvil */}
          <div className="pt-16 lg:pt-0 px-4 lg:px-6 py-4 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
```

#### **Crear MobileHeader.jsx:**
```javascript
// src/components/MobileHeader.jsx - CREAR NUEVO ARCHIVO
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon } from '../utils/iconMapping';

const MobileHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Botón menú */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Icon name="☰" size={24} />
        </button>

        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/rosemalognegro.png" 
            alt="Rosema" 
            className="h-8 w-auto"
          />
        </div>

        {/* Usuario */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 hidden xs:block">
            {user?.email?.split('@')[0]}
          </span>
          <button
            onClick={logout}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Icon name="🚪" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
```

### 📊 **Hacer Tablas Responsivas**

#### **Actualizar ProductsTable.jsx:**
```javascript
// src/components/Products/ProductsTable.jsx - AGREGAR AL FINAL
// Vista de tarjetas para móviles
const MobileProductCard = ({ product, onView, onEdit, onDelete, onPrintBarcode }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-sm">
          {product.articulo}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          ID: {product.id}
        </p>
      </div>
      
      {/* Imagen del producto */}
      {product.imagenes && product.imagenes[0] && (
        <img
          src={product.imagenes[0]}
          alt={product.articulo}
          className="w-12 h-12 object-cover rounded ml-3"
        />
      )}
    </div>

    {/* Información principal */}
    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
      <div>
        <span className="text-gray-500">Stock:</span>
        <span className={`ml-1 font-medium ${
          product.stock <= 5 ? 'text-red-600' : 'text-green-600'
        }`}>
          {product.stock}
        </span>
      </div>
      <div>
        <span className="text-gray-500">Precio:</span>
        <span className="ml-1 font-medium text-green-600">
          ${product.precioCosto?.toLocaleString()}
        </span>
      </div>
    </div>

    {/* Categoría y proveedor */}
    <div className="flex flex-wrap gap-2 mb-3">
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
        {product.categoria}
      </span>
      {product.providerName && (
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
          {product.providerName}
        </span>
      )}
    </div>

    {/* Botones de acción */}
    <div className="flex space-x-2">
      <button
        onClick={() => onView(product)}
        className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded text-xs font-medium hover:bg-blue-100"
      >
        <Icon name="👁️" size={14} className="inline mr-1" />
        Ver
      </button>
      <button
        onClick={() => onEdit(product)}
        className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded text-xs font-medium hover:bg-green-100"
      >
        <Icon name="✏️" size={14} className="inline mr-1" />
        Editar
      </button>
      <button
        onClick={() => onPrintBarcode(product)}
        className="flex-1 bg-purple-50 text-purple-600 py-2 px-3 rounded text-xs font-medium hover:bg-purple-100"
      >
        <Icon name="🖨️" size={14} className="inline mr-1" />
        Código
      </button>
    </div>
  </div>
);

// En el componente principal, AGREGAR después de la tabla:
return (
  <div>
    {/* Tabla Desktop - Oculta en móviles */}
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full bg-white">
        {/* Contenido existente de la tabla */}
      </table>
    </div>

    {/* Vista de tarjetas Mobile - Solo visible en móviles */}
    <div className="md:hidden">
      {products.map((product) => (
        <MobileProductCard
          key={product.id}
          product={product}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onPrintBarcode={onPrintBarcode}
        />
      ))}
    </div>
  </div>
);
```

### 🛒 **Sistema de Ventas Responsivo**

#### **Actualizar Sales.jsx para móviles:**
```javascript
// src/pages/Sales.jsx - MODIFICAR el layout principal
return (
  <div className="min-h-screen bg-gray-50 p-2 lg:p-6">
    {/* Header responsivo */}
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 lg:mb-6 space-y-3 lg:space-y-0">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
          Gestión de Ventas
        </h1>
        <p className="text-sm lg:text-base text-gray-600 hidden sm:block">
          Busca productos y agrégalos al carrito
        </p>
      </div>

      {/* Botones responsivos */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <button
          onClick={handleNewSale}
          className="btn-rosema flex items-center justify-center space-x-2 text-sm lg:text-base"
        >
          <Icon name="➕" size={16} />
          <span>Nueva Venta</span>
        </button>

        <button
          onClick={() => openModal('history')}
          className="btn-secondary flex items-center justify-center space-x-2 text-sm lg:text-base"
        >
          <Icon name="🕒" size={16} />
          <span className="hidden sm:inline">Historial</span>
          <span className="sm:hidden">Historial</span>
        </button>
      </div>
    </div>

    {/* Tabs de sesiones - Scroll horizontal en móviles */}
    <div className="mb-4 lg:mb-6">
      <SessionTabs
        sessions={pendingSales}
        activeSessionId={activeSessionId}
        onSessionChange={switchSession}
        onDeleteSession={cancelSession}
        onNewSession={handleNewSale}
      />
    </div>

    {/* Layout responsivo - Stack en móviles, columnas en desktop */}
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6">
      {/* Sección de búsqueda y pago */}
      <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
        <ProductSearch
          searchTerm={searchTerm}
          searchResults={searchResults}
          showResults={showResults}
          productsLoading={productsLoading}
          productStats={productStats}
          onSearch={handleSearch}
          onProductSelect={handleProductSearchSelect}
          onCreateSampleData={handleCreateSampleData}
          onQuickItemClick={() => openModal('quickItem')}
        />

        {/* Formulario de pago - Colapsible en móviles */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Icon name="💳" size={20} className="mr-2" />
              Información de Pago
            </h3>

            <PaymentForm
              paymentMethod={paymentMethod}
              discountPercent={discountPercent}
              cashReceived={cashReceived}
              cardName={cardName}
              installments={installments}
              commission={commission}
              totals={totals}
              onPaymentMethodChange={setPaymentMethod}
              onDiscountChange={setDiscountPercent}
              onCashReceivedChange={setCashReceived}
              onCardNameChange={setCardName}
              onInstallmentsChange={setInstallments}
              onCommissionChange={setCommission}
            />

            {/* Botones de acción responsivos */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 btn-secondary flex items-center justify-center space-x-2 text-sm lg:text-base"
              >
                <Icon name="🖨️" size={16} />
                <span>Recibo</span>
              </button>

              <button
                onClick={handleProcessSale}
                disabled={salesLoading || cart.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 text-sm lg:text-base"
              >
                <Icon name="💰" size={16} />
                <span>{salesLoading ? "Procesando..." : "Procesar Venta"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carrito - Sticky en móviles */}
      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-6">
          <SalesCart
            cart={cart}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            onUpdateQuantity={updateCartItemQuantity}
            onRemoveItem={removeFromCart}
            onEditPrice={(item) => openModal("editPrice", item)}
          />
        </div>
      </div>
    </div>

    {/* Modales existentes... */}
  </div>
);
```

---

## 🎨 3. SISTEMA DE ICONOS CONSISTENTE

### 📦 **Crear Componente de Iconos Personalizado**

```javascript
// src/components/common/IconButton.jsx - CREAR NUEVO ARCHIVO
import React from 'react';
import { Icon } from '../../utils/iconMapping';

const IconButton = ({ 
  icon, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  children,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-lg'
  };
  
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && (
        <Icon 
          name={icon} 
          size={iconSizes[size]} 
          className={children ? 'mr-2' : ''} 
        />
      )}
      {children}
    </button>
  );
};

export default IconButton;
```

### 🎯 **Usar IconButton en toda la app:**

```javascript
// Ejemplo de uso:
import IconButton from '../components/common/IconButton';

// Botón con icono y texto
<IconButton icon="➕" variant="primary" onClick={handleAdd}>
  Agregar Producto
</IconButton>

// Botón solo con icono
<IconButton icon="✏️" variant="ghost" size="sm" onClick={handleEdit} />

// Botón de peligro
<IconButton icon="🗑️" variant="danger" onClick={handleDelete}>
  Eliminar
</IconButton>
```

---

## 📱 4. OPTIMIZACIONES MÓVILES ESPECÍFICAS

### 🔧 **Meta Tags para Móviles:**

```html
<!-- index.html - AGREGAR en <head> -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#dc2626">

<!-- Prevenir zoom en inputs -->
<style>
  input[type="text"], input[type="number"], input[type="email"], input[type="password"], select, textarea {
    font-size: 16px !important;
  }
</style>
```

### 📱 **Gestos Táctiles:**

```javascript
// src/hooks/useSwipeGesture.js - CREAR NUEVO ARCHIVO
import { useState, useEffect } from 'react';

export const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};
```

### 🎨 **Estilos Táctiles:**

```css
/* src/style.css - AGREGAR */

/* Mejoras táctiles */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Feedback táctil */
.btn-touch {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
}

.btn-touch:active {
  transform: scale(0.98);
  transition: transform 0.1s;
}

/* Scroll suave en móviles */
.scroll-smooth {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Ocultar scrollbars en móviles */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Safe areas para dispositivos con notch */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Inputs más grandes en móviles */
@media (max-width: 768px) {
  input, select, textarea {
    min-height: 44px;
    font-size: 16px; /* Previene zoom en iOS */
  }
  
  button {
    min-height: 44px;
  }
}
```

---

## 🎯 5. LISTA DE ARCHIVOS A ACTUALIZAR

### 🔥 **Prioridad Alta (Hacer Primero):**

1. **Instalar iconos:** `npm install lucide-react`
2. **Crear iconMapping.js** con el mapeo completo
3. **Actualizar Layout.jsx** para responsividad
4. **Crear MobileHeader.jsx**
5. **Actualizar Sidebar.jsx** con iconos
6. **Actualizar tailwind.config.js** con breakpoints

### 🚀 **Prioridad Media:**

7. **Actualizar ProductsTable.jsx** con vista móvil
8. **Actualizar Sales.jsx** con layout responsivo
9. **Crear IconButton.jsx** componente
10. **Actualizar index.html** con meta tags móviles

### 💡 **Prioridad Baja:**

11. **Crear useSwipeGesture.js** hook
12. **Actualizar style.css** con estilos táctiles
13. **Actualizar todos los componentes** con iconos
14. **Testing en diferentes dispositivos**

---

## 🧪 6. TESTING RESPONSIVO

### 📱 **Dispositivos a Probar:**

```javascript
// Breakpoints de prueba
const testBreakpoints = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop', width: 1920, height: 1080 }
];
```

### 🔧 **Herramientas de Testing:**

1. **Chrome DevTools** - Device simulation
2. **Firefox Responsive Design Mode
