# 🎣 Manual Detallado de Hooks - Rosema POS

## 🎯 ¿Qué son los Hooks?

Los **hooks** son funciones especiales de React que te permiten "engancharte" al estado y ciclo de vida de los componentes. En tu proyecto, los hooks personalizados encapsulan la lógica de negocio y la reutilizan en múltiples componentes.

---

## 🔧 useAuth.js - Autenticación

### 📍 **Ubicación:** `src/hooks/useAuth.js`

### 🎯 **¿Qué hace?**
Maneja toda la autenticación con Firebase Auth:
- Estado del usuario logueado
- Login y logout
- Verificación automática de sesión
- Manejo de errores en español

### 📊 **Estados que maneja:**
```javascript
const [user, setUser] = useState(null);           // Usuario actual
const [loading, setLoading] = useState(true);     // Estado de carga
const [error, setError] = useState(null);         // Errores de auth
```

### 🔥 **Funciones Firebase:**
```javascript
// Escucha cambios de autenticación
onAuthStateChanged(auth, (user) => {
  setUser(user);
  setLoading(false);
});

// Login con email/password
const login = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

// Logout
const logout = async () => {
  await signOut(auth);
};
```

### 💡 **Cómo usarlo:**
```javascript
// En cualquier componente
const { user, loading, login, logout, isAuthenticated } = useAuth();

if (loading) return <div>Cargando...</div>;
if (!isAuthenticated) return <Login />;
```

### 🚨 **Para modo offline:**
- **Problema:** Firebase Auth requiere internet
- **Solución:** Implementar cache de sesión local
- **Mejora sugerida:** Agregar `localStorage` para recordar usuario

---

## 📦 useProducts.js - Gestión de Productos

### 📍 **Ubicación:** `src/hooks/useProducts.js`

### 🎯 **¿Qué hace?**
Maneja todo el CRUD de productos y la sincronización en tiempo real:
- Cargar productos desde Firebase
- Crear, editar, eliminar productos
- Suscripción en tiempo real
- Cache local para performance

### 📊 **Estados que maneja:**
```javascript
const [products, setProducts] = useState([]);           // Lista de productos
const [realtimeProducts, setRealtimeProducts] = useState([]); // Productos en tiempo real
const [loading, setLoading] = useState(true);           // Estado de carga
const [error, setError] = useState(null);               // Errores
```

### 🔥 **Funciones Firebase principales:**
```javascript
// Suscripción en tiempo real
const unsubscribe = subscribeToProducts((products) => {
  setRealtimeProducts(products);
});

// CRUD operations
const addProduct = async (productData) => {
  return await createProduct(productData);
};

const updateProductData = async (productId, updates) => {
  return await updateProduct(productId, updates);
};
```

### 💡 **Cómo usarlo:**
```javascript
const { 
  products, 
  loading, 
  addProduct, 
  updateProductData, 
  removeProduct 
} = useProducts();
```

### 🚨 **Para modo offline:**
- **Implementado:** Cache básico con `realtimeProducts`
- **Mejora necesaria:** Persistir en `localStorage`
- **Sincronización:** Queue de cambios pendientes

---

## 🛒 useSales.js - Sistema de Ventas

### 📍 **Ubicación:** `src/hooks/useSales.js`

### 🎯 **¿Qué hace?**
El hook más complejo del sistema. Maneja:
- Múltiples sesiones de venta
- Carrito de compras por sesión
- Cálculos de totales y descuentos
- Procesamiento de ventas
- Estados de pago

### 📊 **Estados que maneja:**
```javascript
const [sessions, setSessions] = useState({});           // Sesiones múltiples
const [activeSessionId, setActiveSessionId] = useState(null); // Sesión activa
const [loading, setLoading] = useState(false);          // Estado de carga
```

### 🔄 **Estructura de Sesión:**
```javascript
const session = {
  id: 'session-1',
  name: 'Cliente 1',
  items: [
    {
      id: 'item-1',
      productId: 'PROD001',
      productName: 'Remera Básica',
      size: 'M',
      color: 'Rojo',
      price: 3000,
      quantity: 2,
      subtotal: 6000
    }
  ],
  paymentMethod: 'Efectivo',
  discountPercent: 0,
  customerName: '',
  cashReceived: 0
};
```

