/**
 * Funciones helper específicas para ventas
 */

import { roundToNearest500, calculateSaleTotal } from './calculations.js';
import dayjs from "dayjs";

/**
 * Buscar productos con prioridad por código de barras
 */
export const searchProductsWithPriority = (products, searchTerm) => {
  if (!searchTerm.trim()) return [];

  const term = searchTerm.toLowerCase();
  const results = products.filter(product =>
    product.articulo?.toLowerCase().includes(term) ||
    product.id?.toLowerCase().includes(term) ||
    product.codigoBarras?.toLowerCase().includes(term) ||
    product.tags?.some(tag => tag.toLowerCase().includes(term))
  );

  // Priorizar coincidencia exacta con código de barras
  const exactMatch = results.find(p => p.codigoBarras === searchTerm || p.id === searchTerm);
  if (exactMatch) {
    return [exactMatch, ...results.filter(p => p.codigoBarras !== searchTerm && p.id !== searchTerm)];
  }

  return results;
};

/**
 * Obtener variantes disponibles (con stock > 0)
 */
export const getAvailableVariants = (product) => {
  if (!product.variantes || !Array.isArray(product.variantes)) return [];
  return product.variantes.filter(variant => variant.stock > 0);
};

/**
 * Verificar si un producto puede ser agregado al carrito
 */
export const canAddProductToCart = (product) => {
  if (!product) {
    return { canAdd: false, reason: 'Producto no válido' };
  }

  if (!product.variantes || product.variantes.length === 0) {
    return { canAdd: false, reason: 'El producto no tiene variantes disponibles' };
  }

  const availableVariants = getAvailableVariants(product);
  if (availableVariants.length === 0) {
    return { canAdd: false, reason: 'Producto sin stock disponible en ninguna variante' };
  }

  return { canAdd: true, availableVariants };
};

/**
 * Calcular totales de sesión con redondeo
 */
export const calculateSessionTotal = (session) => {
  if (!session) return { subtotal: 0, discountValue: 0, total: 0 };

  const subtotal = session.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountValue = subtotal * (session.discountPercent / 100);
  const totalBeforeRounding = subtotal - discountValue;
  const total = roundToNearest500(totalBeforeRounding);

  return {
    subtotal,
    discountValue,
    total: total < 0 ? 0 : total
  };
};

/**
 * Convertir sesiones a formato para UI
 */
export const formatSessionsForUI = (sessions) => {
  return Object.values(sessions).map(session => {
    const sessionTotals = calculateSessionTotal(session);
    return {
      id: session.id,
      name: session.label,
      total: sessionTotals.total,
      items: session.items || []
    };
  });
};

/**
 * Preparar datos para recibo
 */
export const prepareReceiptData = (cart, totals, paymentMethod, customerName, cashReceived,customSaleDate = null) => {

    // customSaleDate puede ser Date o string "YYYY-MM-DD"
  let dateToUse;
  if (customSaleDate instanceof Date) {
    dateToUse = customSaleDate;
  } else if (customSaleDate) {
    dateToUse = dayjs(customSaleDate).toDate();
  } else {
    dateToUse = new Date();
  }       // por defecto, ahora mismo
  return {
    saleNumber: `PREV-${Date.now()}`, // Número temporal para vista previa
    items: cart.map(item => ({
      name: item.nombre || item.name,
      code: item.productId || item.id || 'N/A',
      quantity: item.qty || item.quantity || 1,
      price: item.price || 0,
      talle: item.variant?.talle,
      color: item.variant?.color,
      isReturn: item.isReturn || false,
      isQuickItem: item.isQuickItem || false
    })),
    customerName: customerName || '',
    paymentMethod: paymentMethod || 'Efectivo',
    subtotal: totals.subtotal || 0,
    discount: totals.discountValue || 0,
    discountValue: totals.discountValue || 0,
    total: totals.total || 0,
    cashReceived: cashReceived || 0,
    change: totals.change || 0,
    saleDate: dateToUse,
    createdAt: dateToUse
  };
};

/**
 * Validar venta antes de procesar
 */
export const validateSaleBeforeProcessing = (cart, totals) => {
  if (cart.length === 0) {
    return { isValid: false, message: 'El carrito está vacío' };
  }

  if (totals.total < 0) {
    return { isValid: false, message: 'El total no puede ser negativo' };
  }

  return { isValid: true, message: null };
};

/**
 * Generar mensaje de confirmación de venta
 */
export const generateSaleConfirmationMessage = (totals, paymentMethod, discountPercent) => {
  return `¿Confirmar venta por $${totals.total.toLocaleString()}?\n\nMétodo de pago: ${paymentMethod}\nDescuento: ${discountPercent}%\nTotal: $${totals.total.toLocaleString()}`;
};

/**
 * Calcular información de comisión
 */
export const calculateCommissionInfo = (total, commission) => {
  if (!commission || commission <= 0) {
    return { commissionAmount: 0, netAmount: total };
  }

  const commissionAmount = (total * commission) / 100;
  const netAmount = total - commissionAmount;

  return {
    commissionAmount,
    netAmount
  };
};

/**
 * Formatear rango de precios para variantes
 */
export const formatVariantPriceRange = (variants) => {
  if (!variants || variants.length === 0) return 'Sin precio';

  const prices = variants.map(v => v.precioVenta || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    return `$${minPrice.toLocaleString()}`;
  }

  return `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
};
