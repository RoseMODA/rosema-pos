# 🚀 Guía de Mejoras Futuras - Rosema POS

## 🎯 ¿Cómo Usar Esta Guía?

Esta guía te explica **exactamente dónde tocar código** para agregar nuevas funciones a tu POS. Está pensada para principiantes, con ejemplos específicos y ubicaciones exactas.

---

## 💰 Agregar Sistema de Descuentos

### 🎯 **Objetivo:** Permitir descuentos por porcentaje o monto fijo

### 📍 **Archivos a Modificar:**

#### 1. **Agregar Constantes** (`src/utils/constants.js`)
```javascript
// AGREGAR al final del archivo:
export const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Porcentaje (%)' },
  { value: 'fixed', label: 'Monto Fijo ($)' }
];

export const DISCOUNT_PRESETS = [
  { value: 5, label: '5% OFF', type: 'percentage' },
  { value: 10, label: '10% OFF', type: 'percentage' },
  { value: 15, label: '15% OFF', type: 'percentage' },
  { value: 20, label: '20% OFF', type: 'percentage' },
  { value: 500, label: '$500 OFF', type: 'fixed' },
  { value: 1000, label: '$1000 OFF', type: 'fixed' }
];
```

#### 2. **Actualizar Cálculos** (`src/utils/calculations.js`)
```javascript
// AGREGAR nueva función:
export const calculateDiscount = (subtotal, discountValue, discountType) => {
  if (discountType === 'percentage') {
    return (subtotal * discountValue) / 100;
  } else if (discountType === 'fixed') {
    return Math.min(discountValue, subtotal); // No puede ser mayor al subtotal
  }
  return 0;
};

// MODIFICAR función existente:
export const calculateSaleTotal = (items, discountValue = 0, discountType = 'percentage') => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = calculateDiscount(subtotal, discountValue, discountType);
  return {
    subtotal,
    discountAmount,
    total: subtotal - discountAmount
  };
};
```

#### 3. **Crear Componente de Descuento** (`src/components/Sales/DiscountSelector.jsx`)
```javascript
// CREAR NUEVO ARCHIVO:
import React, { useState } from 'react';
import { DISCOUNT_PRESETS, DISCOUNT_TYPES } from '../../utils/constants';

const DiscountSelector = ({ onDiscountChange, currentDiscount }) => {
  const [discountType, setDiscountType] = useState('percentage');
  const [customValue, setCustomValue] = useState('');

  const handlePresetClick = (preset) => {
    onDiscountChange(preset.value, preset.type);
  };

  const handleCustomDiscount = () => {
    const value = parseFloat(customValue);
    if (value > 0) {
      onDiscountChange(value, discountType);
    }
  };

  return (
    <div className="discount-selector bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-3">Aplicar Descuento</h3>
      
      {/* Descuentos Predefinidos */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {DISCOUNT_PRESETS.map((preset) => (
          <button
            key={`${preset.value}-${preset.type}`}
            onClick={() => handlePresetClick(preset)}
            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Descuento Personalizado */}
      <div className="border-t pt-3">
        <label className="block text-sm font-medium mb-2">Descuento Personalizado</label>
        <div className="flex gap-2">
          <select 
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            {DISCOUNT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Valor"
            className="px-3 py-2 border rounded flex-1"
          />
          <button
            onClick={handleCustomDiscount}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountSelector;
```

#### 4. **Actualizar Hook de Ventas** (`src/hooks/useSales.js`)
```javascript
// MODIFICAR el estado inicial:
const initialSession = {
  id: sessionId,
  name: sessionName,
  items: [],
  discount: { value: 0, type: 'percentage' }, // AGREGAR ESTA LÍNEA
  customerName: '',
  paymentMethod: 'Efectivo'
};

// AGREGAR nueva función:
const applyDiscount = useCallback((sessionId, discountValue, discountType) => {
  setSessions(prev => prev.map(session => 
    session.id === sessionId 
      ? { ...session, discount: { value: discountValue, type: discountType } }
      : session
  ));
}, []);

// MODIFICAR función de cálculo de totales:
const calculateSessionTotals = useCallback((session) => {
  const subtotal = session.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = calculateDiscount(subtotal, session.discount.value, session.discount.type);
  
  return {
    subtotal,
    discountAmount,
    total: subtotal - discountAmount,
    itemCount: session.items.reduce((sum, item) => sum + item.quantity, 0)
  };
}, []);

// AGREGAR al return:
return {
  // ... otras funciones existentes
  applyDiscount,
  // ... resto del return
};
```