### 🧮 **Cálculos automáticos:**
```javascript
const calculateSessionTotals = useCallback((session) => {
  const subtotal = session.items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  
  const discountAmount = (subtotal * session.discountPercent) / 100;
  const total = subtotal - discountAmount;
  
  return { subtotal, discountAmount, total };
}, []);
```

### 💡 **Funciones principales:**
```javascript
// Gestión de sesiones
const createSession = (sessionName) => { /* ... */ };
const switchSession = (sessionId) => { /* ... */ };
const cancelSession = (sessionId) => { /* ... */ };

// Gestión del carrito
const addToCart = (product, quantity, variant) => { /* ... */ };
const updateCartItemQuantity = (itemId, newQuantity) => { /* ... */ };
const removeFromCart = (itemId) => { /* ... */ };

// Procesamiento
const finalizeSession = async (sessionId) => { /* ... */ };
```

### 🚨 **Para modo offline:**
- **Crítico:** Guardar ventas pendientes en `localStorage`
- **Sincronización:** Queue de ventas para procesar cuando vuelva internet
- **Stock local:** Actualizar stock localmente y sincronizar después

---

## 🔍 useProductSearch.js - Búsqueda de Productos

### 📍 **Ubicación:** `src/hooks/useProductSearch.js`

### 🎯 **¿Qué hace?**
Maneja la búsqueda inteligente de productos para ventas:
- Búsqueda por código de barras
- Búsqueda por nombre con priorización
- Validación de stock
- Manejo de variantes

### 📊 **Estados que maneja:**
```javascript
const [searchTerm, setSearchTerm] = useState('');       // Término de búsqueda
const [searchResults, setSearchResults] = useState([]); // Resultados
const [showResults, setShowResults] = useState(false);  // Mostrar resultados
const [loading, setLoading] = useState(false);          // Estado de carga
```

### 🔍 **Lógica de búsqueda:**
```javascript
const handleSearch = useCallback(async (term) => {
  if (!term.trim()) {
    setSearchResults([]);
    setShowResults(false);
    return;
  }

  setLoading(true);
  try {
    // Priorizar búsqueda por código exacto
    const results = await searchProductsWithPriority(term, products);
    setSearchResults(results);
    setShowResults(true);
  } catch (error) {
    console.error('Error en búsqueda:', error);
  } finally {
    setLoading(false);
  }
}, [products]);
```

### 📱 **Búsqueda por código de barras:**
```javascript
const handleBarcodeScan = useCallback(async (barcode) => {
  try {
    const product = await getProductByBarcode(barcode);
    if (product) {
      onProductSelect(product, 1, null, product.variantes?.length > 1);
    }
  } catch (error) {
    alert('Producto no encontrado');
  }
}, [onProductSelect]);
```

### 🚨 **Para modo offline:**
- **Implementar:** Búsqueda en cache local
- **Optimizar:** Índices de búsqueda en memoria
- **Mejorar:** Búsqueda fuzzy para errores de tipeo

---

## 👥 useCustomers.js - Gestión de Clientes

### 📍 **Ubicación:** `src/hooks/useCustomers.js`

### 🎯 **¿Qué hace?**
Sistema CRM completo para clientes:
- CRUD de clientes
- Búsqueda y filtrado
- Estadísticas automáticas
- Historial de compras
- Análisis de comportamiento

### 📊 **Estados que maneja:**
```javascript
const [customers, setCustomers] = useState([]);         // Lista de clientes
const [loading, setLoading] = useState(false);          // Estado de carga
const [error, setError] = useState(null);               // Errores
const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda
```

### 📈 **Cálculo de estadísticas:**
```javascript
const getCustomerStatsLocal = useCallback(() => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => 
      c.ultimaCompra && new Date(c.ultimaCompra.seconds * 1000) > thirtyDaysAgo
    ).length,
    newCustomers: customers.filter(c => 
      c.fechaRegistro && new Date(c.fechaRegistro.seconds * 1000) > thirtyDaysAgo
    ).length,
    averageSpending: customers.reduce((sum, c) => 
      sum + (c.montoTotalGastado || 0), 0
    ) / customers.length || 0
  };
}, [customers]);
```

