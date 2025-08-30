# 🛒 Sistema de Ventas - Rosema POS

## 📋 Resumen de Implementación

He implementado un **sistema completo de ventas** conectado a Firestore con gestión de productos, variantes y actualización automática de stock.

## 🎯 Funcionalidades Implementadas

### ✅ **Búsqueda de Productos**
- **Búsqueda por código de barras** (exacto)
- **Búsqueda por nombre** del producto
- **Resultados en tiempo real**
- **Integración con colección `productos`**

### ✅ **Gestión de Variantes**
- **Selección de talla y color** específicos
- **Validación de stock** por variante
- **Precios por variante** (precioVenta)
- **Control de stock disponible**

### ✅ **Carrito de Ventas**
- **Agregar múltiples productos** y variantes
- **Control de cantidades** con validación de stock
- **Cálculo automático** de subtotales
- **Aplicación de descuentos**
- **Múltiples métodos de pago**

### ✅ **Procesamiento de Ventas**
- **Validación de stock** antes de procesar
- **Actualización automática** del stock en Firestore
- **Guardado en colección `ventas`** con estructura completa
- **Transacciones atómicas** (batch operations)

### ✅ **Historial de Ventas**
- **Listado completo** de ventas realizadas
- **Filtros avanzados** por fecha, producto, proveedor
- **Búsqueda por cliente** y método de pago
- **Estadísticas** (hoy, semana, mes)
- **Paginación** para mejor rendimiento

## 🗂️ Archivos Principales

### **1. Servicios**
- **`src/services/salesService.js`** - Lógica completa de ventas
  - Búsqueda de productos
  - Validación de stock
  - Procesamiento de ventas
  - Actualización de stock
  - Historial y estadísticas

### **2. Componentes**
- **`src/components/SalesInterface.jsx`** - Interfaz principal de ventas
  - Búsqueda de productos
  - Selección de variantes
  - Gestión del carrito
  - Procesamiento de pagos

- **`src/components/SalesHistory.jsx`** - Historial de ventas
  - Filtros avanzados
  - Estadísticas
  - Paginación
  - Búsquedas

### **3. Páginas**
- **`src/pages/SalesNew.jsx`** - Nueva página de ventas
  - Integra SalesInterface y SalesHistory
  - Navegación por tabs
  - Notificaciones de ventas

## 🔧 Estructura de Datos

### **Colección `ventas`**
```javascript
{
  saleNumber: "20241201-001",
  items: [
    {
      productId: "M-BODY02",
      productName: "Body Manga Larga",
      articulo: "Body Manga Larga",
      talla: "M",
      color: "Negro",
      price: 15000,
      quantity: 2,
      subtotal: 30000,
      proveedorId: "prov123",
      providerName: "Proveedor ABC"
    }
  ],
  paymentMethod: "Efectivo",
  discount: 10,
  subtotal: 30000,
  total: 27000,
  cashReceived: 30000,
  change: 3000,
  customerName: "Juan Pérez",
  createdAt: Timestamp,
  status: "completed"
}
```

### **Actualización de Stock**
```javascript
// En productos, se actualiza la variante específica
{
  variantes: [
    {
      talla: "M",
      color: "Negro",
      stock: 8, // Se reduce automáticamente
      precioVenta: 15000
    }
  ]
}
```

## 🚀 Cómo Usar el Sistema

### **1. Acceder al Sistema**
```
http://localhost:8017/sales-new
```

### **2. Realizar una Venta**
1. **Buscar producto** por código o nombre
2. **Seleccionar variante** (talla/color)
3. **Agregar al carrito** con cantidad deseada
4. **Configurar pago** (método, descuento, cliente)
5. **Procesar venta** - Stock se actualiza automáticamente

### **3. Ver Historial**
1. Cambiar a tab **"Historial"**
2. **Filtrar** por fecha, producto, proveedor
3. **Ver estadísticas** de ventas
4. **Paginar** resultados

## 🔍 Funciones Clave del Servicio

### **Búsqueda de Productos**
```javascript
// Buscar por código o nombre
const products = await searchProductsForSale("M-BODY");

// Obtener por código exacto
const product = await getProductByBarcode("M-BODY02");
```

### **Validar Stock**
```javascript
// Validar stock de variante específica
const validation = await validateVariantStock(
  "M-BODY02", 
  "M", 
  "Negro", 
  2
);
```

### **Procesar Venta**
```javascript
const saleData = {
  items: [
    {
      productId: "M-BODY02",
      productName: "Body Manga Larga",
      talla: "M",
      color: "Negro",
      price: 15000,
      quantity: 2
    }
  ],
  paymentMethod: "Efectivo",
  total: 30000
};

const result = await processSale(saleData);
```

## 📊 Características Técnicas

### **✅ Validaciones**
- Stock disponible antes de agregar al carrito
- Stock suficiente antes de procesar venta
- Datos requeridos para completar venta

### **✅ Transacciones Atómicas**
- Uso de `writeBatch` para operaciones múltiples
- Garantiza consistencia de datos
- Rollback automático en caso de error

### **✅ Optimización**
- Búsquedas eficientes con índices
- Paginación en historial
- Carga lazy de datos

### **✅ Manejo de Errores**
- Validaciones exhaustivas
- Mensajes de error claros
- Recuperación de errores

## 🎯 Próximos Pasos

1. **Probar el sistema** en http://localhost:8017/sales-new
2. **Crear algunos productos** con variantes
3. **Realizar ventas de prueba**
4. **Verificar actualización de stock**
5. **Revisar historial de ventas**

## 🔗 Integración Completa

El sistema está **completamente integrado** con:
- ✅ **Productos** con variantes (talla, color, stock)
- ✅ **Proveedores** (se incluye en ventas)
- ✅ **Firestore** (colecciones productos y ventas)
- ✅ **Actualización automática** de stock
- ✅ **Validaciones** de negocio
- ✅ **Interfaz moderna** y responsive

**¡El sistema de ventas está listo para usar!** 🚀
