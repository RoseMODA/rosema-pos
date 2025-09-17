# 📱 Manual de Implementación Modo Offline - Rosema POS

## 🎯 ¿Por Qué Modo Offline?

En un negocio como Rosema, la conectividad puede fallar en momentos críticos. El modo offline permite:
- **Continuar vendiendo** sin internet
- **Guardar datos localmente** y sincronizar después
- **Mejor experiencia de usuario** sin interrupciones
- **Confiabilidad** en zonas con mala conectividad

---

## 🏗️ Arquitectura del Sistema Offline

### 📊 **Estrategia de Datos:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FIREBASE      │    │  CACHE LOCAL    │    │   INTERFAZ      │
│   (Online)      │◄──►│  (Offline)      │◄──►│   (Usuario)     │
│                 │    │                 │    │                 │
│ - Firestore     │    │ - localStorage  │    │ - Indicadores   │
│ - Auth          │    │ - IndexedDB     │    │ - Sync Status   │
│ - Storage       │    │ - Queue Actions │    │ - Offline Mode  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔄 **Flujo de Sincronización:**
1. **Online:** Datos van directo a Firebase
2. **Offline:** Datos van a cache local
3. **Reconexión:** Sincronizar cache con Firebase
4. **Conflictos:** Resolver automáticamente o manualmente

---

## 🛠️ Implementación Paso a Paso

### 1. **Crear Hook de Conectividad**

#### 📍 **Archivo:** `src/hooks/useOnlineStatus.js`
```javascript
import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger sync when coming back online
        window.dispatchEvent(new CustomEvent('sync-required'));
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};
```

### 2. **Crear Servicio de Cache Local**

#### 📍 **Archivo:** `src/services/offlineService.js`
```javascript
/**
 * Servicio para manejo de datos offline
 * Usa localStorage para datos simples e IndexedDB para datos complejos
 */

const STORAGE_KEYS = {
  PRODUCTS: 'rosema_products_cache',
  CUSTOMERS: 'rosema_customers_cache',
  PENDING_SALES: 'rosema_pending_sales',
  PENDING_ACTIONS: 'rosema_pending_actions',
  LAST_SYNC: 'rosema_last_sync'
};

class OfflineService {
  // ==================== PRODUCTOS ====================
  
  saveProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify({
        data: products,
        timestamp: Date.now()
      }));
      console.log('✅ Productos guardados en cache local');
    } catch (error) {
      console.error('❌ Error guardando productos:', error);
    }
  }

  getProducts() {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache válido por 1 hora
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          return data;
        }
      }
      return [];
    } catch (error) {
      console.error('❌ Error obteniendo productos del cache:', error);
      return [];
    }
  }

  // ==================== CLIENTES ====================
  
  saveCustomers(customers) {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify({
        data: customers,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('❌ Error guardando clientes:', error);
    }
  }

  getCustomers() {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (cached) {
        const { data } = JSON.parse(cached);
        return data;
      }
      return [];
    } catch (error) {
      console.error('❌ Error obteniendo clientes del cache:', error);
      return [];
    }
  }

  // ==================== VENTAS PENDIENTES ====================
  
  savePendingSale(sale) {
    try {
      const pending = this.getPendingSales();
      const newSale = {
        ...sale,
        id: `offline_${Date.now()}`,
        timestamp: Date.now(),
        status: 'pending_sync'
      };
      
      pending.push(newSale);
      localStorage.setItem(STORAGE_KEYS.PENDING_SALES, JSON.stringify(pending));
      
      console.log('💾 Venta guardada offline:', newSale.id);
      return newSale;
    } catch (error) {
      console.error('❌ Error guardando venta offline:', error);
      throw error;
    }
  }

  getPendingSales() {
    try {
      const pending = localStorage.getItem(STORAGE_KEYS.PENDING_SALES);
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('❌ Error obteniendo ventas pendientes:', error);
      return [];
    }
  }

  removePendingSale(saleId) {
    try {
      const pending = this.getPendingSales();
      const filtered = pending.filter(sale => sale.id !== saleId);
      localStorage.setItem(STORAGE_KEYS.PENDING_SALES, JSON.stringify(filtered));
      console.log('🗑️ Venta sincronizada removida:', saleId);
    } catch (error) {
      console.error('❌ Error removiendo venta pendiente:', error);
    }
  }

  // ==================== ACCIONES PENDIENTES ====================
  
  addPendingAction(action) {
    try {
      const pending = this.getPendingActions();
      const newAction = {
        ...action,
        id: `action_${Date.now()}`,
        timestamp: Date.now()
      };
      
      pending.push(newAction);
      localStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(pending));
      
      console.log('📝 Acción pendiente agregada:', newAction.type);
      return newAction;
    } catch (error) {
      console.error('❌ Error agregando acción pendiente:', error);
    }
  }

  getPendingActions() {
    try {
      const pending = localStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      return [];
    }
  }

  removePendingAction(actionId) {
    try {
      const pending = this.getPendingActions();
      const filtered = pending.filter(action => action.id !== actionId);
      localStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(filtered));
    } catch (error) {
      console.error('❌ Error removiendo acción pendiente:', error);
    }
  }

  // ==================== SINCRONIZACIÓN ====================
  
  setLastSync(timestamp = Date.now()) {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
  }

  getLastSync() {
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return lastSync ? parseInt(lastSync) : 0;
  }

  // ==================== UTILIDADES ====================
  
  clearAllCache() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🧹 Cache local limpiado');
  }

  getCacheInfo() {
    return {
      products: this.getProducts().length,
      customers: this.getCustomers().length,
      pendingSales: this.getPendingSales().length,
      pendingActions: this.getPendingActions().length,
      lastSync: new Date(this.getLastSync()).toLocaleString()
    };
  }
}

export const offlineService = new OfflineService();
```

