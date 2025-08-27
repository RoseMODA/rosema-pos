// Versión de debugging de useSales.js para identificar el problema

// El problema está en finalizeSession donde se mapean los datos para salesService.js
// Necesito agregar logging para ver exactamente qué se está pasando

// PROBLEMA IDENTIFICADO:
// 1. addToCart pasa: size: variant.talle, color: variant.color
// 2. addItem crea: variant: { talle: itemData.size, color: itemData.color }
// 3. finalizeSession mapea: size: item.variant?.talle, color: item.variant?.color
// 4. salesService.js recibe: size y color
// 5. validateVariantStock busca en BD: talle y color

// SOLUCION: En finalizeSession, agregar logging y verificar que los datos se pasen correctamente

const debugFinalizeSession = (session) => {
  console.log('🔍 DEBUG: Iniciando finalizeSession');
  console.log('📦 Items en sesión:', session.items);
  
  session.items.forEach((item, index) => {
    console.log(`📋 Item ${index}:`, {
      productId: item.productId,
      name: item.nombre || item.name,
      variant: item.variant,
      isQuickItem: item.isQuickItem
    });
    
    if (item.productId && !item.isQuickItem) {
      console.log(`🎯 Item ${index} será validado:`, {
        productId: item.productId,
        talle: item.variant?.talle,
        color: item.variant?.color,
        quantity: item.qty
      });
    }
  });
  
  const saleData = {
    items: session.items.map(item => {
      const mappedItem = {
        productId: item.productId,
        name: item.nombre || item.name,
        code: item.code,
        price: item.price,
        quantity: item.qty,
        size: item.variant?.talle,  // Esto debería ser "unico" para tu ejemplo
        color: item.variant?.color, // Esto debería ser "rojo" para tu ejemplo
        subtotal: item.price * item.qty,
        isReturn: item.isReturn || false,
        isQuickItem: item.isQuickItem || false
      };
      
      console.log('🔄 Mapeando item:', {
        original: item,
        mapped: mappedItem
      });
      
      return mappedItem;
    })
  };
  
  console.log('📤 SaleData final:', saleData);
  return saleData;
};

export { debugFinalizeSession };
