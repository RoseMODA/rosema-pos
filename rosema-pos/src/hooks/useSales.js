import { useState, useEffect, useCallback } from 'react';
import {
  processSale,
  getSalesHistory,
  searchSales,
  getSaleById,
  updateSale,
  deleteSale,
  savePendingSale,
  getPendingSale,
  deletePendingSale,
  getSalesStats,
  generateReceiptData
} from '../services/salesService';

/**
 * Hook personalizado para gestión de ventas
 * Proporciona estado y funciones para manejar el carrito y ventas
 */
export const useSales = () => {
  // Estado del carrito actual
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);
  const [customerName, setCustomerName] = useState('');
  
  // Campos adicionales para crédito
  const [cardName, setCardName] = useState('');
  const [installments, setInstallments] = useState(0);
  const [commission, setCommission] = useState(0);
  
  // Estado de ventas
  const [salesHistory, setSalesHistory] = useState([]);
  const [pendingSales, setPendingSales] = useState([]);
  const [activeClient, setActiveClient] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Calcular totales del carrito
   */
  const calculateTotals = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountValue = discountPercent > 0 ? (subtotal * discountPercent / 100) : discountAmount;
    const total = Math.max(0, subtotal - discountValue);
    const change = Math.max(0, cashReceived - total);

    return {
      subtotal,
      discountValue,
      total,
      change,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cart, discountAmount, discountPercent, cashReceived]);

  /**
   * Agregar producto al carrito
   */
  const addToCart = useCallback((product, quantity = 1, size = null, color = null) => {
    const cartItem = {
      id: `${product.id || 'quick'}-${Date.now()}-${Math.random()}`,
      productId: product.id || null,
      name: product.name,
      code: product.code || null,
      price: product.salePrice || product.price,
      quantity: quantity,
      size: size,
      color: color,
      stock: product.stock || null,
      isReturn: product.isReturn || false,
      isQuickItem: !product.id
    };

    setCart(prev => {
      // Verificar si ya existe un item similar (mismo producto, talla y color)
      const existingIndex = prev.findIndex(item => 
        item.productId === cartItem.productId &&
        item.size === cartItem.size &&
        item.color === cartItem.color &&
        !item.isReturn
      );

      if (existingIndex >= 0 && !cartItem.isReturn) {
        // Actualizar cantidad del item existente
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        // Agregar nuevo item
        return [...prev, cartItem];
      }
    });

    return cartItem;
  }, []);

  /**
   * Actualizar cantidad de item en el carrito
   */
  const updateCartItemQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCart(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  }, []);

  /**
   * Eliminar item del carrito
   */
  const removeFromCart = useCallback((itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  }, []);

  /**
   * Limpiar carrito
   */
  const clearCart = useCallback(() => {
    setCart([]);
    setDiscountAmount(0);
    setDiscountPercent(0);
    setCashReceived(0);
    setCustomerName('');
    setCardName('');
    setInstallments(0);
    setCommission(0);
  }, []);

  /**
   * Agregar artículo rápido
   */
  const addQuickItem = useCallback((itemData) => {
    const quickItem = {
      id: `quick-${Date.now()}-${Math.random()}`,
      productId: null,
      name: itemData.name,
      code: null,
      price: itemData.price,
      quantity: itemData.quantity || 1,
      size: itemData.size || null,
      color: null,
      stock: null,
      isReturn: false,
      isQuickItem: true
    };

    setCart(prev => [...prev, quickItem]);
    return quickItem;
  }, []);

  /**
   * Agregar item de devolución
   */
  const addReturnItem = useCallback((returnData) => {
    const returnItem = {
      id: `return-${Date.now()}-${Math.random()}`,
      productId: returnData.productId,
      name: `DEVOLUCIÓN: ${returnData.name}`,
      code: returnData.code,
      price: -Math.abs(returnData.price), // Precio negativo
      quantity: returnData.quantity,
      size: returnData.size,
      color: returnData.color,
      stock: null,
      isReturn: true,
      isQuickItem: false
    };

    setCart(prev => [...prev, returnItem]);
    return returnItem;
  }, []);

  /**
   * Procesar venta
   */
  const completeSale = useCallback(async () => {
    if (cart.length === 0) {
      throw new Error('El carrito está vacío');
    }

    const totals = calculateTotals();
    
    if (totals.total <= 0) {
      throw new Error('El total debe ser mayor a cero');
    }

    // Validaciones específicas para crédito
    if (paymentMethod === 'Crédito' && !cardName.trim()) {
      throw new Error('El nombre de la tarjeta es requerido para pagos con crédito');
    }

    setLoading(true);
    setError(null);

    try {
      const saleData = {
        items: cart,
        paymentMethod,
        discount: totals.discountValue,
        total: totals.total,
        cashReceived,
        change: totals.change,
        customerName,
        clientId: activeClient,
        // Campos adicionales para crédito
        cardName: paymentMethod === 'Crédito' ? cardName : null,
        installments: paymentMethod === 'Crédito' ? installments : null,
        commission: paymentMethod === 'Crédito' ? commission : null
      };

      const completedSale = await processSale(saleData);
      
      // Limpiar carrito después de la venta exitosa
      clearCart();
      
      // Eliminar venta en espera del cliente actual
      try {
        await deletePendingSale(activeClient);
      } catch (err) {
        console.log('No había venta en espera para eliminar');
      }
      
      // Actualizar historial
      setSalesHistory(prev => [completedSale, ...prev]);

      return completedSale;
    } catch (err) {
      setError(err.message);
      console.error('Error al procesar venta:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart, paymentMethod, calculateTotals, cashReceived, customerName, activeClient, cardName, installments, commission, clearCart]);

  /**
   * Cargar historial de ventas
   */
  const loadSalesHistory = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const history = await getSalesHistory(filters);
      setSalesHistory(history);
      return history;
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar historial:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar ventas
   */
  const searchSalesHistory = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);

    try {
      const results = await searchSales(searchTerm);
      setSalesHistory(results);
      return results;
    } catch (err) {
      setError(err.message);
      console.error('Error al buscar ventas:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar venta del historial
   */
  const deleteSaleFromHistory = useCallback(async (saleId) => {
    setLoading(true);
    setError(null);

    try {
      await deleteSale(saleId);
      setSalesHistory(prev => prev.filter(sale => sale.id !== saleId));
      return saleId;
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar venta:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Guardar venta en espera
   */
  const savePendingSaleData = useCallback(async (clientId) => {
    if (cart.length === 0) {
      return null;
    }

    try {
      const totals = calculateTotals();
      const saleData = {
        items: cart,
        paymentMethod,
        discount: totals.discountValue,
        total: totals.total,
        customerName
      };

      const saved = await savePendingSale(clientId, saleData);
      
      // Actualizar estado local de ventas pendientes
      setPendingSales(prev => {
        const updated = prev.filter(sale => sale.clientId !== clientId);
        return [...updated, saved];
      });

      return saved;
    } catch (err) {
      setError(err.message);
      console.error('Error al guardar venta en espera:', err);
      throw err;
    }
  }, [cart, paymentMethod, calculateTotals, customerName]);

  /**
   * Cargar venta en espera
   */
  const loadPendingSaleData = useCallback(async (clientId) => {
    try {
      const pendingSale = await getPendingSale(clientId);
      
      if (pendingSale) {
        setCart(pendingSale.items || []);
        setPaymentMethod(pendingSale.paymentMethod || 'Efectivo');
        setCustomerName(pendingSale.customerName || '');
        setCardName(pendingSale.cardName || '');
        setInstallments(pendingSale.installments || 0);
        setCommission(pendingSale.commission || 0);
        // Los descuentos se recalcularán automáticamente
      } else {
        // Si no hay venta en espera, limpiar todo
        clearCart();
      }

      return pendingSale;
    } catch (err) {
      console.error('Error al cargar venta en espera:', err);
      // En caso de error, limpiar carrito para evitar datos inconsistentes
      clearCart();
      return null;
    }
  }, [clearCart]);

  /**
   * Cambiar cliente activo
   */
  const changeActiveClient = useCallback(async (clientId) => {
    try {
      // Guardar venta actual si hay items
      if (cart.length > 0) {
        const totals = calculateTotals();
        const saleData = {
          items: cart,
          paymentMethod,
          discount: totals.discountValue,
          total: totals.total,
          customerName,
          cardName,
          installments,
          commission
        };
        await savePendingSale(activeClient, saleData);
      }

      // Cambiar cliente activo
      setActiveClient(clientId);
      
      // Cargar venta en espera del nuevo cliente (o limpiar si no existe)
      await loadPendingSaleData(clientId);
    } catch (err) {
      console.error('Error al cambiar cliente activo:', err);
      setError('Error al cambiar de cliente');
    }
  }, [cart, paymentMethod, customerName, cardName, installments, commission, activeClient, calculateTotals, loadPendingSaleData]);

  /**
   * Eliminar cliente/venta en espera
   */
  const deletePendingSaleData = useCallback(async (clientId) => {
    try {
      await deletePendingSale(clientId);
      setPendingSales(prev => prev.filter(sale => sale.clientId !== clientId));
      
      // Si es el cliente activo, limpiar carrito
      if (clientId === activeClient) {
        clearCart();
      }

      return clientId;
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar venta en espera:', err);
      throw err;
    }
  }, [activeClient, clearCart]);

  /**
   * Generar datos para recibo
   */
  const generateReceipt = useCallback((sale) => {
    return generateReceiptData(sale);
  }, []);

  /**
   * Obtener estadísticas de ventas
   */
  const getSalesStatistics = useCallback(async (period = 'today') => {
    try {
      const stats = await getSalesStats(period);
      return stats;
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageSale: 0,
        paymentMethods: {},
        topProducts: {}
      };
    }
  }, []);

  // Calcular totales automáticamente cuando cambie el carrito
  const totals = calculateTotals();

  return {
    // Estado del carrito
    cart,
    paymentMethod,
    discountAmount,
    discountPercent,
    cashReceived,
    customerName,
    cardName,
    installments,
    commission,
    totals,
    
    // Estado de ventas
    salesHistory,
    pendingSales,
    activeClient,
    loading,
    error,
    
    // Funciones del carrito
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    addQuickItem,
    addReturnItem,
    
    // Funciones de venta
    completeSale,
    loadSalesHistory,
    searchSalesHistory,
    deleteSaleFromHistory,
    
    // Funciones de ventas en espera
    savePendingSaleData,
    loadPendingSaleData,
    changeActiveClient,
    deletePendingSaleData,
    
    // Setters
    setPaymentMethod,
    setDiscountAmount,
    setDiscountPercent,
    setCashReceived,
    setCustomerName,
    setActiveClient,
    setCardName,
    setInstallments,
    setCommission,
    
    // Utilidades
    generateReceipt,
    getSalesStatistics
  };
};

export default useSales;