#### 5. **Actualizar Página de Ventas** (`src/pages/Sales.jsx`)
```javascript
// AGREGAR import:
import DiscountSelector from '../components/Sales/DiscountSelector';

// DENTRO del componente, agregar:
const { applyDiscount } = useSales(); // Agregar applyDiscount

// AGREGAR función:
const handleDiscountChange = (value, type) => {
  applyDiscount(activeSessionId, value, type);
};

// AGREGAR en el JSX, después del carrito:
<DiscountSelector 
  onDiscountChange={handleDiscountChange}
  currentDiscount={currentSession?.discount}
/>
```

---

## 📱 Mejorar Diseño Responsive

### 🎯 **Objetivo:** Que funcione bien en móviles y tablets

### 📍 **Archivos a Modificar:**

#### 1. **Actualizar Layout Principal** (`src/components/Layout.jsx`)
```javascript
// MODIFICAR el JSX:
return (
  <div className="min-h-screen bg-gray-50">
    <div className="flex flex-col lg:flex-row"> {/* CAMBIAR: agregar flex-col lg:flex-row */}
      
      {/* Sidebar - Oculto en móvil, visible en desktop */}
      <div className="hidden lg:block lg:w-64 lg:fixed lg:h-full"> {/* CAMBIAR */}
        <Sidebar />
      </div>
      
      {/* Menú móvil */}
      <div className="lg:hidden bg-white shadow-sm p-4"> {/* AGREGAR */}
        <MobileSidebar />
      </div>
      
      {/* Contenido principal */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-6"> {/* CAMBIAR */}
        <Outlet />
      </main>
    </div>
  </div>
);
```

#### 2. **Crear Sidebar Móvil** (`src/components/MobileSidebar.jsx`)
```javascript
// CREAR NUEVO ARCHIVO:
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Inicio', icon: '🏠' },
    { path: '/sales', label: 'Ventas', icon: '🛒' },
    { path: '/products', label: 'Productos', icon: '📦' },
    { path: '/customers', label: 'Clientes', icon: '👥' },
  ];

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md bg-gray-100"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 border-b hover:bg-gray-50"
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
};

export default MobileSidebar;
```

#### 3. **Hacer Responsive las Tablas** (`src/components/Products/ProductsTable.jsx`)
```javascript
// MODIFICAR el JSX de la tabla:
return (
  <div className="overflow-x-auto"> {/* AGREGAR contenedor con scroll horizontal */}
    <table className="min-w-full bg-white rounded-lg shadow">
      {/* Contenido existente de la tabla */}
    </table>
    
    {/* Vista de tarjetas para móvil */}
    <div className="lg:hidden"> {/* AGREGAR vista móvil */}
      {products.map((product) => (
        <div key={product.id} className="bg-white p-4 mb-4 rounded-lg shadow">
          <h3 className="font-semibold">{product.articulo}</h3>
          <p className="text-gray-600">Stock: {product.stock}</p>
          <p className="text-green-600 font-medium">${product.precioCosto}</p>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              Editar
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

---

## 🔄 Agregar Sistema Offline

### 🎯 **Objetivo:** Que funcione sin internet y sincronice después

### 📍 **Archivos a Modificar:**

#### 1. **Crear Hook de Conectividad** (`src/hooks/useOnlineStatus.js`)
```javascript
// CREAR NUEVO ARCHIVO:
import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

#### 2. **Crear Servicio de Cache Local** (`src/services/localStorageService.js`)
```javascript
// CREAR NUEVO ARCHIVO:
const KEYS = {
  PRODUCTS: 'rosema_products',
  PENDING_SALES: 'rosema_pending_sales',
  CUSTOMERS: 'rosema_customers'
};

export const localStorageService = {
  // Guardar datos
  saveProducts: (products) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Obtener datos
  getProducts: () => {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },

  // Guardar venta pendiente
  savePendingSale: (sale) => {
    const pending = localStorageService.getPendingSales();
    pending.push({ ...sale, id: Date.now(), timestamp: new Date() });
    localStorage.setItem(KEYS.PENDING_SALES, JSON.stringify(pending));
  },

  // Obtener ventas pendientes
  getPendingSales: () => {
    const data = localStorage.getItem(KEYS.PENDING_SALES);
    return data ? JSON.parse(data) : [];
  },

  // Limpiar venta sincronizada
  removePendingSale: (saleId) => {
    const pending = localStorageService.getPendingSales();
    const filtered = pending.filter(sale => sale.id !== saleId);
    localStorage.setItem(KEYS.PENDING_SALES, JSON.stringify(filtered));
  }
};
```

