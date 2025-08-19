# TODO - Etapa 3: Sistema de Ventas

## Objetivo

Implementar sistema completo de ventas con carrito, pagos y gestión de stock.

## Funcionalidades a Implementar según plan.md:

### 1. Búsqueda y Carrito

- [ ] Buscar productos por código o nombre (Firestore)
- [ ] Carrito con modificación de cantidades
- [ ] Cálculo automático de totales
- [ ] Descuento general ($ o %)

### 2. Métodos de Pago

- [ ] Efectivo
- [ ] Transferencia
- [ ] Débito
- [ ] Crédito
- [ ] QR

### 3. Gestión de Ventas

- [ ] Guardar venta en Firestore
- [ ] Descontar stock automáticamente
- [ ] Botón devolución (cambio de prenda) con actualización de stock
- [ ] Botón "artículo rápido" para productos no registrados:
  - Nombre
  - Talla (opcional)
  - Precio
  - Cantidad

### 4. Historial y Recibos

- [ ] CRUD de historial de ventas
- [ ] Imprimir recibo con:
  - Logo de Rosema
  - Datos de contacto (WhatsApp 260 438-1502, Salto de las Rosas)
  - Detalle de productos
  - Total y descuentos
  - Aviso: "Cambios en 3 días hábiles"

### 5. Ventas en Espera

- [ ] Crear múltiples ventas abiertas
- [ ] Identificadores: Cliente 1, Cliente 2, etc.
- [ ] Cambiar entre ventas activas
- [ ] Finalizar o cancelar ventas pendientes

## Archivos a Crear/Modificar:

- `src/pages/Sales.jsx` (modificar completamente)
- `src/components/SalesCart.jsx` (nuevo)
- `src/components/ProductSearch.jsx` (nuevo)
- `src/components/PaymentMethods.jsx` (nuevo)
- `src/components/QuickProduct.jsx` (nuevo)
- `src/components/SalesHistory.jsx` (nuevo)
- `src/components/Receipt.jsx` (nuevo)
- `src/hooks/useSales.js` (nuevo)
- `src/hooks/useProducts.js` (nuevo)
- `src/services/salesService.js` (nuevo)
- `src/services/productsService.js` (nuevo)

## Plan de Implementación:

1. ⏳ Crear servicios de Firebase para productos y ventas
2. ⏳ Crear hooks personalizados para gestión de estado
3. ⏳ Implementar búsqueda de productos
4. ⏳ Crear componente de carrito de compras
5. ⏳ Implementar métodos de pago
6. ⏳ Crear sistema de artículos rápidos
7. ⏳ Implementar ventas en espera
8. ⏳ Crear sistema de recibos
9. ⏳ Implementar historial de ventas
10. ⏳ Testing y ajustes finales