### 3. **Crear Hook de Sincronización**

#### 📍 **Archivo:** `src/hooks/useOfflineSync.js`
```javascript
import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { offlineService } from '../services/offlineService';
import { processSale } from '../services/salesService';
import { createProduct, updateProduct } from '../services/productsService';

export const useOfflineSync = () => {
  const { isOnline } = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncErrors, setSyncErrors] = useState([]);

  // Sincronizar automáticamente cuando vuelva la conexión
  useEffect(() => {
    if (isOnline) {
      syncPendingData();
    }
  }, [isOnline]);

  // Escuchar evento personalizado de sincronización
  useEffect(() => {
    const handleSyncRequired = () => {
      if (isOnline) {
        syncPendingData();
      }
    };

    window.addEventListener('sync-required', handleSyncRequired);
    return () => window.removeEventListener('sync-required', handleSyncRequired);
  }, [isOnline]);

  const syncPendingData = useCallback(async () => {
    if (!isOnline || syncing) return;

    setSyncing(true);
    setSyncProgress(0);
    setSyncErrors([]);

    try {
      console.log('🔄 Iniciando sincronización...');

      // 1. Sincronizar ventas pendientes
      await syncPendingSales();
      setSyncProgress(50);

      // 2. Sincronizar acciones pendientes
      await syncPendingActions();
      setSyncProgress(100);

      // 3. Actualizar timestamp de última sincronización
      offlineService.setLastSync();

      console.log('✅ Sincronización completada');
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      setSyncErrors(prev => [...prev, error.message]);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, syncing]);

  const syncPendingSales = async () => {
    const pendingSales = offlineService.getPendingSales();
    console.log(`📊 Sincronizando ${pendingSales.length} ventas pendientes...`);

    for (const sale of pendingSales) {
      try {
        // Procesar venta en Firebase
        await processSale({
          items: sale.items,
          paymentMethod: sale.paymentMethod,
          discount: sale.discount,
          total: sale.total,
          customerName: sale.customerName,
          cardName: sale.cardName,
          installments: sale.installments,
          commission: sale.commission
        });

        // Remover de pendientes
        offlineService.removePendingSale(sale.id);
        console.log(`✅ Venta sincronizada: ${sale.id}`);
      } catch (error) {
        console.error(`❌ Error sincronizando venta ${sale.id}:`, error);
        setSyncErrors(prev => [...prev, `Venta ${sale.id}: ${error.message}`]);
      }
    }
  };

  const syncPendingActions = async () => {
    const pendingActions = offlineService.getPendingActions();
    console.log(`📊 Sincronizando ${pendingActions.length} acciones pendientes...`);

    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'CREATE_PRODUCT':
            await createProduct(action.data);
            break;
          case 'UPDATE_PRODUCT':
            await updateProduct(action.productId, action.data);
            break;
          // Agregar más tipos según necesites
          default:
            console.warn(`Tipo de acción no reconocido: ${action.type}`);
        }

        offlineService.removePendingAction(action.id);
        console.log(`✅ Acción sincronizada: ${action.type}`);
      } catch (error) {
        console.error(`❌ Error sincronizando acción ${action.id}:`, error);
        setSyncErrors(prev => [...prev, `${action.type}: ${error.message}`]);
      }
    }
  };

  const forcSync = () => {
    if (isOnline) {
      syncPendingData();
    }
  };

  return {
    syncing,
    syncProgress,
    syncErrors,
    forcSync,
    isOnline
  };
};
```

