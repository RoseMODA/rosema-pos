/**
 * Funciones de formateo para el sistema POS Rosema
 */

/**
 * Formatear precio a formato de moneda local
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number') return '$0';
  return `$${price.toLocaleString()}`;
};

/**
 * Formatear fecha a formato local
 */
export const formatDate = (date) => {
  if (!date) return 'Sin fecha';
  
  const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  return dateObj.toLocaleDateString('es-ES');
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (date) => {
  if (!date) return 'Sin fecha';
  
  const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  return {
    date: dateObj.toLocaleDateString('es-ES'),
    time: dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  };
};

/**
 * Formatear número de teléfono para WhatsApp
 */
export const formatWhatsAppLink = (number) => {
  if (!number) return null;
  const cleanNumber = number.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}`;
};

/**
 * Formatear enlace web
 */
export const formatWebLink = (url) => {
  if (!url) return null;
  return url.startsWith('http') ? url : `https://${url}`;
};

/**
 * Formatear stock con indicador de estado
 */
export const formatStockStatus = (stock) => {
  if (stock === 0) return { status: 'out', label: 'Sin Stock', color: 'red' };
  if (stock <= 5) return { status: 'low', label: 'Stock Bajo', color: 'yellow' };
  return { status: 'good', label: 'En Stock', color: 'green' };
};
