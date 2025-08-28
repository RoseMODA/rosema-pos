/**
 * Funciones helper específicas para productos
 */

import { calculateTotalStock, calculateAveragePrice } from './calculations.js';

/**
 * Filtrar y ordenar productos según criterios
 */
export const filterAndSortProducts = (products, filters = {}) => {
  const {
    searchTerm = '',
    categoryFilter = 'all',
    sortBy = 'created',
    sortOrder = 'asc'
  } = filters;

  let filtered = [...products];

  // Filtrar por categoría
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(product => product.categoria === categoryFilter);
  }

  // Filtrar por término de búsqueda
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(product =>
      product.articulo?.toLowerCase().includes(term) ||
      product.id?.toLowerCase().includes(term) ||
      product.tags?.some(tag => tag.toLowerCase().includes(term)) ||
      // Nuevo: Búsqueda por proveedor (proveedorId)
      (product.proveedorId && product.proveedorId.toString().toLowerCase().includes(term)) ||
      // Nuevo: Búsqueda por talle dentro de las variantes
      (product.variantes && Array.isArray(product.variantes) && 
       product.variantes.some(variant => variant.talle?.toLowerCase().includes(term)))
    );
  }

  // Ordenar
  filtered.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'created':
        // Ordenar por fecha de creación (más recientes primero por defecto)
        aValue = a.createdAt ? new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt) : new Date(0);
        bValue = b.createdAt ? new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt) : new Date(0);
        return bValue - aValue; // Más recientes primero independientemente del sortOrder
      case 'name':
        aValue = a.articulo || '';
        bValue = b.articulo || '';
        break;
      case 'price':
        aValue = a.precioCosto || 0;
        bValue = b.precioCosto || 0;
        break;
      case 'stock':
        aValue = calculateTotalStock(a);
        bValue = calculateTotalStock(b);
        break;
      case 'category':
        aValue = a.categoria || '';
        bValue = b.categoria || '';
        break;
      default:
        // Por defecto, ordenar por fecha de creación
        aValue = a.createdAt ? new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt) : new Date(0);
        bValue = b.createdAt ? new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt) : new Date(0);
        return bValue - aValue;
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  return filtered;
};

/**
 * Buscar productos por término (incluye búsqueda por código de barras)
 */
export const searchProducts = (products, searchTerm) => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase();
  const results = products.filter(product =>
    product.articulo?.toLowerCase().includes(term) ||
    product.id?.toLowerCase().includes(term) ||
    product.codigoBarras?.toLowerCase().includes(term) ||
    product.descripcion?.toLowerCase().includes(term) ||
    product.tags?.some(tag => tag.toLowerCase().includes(term)) ||
    // Nuevo: Búsqueda por proveedor (proveedorId)
    (product.proveedorId && product.proveedorId.toString().toLowerCase().includes(term)) ||
    // Nuevo: Búsqueda por talle dentro de las variantes
    (product.variantes && Array.isArray(product.variantes) && 
     product.variantes.some(variant => variant.talle?.toLowerCase().includes(term)))
  );

  // Priorizar coincidencia exacta con código de barras
  const exactMatch = results.find(p => 
    p.codigoBarras === searchTerm || 
    p.id === searchTerm
  );
  
  if (exactMatch) {
    return [exactMatch, ...results.filter(p => 
      p.codigoBarras !== searchTerm && 
      p.id !== searchTerm
    )];
  }

  return results;
};

/**
 * Obtener nombre del proveedor por ID
 */
export const getProviderName = (providerId, providers) => {
  if (!providerId || !providers) return 'Proveedor no encontrado';
  
  const provider = providers.find(p => p.id === providerId);
  return provider ? provider.proveedor : 'Proveedor no encontrado';
};

/**
 * Verificar si un producto tiene variantes disponibles
 */
export const hasAvailableVariants = (product) => {
  if (!product.variantes || !Array.isArray(product.variantes)) return false;
  return product.variantes.some(variant => variant.stock > 0);
};

/**
 * Obtener variantes disponibles (con stock > 0)
 */