#### 3. **Actualizar Hook de Productos** (`src/hooks/useProducts.js`)
```javascript
// AGREGAR imports:
import { useOnlineStatus } from './useOnlineStatus';
import { localStorageService } from '../services/localStorageService';

// DENTRO del hook:
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useOnlineStatus(); // AGREGAR

  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (isOnline) {
          // Si hay internet, cargar de Firebase
          const firebaseProducts = await getAllProducts();
          setProducts(firebaseProducts);
          // Guardar en cache local
          localStorageService.saveProducts(firebaseProducts);
        } else {
          // Si no hay internet, cargar del cache
          const cachedProducts = localStorageService.getProducts();
          setProducts(cachedProducts);
        }
      } catch (error) {
        // Si falla Firebase, usar cache como fallback
        const cachedProducts = localStorageService.getProducts();
        setProducts(cachedProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [isOnline]); // AGREGAR isOnline como dependencia

  // AGREGAR al return:
  return {
    products,
    loading,
    isOnline, // AGREGAR
    // ... otras funciones
  };
};
```

#### 4. **Actualizar Hook de Ventas para Offline** (`src/hooks/useSales.js`)
```javascript
// AGREGAR import:
import { localStorageService } from '../services/localStorageService';
import { useOnlineStatus } from './useOnlineStatus';

// DENTRO del hook:
const isOnline = useOnlineStatus();

// MODIFICAR función de procesar venta:
const processSale = useCallback(async (sessionId) => {
  try {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.items.length === 0) return;

    const saleData = {
      items: session.items,
      paymentMethod: session.paymentMethod,
      discount: session.discount,
      total: calculateSessionTotals(session).total,
      customerName: session.customerName
    };

    if (isOnline) {
      // Si hay internet, procesar normalmente
      const completedSale = await salesService.processSale(saleData);
      clearSession(sessionId);
      return completedSale;
    } else {
      // Si no hay internet, guardar como pendiente
      localStorageService.savePendingSale(saleData);
      clearSession(sessionId);
      
      // Mostrar mensaje de que se guardó offline
      alert('Venta guardada offline. Se sincronizará cuando haya conexión.');
      return { ...saleData, id: Date.now(), status: 'pending' };
    }
  } catch (error) {
    console.error('Error procesando venta:', error);
    throw error;
  }
}, [sessions, isOnline]);

// AGREGAR función para sincronizar ventas pendientes:
const syncPendingSales = useCallback(async () => {
  if (!isOnline) return;

  const pendingSales = localStorageService.getPendingSales();
  
  for (const sale of pendingSales) {
    try {
      await salesService.processSale(sale);
      localStorageService.removePendingSale(sale.id);
    } catch (error) {
      console.error('Error sincronizando venta:', error);
    }
  }
}, [isOnline]);

// AGREGAR efecto para sincronizar cuando vuelva la conexión:
useEffect(() => {
  if (isOnline) {
    syncPendingSales();
  }
}, [isOnline, syncPendingSales]);
```

#### 5. **Agregar Indicador de Estado** (`src/components/common/ConnectionStatus.jsx`)
```javascript
// CREAR NUEVO ARCHIVO:
import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const ConnectionStatus = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null; // No mostrar nada si hay conexión

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
      <span className="font-medium">⚠️ Sin conexión - Trabajando offline</span>
    </div>
  );
};

export default ConnectionStatus;
```

#### 6. **Agregar al Layout** (`src/components/Layout.jsx`)
```javascript
// AGREGAR import:
import ConnectionStatus from './common/ConnectionStatus';

// AGREGAR en el JSX:
return (
  <div className="min-h-screen bg-gray-50">
    <ConnectionStatus /> {/* AGREGAR ESTA LÍNEA */}
    {/* Resto del layout existente */}
  </div>
);
```

---

## 📊 Agregar Dashboard de Estadísticas

### 🎯 **Objetivo:** Página con gráficos y métricas de ventas

### 📍 **Archivos a Modificar:**

#### 1. **Instalar Librería de Gráficos**
```bash
# En la terminal:
npm install recharts
```

#### 2. **Crear Componente de Gráfico** (`src/components/Statistics/SalesChart.jsx`)
```javascript
// CREAR NUEVO ARCHIVO:
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart = ({ data, title }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
          <Line type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
```