### 4. **Modificar Hook de Ventas para Modo Offline**

#### 📍 **Modificar:** `src/hooks/useSales.js`
```javascript
// AGREGAR imports
import { useOnlineStatus } from './useOnlineStatus';
import { offlineService } from '../services/offlineService';

// DENTRO del hook useSales:
export const useSales = () => {
  const { isOnline } = useOnlineStatus();
  // ... otros estados existentes

  // MODIFICAR función finalizeSession
  const finalizeSession = useCallback(async (sessionId) => {
    try {
      const session = sessions[sessionId];
      if (!session || session.items.length === 0) {
        throw new Error('No hay productos en el carrito');
      }

      setLoading(true);

      const saleData = {
        items: session.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          articulo: item.articulo,
          code: item.code,
          talle: item.size,
          color: item.color,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          proveedorId: item.proveedorId,
          providerName: item.providerName,
          isReturn: item.isReturn || false,
          isQuickItem: item.isQuickItem || false
        })),
        paymentMethod: session.paymentMethod,
        discount: session.discountPercent,
        total: calculateSessionTotals(session).total,
        customerName: session.customerName,
        cardName: session.cardName,
        installments: session.installments,
        commission: session.commission
      };

      let completedSale;

      if (isOnline) {
        // Modo online: procesar normalmente
        completedSale = await processSale(saleData);
        console.log('✅ Venta procesada online');
      } else {
        // Modo offline: guardar localmente
        completedSale = offlineService.savePendingSale(saleData);
        
        // Actualizar stock localmente
        updateLocalStock(session.items);
        
        console.log('💾 Venta guardada offline');
        alert('⚠️ Sin conexión. Venta guardada offline y se sincronizará automáticamente.');
      }

      // Limpiar sesión
      clearSession(sessionId);
      
      return completedSale;
    } catch (error) {
      console.error('❌ Error procesando venta:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessions, isOnline, calculateSessionTotals]);

  // AGREGAR función para actualizar stock local
  const updateLocalStock = (items) => {
    try {
      const products = offlineService.getProducts();
      const updatedProducts = products.map(product => {
        const saleItem = items.find(item => item.productId === product.id);
        
        if (saleItem && !saleItem.isQuickItem) {
          const updatedVariantes = product.variantes?.map(variant => {
            if (variant.talle === saleItem.size && variant.color === saleItem.color) {
              const stockChange = saleItem.isReturn ? saleItem.quantity : -saleItem.quantity;
              return {
                ...variant,
                stock: Math.max(0, variant.stock + stockChange)
              };
            }
            return variant;
          });
          
          return { ...product, variantes: updatedVariantes };
        }
        
        return product;
      });
      
      offlineService.saveProducts(updatedProducts);
      console.log('📦 Stock local actualizado');
    } catch (error) {
      console.error('❌ Error actualizando stock local:', error);
    }
  };

  // ... resto del hook
};
```

### 5. **Crear Componente de Estado de Conexión**