export const getAvailableVariants = (product) => {
  if (!product.variantes || !Array.isArray(product.variantes)) return [];
  return product.variantes.filter(variant => variant.stock > 0);
};

/**
 * Obtener la variante con menor precio
 */
export const getCheapestVariant = (product) => {
  const availableVariants = getAvailableVariants(product);
  if (availableVariants.length === 0) return null;
  
  return availableVariants.reduce((cheapest, current) => 
    (current.precioVenta || 0) < (cheapest.precioVenta || 0) ? current : cheapest
  );
};

/**
 * Obtener la variante con mayor precio
 */
export const getMostExpensiveVariant = (product) => {
  const availableVariants = getAvailableVariants(product);
  if (availableVariants.length === 0) return null;
  
  return availableVariants.reduce((expensive, current) => 
    (current.precioVenta || 0) > (expensive.precioVenta || 0) ? current : expensive
  );
};

/**
 * Obtener rango de precios de un producto
 */
export const getPriceRange = (product) => {
  const availableVariants = getAvailableVariants(product);
  if (availableVariants.length === 0) {
    return { min: 0, max: 0, single: true };
  }

  const prices = availableVariants.map(v => v.precioVenta || 0);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    min,
    max,
    single: min === max
  };
};

/**
 * Formatear rango de precios para mostrar
 */
export const formatPriceRange = (product) => {
  const range = getPriceRange(product);
  
  if (range.single || range.min === range.max) {
    return `$${range.min.toLocaleString()}`;
  }
  
  return `$${range.min.toLocaleString()} - $${range.max.toLocaleString()}`;
};

/**
 * Verificar si un producto está en stock bajo
 */
export const isLowStock = (product, threshold = 5) => {
  const totalStock = calculateTotalStock(product);
  return totalStock > 0 && totalStock <= threshold;
};

/**
 * Verificar si un producto está sin stock
 */
export const isOutOfStock = (product) => {
  const totalStock = calculateTotalStock(product);
  return totalStock === 0;
};

/**
 * Obtener estado del stock de un producto
 */
export const getStockStatus = (product, threshold = 5) => {
  const totalStock = calculateTotalStock(product);
  
  if (totalStock === 0) {
    return {
      status: 'out',
      label: 'Sin Stock',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    };
  }
  
  if (totalStock <= threshold) {
    return {
      status: 'low',
      label: 'Stock Bajo',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    };
  }
  
  return {
    status: 'good',
    label: 'En Stock',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  };
};

/**
 * Agrupar productos por categoría
 */
export const groupProductsByCategory = (products) => {
  return products.reduce((groups, product) => {
    const category = product.categoria || 'Sin categoría';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {});
};

/**
 * Obtener productos más vendidos (requiere datos de ventas)
 */
export const getTopSellingProducts = (products, salesData = []) => {
  const salesCount = {};
  
  // Contar ventas por producto
  salesData.forEach(sale => {
    if (sale.items) {
      sale.items.forEach(item => {
        const productId = item.productId || item.id;
        salesCount[productId] = (salesCount[productId] || 0) + (item.qty || item.quantity || 1);
      });
    }
  });
  
  // Ordenar productos por cantidad vendida
  return products
    .map(product => ({
      ...product,
      totalSold: salesCount[product.id] || 0
    }))
    .sort((a, b) => b.totalSold - a.totalSold);
};

/**
 * Validar si un producto puede ser agregado al carrito
 */
export const canAddToCart = (product, variant = null, quantity = 1) => {
  if (!product) {
    return { canAdd: false, reason: 'Producto no válido' };
  }

  if (!hasAvailableVariants(product)) {
    return { canAdd: false, reason: 'Producto sin stock disponible' };
  }

  if (variant) {
    if (!variant.stock || variant.stock < quantity) {
      return { canAdd: false, reason: 'Stock insuficiente para esta variante' };
    }
  }

  return { canAdd: true, reason: null };
};

/**
 * Generar código de barras único
 */
export const generateBarcode = (prefix = 'POS') => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp.slice(-6)}${random}`;
};