#### 3. **Actualizar Página de Estadísticas** (`src/pages/Statistics.jsx`)
```javascript
// REEMPLAZAR contenido completo:
import React, { useState, useEffect } from 'react';
import { useSales } from '../hooks/useSales';
import SalesChart from '../components/Statistics/SalesChart';
import StatsCard from '../components/common/StatsCard';

const Statistics = () => {
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageSale: 0,
    topProducts: []
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // Cargar datos de ventas de los últimos 30 días
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const sales = await getSalesHistory({ startDate, endDate });
      
      // Procesar datos para el gráfico
      const chartData = processChartData(sales);
      setSalesData(chartData);

      // Calcular estadísticas
      const calculatedStats = calculateStats(sales);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const processChartData = (sales) => {
    // Agrupar ventas por día
    const salesByDay = {};
    
    sales.forEach(sale => {
      const date = sale.saleDate.toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = 0;
      }
      salesByDay[date] += sale.total;
    });

    // Convertir a array para el gráfico
    return Object.entries(salesByDay).map(([date, sales]) => ({
      date: new Date(date).toLocaleDateString(),
      sales
    }));
  };

  const calculateStats = (sales) => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Productos más vendidos
    const productSales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = 0;
        }
        productSales[item.productName] += item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    return {
      totalSales,
      totalRevenue,
      averageSale,
      topProducts
    };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Ventas"
          value={stats.totalSales}
          icon="🛒"
        />
        <StatsCard
          title="Ingresos Totales"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="💰"
        />
        <StatsCard
          title="Venta Promedio"
          value={`$${Math.round(stats.averageSale).toLocaleString()}`}
          icon="📊"
        />
      </div>

      {/* Gráfico de ventas */}
      <SalesChart 
        data={salesData} 
        title="Ventas de los Últimos 30 Días" 
      />

      {/* Productos más vendidos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
        <div className="space-y-2">
          {stats.topProducts.map((product, index) => (
            <div key={product.name} className="flex justify-between items-center">
              <span>{index + 1}. {product.name}</span>
              <span className="font-medium">{product.quantity} vendidos</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
```

---

## 🆕 Agregar Nueva Página

### 🎯 **Objetivo:** Crear una página de "Reportes"

### 📍 **Pasos Exactos:**

#### 1. **Crear el Archivo de la Página** (`src/pages/Reports.jsx`)
```javascript
// CREAR NUEVO ARCHIVO:
import React, { useState } from 'react';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('sales');

  const reportTypes = [
    { id: 'sales', name: 'Reporte de Ventas', icon: '📊' },
    { id: 'inventory', name: 'Reporte de Inventario', icon: '📦' },
    { id: 'customers', name: 'Reporte de Clientes', icon: '👥' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>

      {/* Selector de tipo de reporte */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Seleccionar Reporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedReport === report.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{report.icon}</div>
              <div className="font-medium">{report.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del reporte */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          {reportTypes.find(r => r.id === selectedReport)?.name}
        </h2>
        <p className="text-gray-600">
          Aquí irá el contenido del reporte seleccionado.
        </p>
      </div>
    </div>
  );
};

export default Reports;
```

#### 2. **Agregar la Ruta** (`src/App.jsx`)
```javascript
// AGREGAR import:
import Reports from './pages/Reports';

// AGREGAR ruta dentro de <Route path="/" element={<Layout />}>:
<Route path="reports" element={<Reports />} />
```

#### 3. **Agregar al Sidebar** (`src/components/Sidebar.jsx`)
```javascript
// BUSCAR el array de menuItems y AGREGAR:
{
  path: '/reports',
  label: 'Reportes',
  icon: '📋'
},
```

---

## 🎨 Cambiar Tema/Colores

### 🎯 **Objetivo:** Cambiar de rojo a azul

### 📍 **Archivos a Modificar:**

#### 1. **Actualizar Constantes de Colores** (`src/utils/constants.js`)
```javascript
// MODIFICAR:
export const THEME_COLORS = {
  PRIMARY: 'blue-600',      // CAMBIAR de 'red-600' a 'blue-600'
  SECONDARY: 'gray-600',
  SUCCESS: 'green-600',
  WARNING: 'yellow-600',
  ERROR: 'red-600',
  INFO: 'blue-600'
};

// MODIFICAR:
export const CSS_CLASSES = {
  BUTTON_PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors', // CAMBIAR red por blue
  BUTTON_SECONDARY: 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors',
  INPUT: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500', // CAMBIAR red por blue
  CARD: 'bg-white rounded-lg shadow-md p-6',
  MODAL_OVERLAY: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
};
```

#### 2. **Actualizar Tailwind Config** (`tailwind.config.js`)
```javascript
// MODIFICAR:
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',   // CAMBIAR: colores azules en lugar de rojos
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Color principal
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
}
```

#### 3. **Buscar y Reemplazar en Todos los Archivos**
```bash
# En VS Code, usar Ctrl+Shift+
