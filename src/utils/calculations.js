/**
 * Funciones de cálculo para el sistema POS Rosema
 */

/**
 * Calcular precio de venta sugerido basado en costo y porcentaje de ganancia
 */
export const calculateSuggestedPrice = (cost, profitPercent) => {
  if (!cost || !profitPercent) return 0;
  const costNum = parseFloat(cost);
  const profitNum = parseFloat(profitPercent);
  return Math.round(costNum * (1 + profitNum / 100));
};

/**
 * Calcular porcentaje de ganancia basado en costo y precio de venta
 */
export const calculateProfitPercent = (cost, salePrice) => {
  if (!cost || !salePrice) return 0;
  const costNum = parseFloat(cost);
  const priceNum = parseFloat(salePrice);
  if (costNum === 0) return 0;
  return Math.round(((priceNum - costNum) / costNum) * 100);
};

/**
 * Calcular stock total de un producto (suma de todas las variantes)
 */
export const calculateTotalStock = (product) => {
  if (!product.variantes || !Array.isArray(product.variantes)) return 0;
  return product.variantes.reduce((sum, variante) => sum + (variante.stock || 0), 0);
};

/**
 * Calcular precio promedio de venta de un producto
 */
export const calculateAveragePrice = (product) => {
  if (!product.variantes || !Array.isArray(product.variantes) || product.variantes.length === 0) {
    return product.precioCosto || 0;
  }
  const total = product.variantes.reduce((sum, variante) => sum + (variante.precioVenta || 0), 0);
  return Math.round(total / product.variantes.length);
};

/**
 * Redondear al múltiplo de 500 más cercano (para ventas)
 */
export const roundToNearest500 = (amount) => {
  return Math.round(amount / 500) * 500;
};

/**
 * Calcular totales de una sesión de venta
 */
export const calculateSaleTotal = (items, discountPercent = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountValue = subtotal * (discountPercent / 100);
  const totalBeforeRounding = subtotal - discountValue;
  const total = roundToNearest500(totalBeforeRounding);

  return {
    subtotal,
    discountValue,
    total: total < 0 ? 0 : total
  };
};

/**
 * Calcular vuelto en efectivo
 */
export const calculateChange = (total, cashReceived) => {
  if (!cashReceived || cashReceived < total) return 0;
  return cashReceived - total;
};

/**
 * Calcular comisión por método de pago
 */
export const calculateCommission = (total, commissionPercent) => {
  if (!commissionPercent || commissionPercent <= 0) return 0;
  return (total * commissionPercent) / 100;
};

/**
 * Calcular neto a recibir después de comisión
 */
export const calculateNetAmount = (total, commissionPercent) => {
  const commission = calculateCommission(total, commissionPercent);
  return total - commission;
};

/**
 * Calcular estadísticas de productos
 */
export const calculateProductStats = (products) => {
  if (!products || !Array.isArray(products)) {
    return {
      totalProducts: 0,
      totalStock: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      categories: {},
      totalCost: 0,
      totalValue: 0,
      expectedProfit: 0
    };
  }

  const stats = {
    totalProducts: products.length,
    totalStock: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    categories: {},
    totalCost: 0,
    totalValue: 0,
    expectedProfit: 0
  };

  products.forEach(product => {
    const stock = calculateTotalStock(product);
    const cost = product.precioCosto || 0;
    const avgSalePrice = calculateAveragePrice(product);

    // acumular stock
    stats.totalStock += stock;

    // acumular costos y valores
    stats.totalCost += stock * cost;
    stats.totalValue += stock * avgSalePrice;

    // stock bajo o agotado
    if (stock === 0) {
      stats.outOfStockProducts++;
    } else if (stock <= 5) {
      stats.lowStockProducts++;
    }

    // categorías
    const category = product.categoria || 'Sin categoría';
    if (!stats.categories[category]) {
      stats.categories[category] = 0;
    }
    stats.categories[category]++;
  });

  // calcular ganancia esperada
  stats.expectedProfit = stats.totalValue - stats.totalCost;

  return stats;
};


/**
 * Calcular valor total del inventario
 */
export const calculateInventoryValue = (products) => {
  if (!products || !Array.isArray(products)) return 0;

  return products.reduce((total, product) => {
    const stock = calculateTotalStock(product);
    const cost = product.precioCosto || 0;
    return total + (stock * cost);
  }, 0);
};

/**
 * Calcular ganancia potencial del inventario
 */
export const calculatePotentialProfit = (products) => {
  if (!products || !Array.isArray(products)) return 0;

  return products.reduce((total, product) => {
    const stock = calculateTotalStock(product);
    const cost = product.precioCosto || 0;
    const avgPrice = calculateAveragePrice(product);
    const profit = avgPrice - cost;
    return total + (stock * profit);
  }, 0);
};

/**
 * Calcular productos con stock bajo (menos de 5 unidades)
 */
export const getLowStockProducts = (products, threshold = 5) => {
  if (!products || !Array.isArray(products)) return [];

  return products.filter(product => {
    const stock = calculateTotalStock(product);
    return stock > 0 && stock <= threshold;
  });
};

/**
 * Calcular productos sin stock
 */
export const getOutOfStockProducts = (products) => {
  if (!products || !Array.isArray(products)) return [];

  return products.filter(product => {
    const stock = calculateTotalStock(product);
    return stock === 0;
  });
};
