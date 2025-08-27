// Archivo temporal para debugging del problema de ventas

// El problema está en el mapeo de datos entre useSales.js y salesService.js

// En useSales.js, cuando se agrega un producto al carrito:
// addToCart -> addItem -> lineItem con variant: { talle: ..., color: ... }

// En finalizeSession, se mapea:
// size: item.variant?.talle,
// color: item.variant?.color,

// En salesService.js, validateVariantStock espera:
// validateVariantStock(productId, talle, color, quantity)

// SOLUCION: Agregar logging para ver exactamente qué datos se están pasando

console.log('DEBUG: Estructura esperada en BD:');
console.log({
  id: "m-body07",
  articulo: "body rojo", 
  variantes: [
    {
      talle: "unico",
      color: "rojo", 
      stock: 2,
      precioVenta: 50000
    }
  ]
});

console.log('DEBUG: Estructura en carrito (useSales.js):');
console.log({
  lineItem: {
    productId: "m-body07",
    variant: {
      talle: "unico",
      color: "rojo"
    }
  }
});

console.log('DEBUG: Mapeo en finalizeSession:');
console.log({
  size: "item.variant?.talle", // debería ser "unico"
  color: "item.variant?.color" // debería ser "rojo"
});