### 🚨 **Para modo offline:**
- **Cache:** Guardar clientes en `localStorage`
- **Sincronización:** Queue de cambios pendientes
- **Estadísticas:** Calcular localmente

---

## 🎛️ useModal.js - Gestión de Modales

### 📍 **Ubicación:** `src/hooks/useModal.js`

### 🎯 **¿Qué hace?**
Maneja múltiples modales de forma centralizada:
- Estado de apertura/cierre
- Datos asociados a cada modal
- Prevención de múltiples modales abiertos

### 📊 **Estados que maneja:**
```javascript
const [modals, setModals] = useState({});  // Estado de todos los modales
```

### 💡 **Cómo usarlo:**
```javascript
const { openModal, closeModal, isModalOpen, getModalData } = useModals([
  'productForm',
  'deleteConfirm',
  'barcodePrint'
]);

// Abrir modal con datos
openModal('productForm', { mode: 'create', product: null });

// Verificar si está abierto
if (isModalOpen('productForm')) { /* ... */ }

// Obtener datos del modal
const modalData = getModalData('productForm');
```

---

## 🔧 useFormValidation.js - Validación de Formularios

### 📍 **Ubicación:** `src/hooks/useFormValidation.js`

### 🎯 **¿Qué hace?**
Sistema de validación reutilizable para formularios:
- Validación en tiempo real
- Mensajes de error personalizados
- Reglas de validación flexibles

### 📊 **Estados que maneja:**
```javascript
const [values, setValues] = useState(initialValues);    // Valores del formulario
const [errors, setErrors] = useState({});               // Errores de validación
const [touched, setTouched] = useState({});             // Campos tocados
```

### 💡 **Ejemplo de uso:**
```javascript
const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email inválido'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Mínimo 6 caracteres'
  }
};

const { values, errors, handleChange, handleBlur, isValid } = 
  useFormValidation(initialValues, validationRules);
```

---

## 🎯 Hooks Faltantes que Deberías Crear

### 1. **useOfflineSync.js** (CRÍTICO para modo offline)
```javascript
// Hook para manejar sincronización offline
const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);
  
  // Detectar cambios de conectividad
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
  
  // Sincronizar cuando vuelva la conexión
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline]);
  
  return { isOnline, addPendingAction, syncPendingActions };
};
```

### 2. **useLocalStorage.js** (Para persistencia)
```javascript
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };
  
  return [storedValue, setValue];
};
```

### 3. **useStatistics.js** (Para página Statistics)
```javascript
const useStatistics = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  const loadDashboardStats = async () => {
    // Cargar estadísticas de ventas, productos, clientes
    const salesStats = await getSalesStats();
    const productStats = await getProductStats();
    const customerStats = await getCustomerStats();
    
    setStats({ sales: salesStats, products: productStats, customers: customerStats });
  };
  
  return { stats, loading, loadDashboardStats };
};
```

### 4. **useNotifications.js** (Para feedback al usuario)
```javascript
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };
  
  return { notifications, addNotification, removeNotification };
};
```

---

## 💡 Recomendaciones para Mejoras

### 🚀 **Prioridad Alta:**
1. **Crear useOfflineSync** - Esencial para modo offline
2. **Mejorar useProducts** - Agregar cache persistente
3. **Optimizar useSales** - Queue de ventas offline
4. **Crear useStatistics** - Para completar página Statistics

### 🔧 **Prioridad Media:**
1. **useLocalStorage** - Para persistencia general
2. **useNotifications** - Mejor UX
3. **Mejorar useAuth** - Cache de sesión
4. **useFormValidation** - Más reglas de validación

### 📱 **Para Modo Offline:**
1. **Detectar conectividad** en todos los hooks
2. **Cache local** en localStorage/IndexedDB
3. **Queue de sincronización** para acciones pendientes
4. **Fallbacks** cuando no hay internet

### 🎯 **Para Páginas Incompletas:**
1. **useStatistics** para Statistics.jsx
2. **useGoals** para Goals.jsx
3. **useInvoices** para Invoices.jsx
4. **useReports** para nueva página de reportes

¿Te gustaría que implemente alguno de estos hooks específicos o que profundice en algún aspecto particular?
