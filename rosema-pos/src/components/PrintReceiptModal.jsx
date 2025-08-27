import React from 'react';
import Receipt from './Receipt';

/**
 * Modal para imprimir recibos de venta
 * ACTUALIZADO para usar el componente Receipt mejorado
 */
const PrintReceiptModal = ({ isOpen, onClose, saleData }) => {
  if (!isOpen || !saleData) return null;

  const handlePrint = () => {
    window.print();
  };

  // Normalizar los datos para el componente Receipt
  const normalizedSaleData = {
    saleNumber: saleData.saleNumber || `VENTA-${Date.now()}`,
    createdAt: saleData.saleDate || saleData.createdAt || new Date(),
    paymentMethod: saleData.paymentMethod || 'Efectivo',
    customerName: saleData.customerName || '',
    items: Array.isArray(saleData.items) ? saleData.items.map(item => ({
      name: item.name || item.nombre || 'Producto',
      code: item.code || item.id || 'N/A',
      quantity: item.quantity || item.qty || 1,
      price: item.price || 0,
      talle: item.talle || (item.variant && item.variant.talle),
      color: item.color || (item.variant && item.variant.color),
      isReturn: item.isReturn || false,
      isQuickItem: item.isQuickItem || false
    })) : [],
    subtotal: saleData.subtotal || 0,
    discount: saleData.discount || saleData.discountValue || 0,
    total: saleData.total || 0,
    cashReceived: saleData.cashReceived || 0,
    change: saleData.change || 0
  };

  return (
    <Receipt
      sale={normalizedSaleData}
      show={isOpen}
      onClose={onClose}
      onPrint={handlePrint}
    />
  );
};

export default PrintReceiptModal;