#### 📍 **Archivo:** `src/components/common/ConnectionStatus.jsx`
```javascript
import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { offlineService } from '../../services/offlineService';

const ConnectionStatus = () => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { syncing, syncProgress, syncErrors, forcSync } = useOfflineSync();

  if (isOnline && !syncing && !wasOffline) {
    return null; // No mostrar nada si todo está normal
  }

  const cacheInfo = offlineService.getCacheInfo();

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Barra de estado offline */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="animate-pulse">⚠️</span>
            <span className="font-medium">Modo Offline</span>
            <span className="text-sm">
              - {cacheInfo.pendingSales} ventas pendientes
            </span>
          </div>
        </div>
      )}

      {/* Barra de sincronización */}
      {syncing && (
        <div className="bg-blue-500 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="font-medium">Sincronizando...</span>
            <span className="text-sm">{syncProgress}%</span>
          </div>
          {syncProgress > 0 && (
            <div className="w-full bg-blue-400 rounded-full h-1 mt-1">
              <div 
                className="bg-white h-1 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Errores de sincronización */}
      {syncErrors.length > 0 && (
        <div className="bg-red-500 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center space-x-2">
            <span>❌</span>
            <span className="font-medium">Errores de sincronización</span>
            <button 
              onClick={forcSync}
              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Confirmación de sincronización exitosa */}
      {wasOffline && isOnline && !syncing && syncErrors.length === 0 && (
        <div className="bg-green-500 text-white text-center py-2 px-4 animate-pulse">
          <span>✅ Datos sincronizados correctamente</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
```

### 6. **Agregar al Layout Principal**

#### 📍 **Modificar:** `src/components/Layout.jsx`
```javascript
// AGREGAR import
import ConnectionStatus from './common/ConnectionStatus';

// MODIFICAR el JSX
return (
  <div className="min-h-screen bg-gray-50">
    <ConnectionStatus /> {/* AGREGAR ESTA LÍNEA */}
    
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 fixed h-full">
        <Sidebar />
      </div>
      
      {/* Contenido principal */}
      <main className="flex-1 ml-64 p-6">
        <Outlet />
      </main>
    </div>
  </div>
);
```

---

## 🧪 Testing del Modo Offline

### 1. **Simular Pérdida de Conexión:**
```javascript
// En DevTools Console:
// Simular offline
navigator.onLine = false;
window.dispatchEvent(new Event('offline'));

// Simular online
navigator.onLine = true;
window.dispatchEvent(new Event('online'));
```

### 2. **Verificar Cache Local:**
```javascript
// En DevTools Console:
import { offlineService } from './src/services/offlineService';
console.log(offlineService.getCacheInfo());
```

### 3. **Test de Ventas Offline:**
1. Desconectar internet
2. Realizar una venta
3. Verificar que se guarde en localStorage
4. Reconectar internet
5. Verificar que se sincronice automáticamente

---

## 🚨 Consideraciones Importantes

### ⚠️ **Limitaciones:**
- **Firebase Auth:** Requiere conexión para login inicial
- **Imágenes:** No se pueden subir offline
- **Conflictos:** Pueden ocurrir si múltiples usuarios modifican lo mismo

### 🔒 **Seguridad:**
- **No guardar credenciales** en localStorage
- **Encriptar datos sensibles** si es necesario
- **Validar datos** antes de sincronizar

### 📱 **UX/UI:**
- **Indicadores claros** de estado offline
- **Feedback inmediato** al usuario
- **Progreso de sincronización** visible
- **Manejo de errores** amigable

### 🔧 **Mantenimiento:**
- **Limpiar cache** periódicamente
- **Manejar versiones** de datos
- **Logs detallados** para debugging
- **Métricas** de uso offline

---

## 🎯 Próximos Pasos

### 1. **Implementación Básica:**
1. Crear hooks de conectividad
2. Implementar cache de productos
3. Guardar ventas offline
4. Agregar indicadores visuales

### 2. **Mejoras Avanzadas:**
1. IndexedDB para datos grandes
2. Service Workers para cache avanzado
3. Sincronización inteligente
4. Resolución de conflictos

### 3. **Optimizaciones:**
1. Compresión de datos
2. Sincronización incremental
3. Priorización de datos críticos
4. Limpieza automática de cache

¿Te gustaría que implemente alguna parte específica o que profundice en algún aspecto del modo offline?
