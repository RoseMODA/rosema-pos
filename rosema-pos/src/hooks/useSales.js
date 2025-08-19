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
 * Hook personalizado para gestión de ventas con sesiones independientes
 * Cada cliente mantiene su propia sesión completamente aislada
 */
export const useSales = () => {
  // Estado de sesiones múltiples - cada cliente tiene su sesión independiente
  const [clientSessions, setClientSessions] = useState({
    1: {
      cart: [],
      paymentMethod: 'Efectivo',
      discountAmount: 0,
      discountPercent: 0,
      cashReceived: 0,
      customerName: '',
      cardName: '',
      installments: 0,
      commission: 0
    }
  });
  
  // Estado de ventas
  const [salesHistory, setSalesHistory] = useState([]);
  const [pendingSales, setPendingSales] = useState([]);
  const [activeClient, setActiveClient] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener sesión del cliente activo
  const getCurrentSession = useCallback(() => {
    return clientSessions[activeClient] || {
      cart: [],
      paymentMethod: 'Efectivo',
      discountAmount: 0,
      discountPercent: 0,
      cashReceived: 0,
      customerName: '',
      cardName: '',
      installments: 0,
      commission: 0
    };
  }, [clientSessions, activeClient]);

  // Estados derivados de la sesión actual
  const currentSession = getCurrentSession();
  const cart = currentSession.cart;
  const paymentMethod = currentSession.paymentMethod;
  const discountAmount = currentSession.discountAmount;
  const discountPercent = currentSession.discountPercent;
  const cashReceived = currentSession.cashReceived;
  const customerName = currentSession.customerName;
  const cardName = currentSession.cardName;
  const installments = currentSession.installments;
  const commission = currentSession.commission;

  /**
   * Actualizar sesión del cliente activo
   */
  const updateCurrentSession = useCallback((updates) => {
    setClientSessions(prev => ({
      ...prev,
      [activeClient]: {
        ...prev[activeClient],
        ...updates
      }
    }));
  }, [activeClient]);

  /**
   * Crear nueva sesión para un cliente
   */
  const createClientSession = useCallback((clientId) => {
    setClientSessions(prev => ({
      ...prev,
      [clientId]: {
        cart: [],
        paymentMethod: 'Efectivo',
        discountAmount: 0,
        discountPercent: 0,
        cashReceived: 0,
        customerName: '',
        cardName: '',
        installments: 0,
        commission: 0
      }
    }));
  }, []);

  /**
   * Calcular totales del carrito actual
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
   * Agregar producto al carrito del cliente activo
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

    const currentCart = cart;
    
    // Verificar si ya existe un item similar (mismo producto, talla y color)
    const existingIndex = currentCart.findIndex(item => 
      item.productId === cartItem.productId &&
      item.size === cartItem.size &&
      item.color === cartItem.color &&
      !item.isReturn
    );

    let newCart;
    if (existingIndex >= 0 && !cartItem.isReturn) {
      // Actualizar cantidad del item existente
      newCart = [...currentCart];
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: newCart[existingIndex].quantity + quantity
      };
    } else {
      // Agregar nuevo item
      newCart = [...currentCart, cartItem];
    }

    updateCurrentSession({ cart: newCart });
    return cartItem;
  }, [cart, updateCurrentSession]);

  /**
   * Actualizar cantidad de item en el carrito
   */
  const updateCartItemQuantity = useCallback((itemId, newQuantity) => {
    let newCart;
    if (newQuantity <= 0) {
      newCart = cart.filter(item => item.id !== itemId);
    } else {
      newCart = cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
    }
    updateCurrentSession({ cart: newCart });
  }, [cart, updateCurrentSession]);

  /**
   * Eliminar item del carrito
   */
  const removeFromCart = useCallback((itemId) => {
    const newCart = cart.filter(item => item.id !== itemId);
    updateCurrentSession({ cart: newCart });
  }, [cart, updateCurrentSession]);

  /**
   * Limpiar carrito del cliente activo
   */
  const clearCart = useCallback(() => {
    updateCurrentSession({
      cart: [],
      discountAmount: 0,
      discountPercent: 0,
      cashReceived: 0,
      customerName: '',
      cardName: '',
      installments: 0,
      commission: 0
    });
  }, [updateCurrentSession]);

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

    const newCart = [...cart, quickItem];
    updateCurrentSession({ cart: newCart });
    return quickItem;
  }, [cart, updateCurrentSession]);

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

    const newCart = [...cart, returnItem];
    updateCurrentSession({ cart: newCart });
    return returnItem;
  }, [cart, updateCurrentSession]);

  /**
   * Setters para la sesión actual
   */
  const setPaymentMethod = useCallback((value) => {
    updateCurrentSession({ paymentMethod: value });
  }, [updateCurrentSession]);

  const setDiscountAmount = useCallback((value) => {
    updateCurrentSession({ discountAmount: value });
  }, [updateCurrentSession]);

  const setDiscountPercent = useCallback((value) => {
    updateCurrentSession({ discountPercent: value });
  }, [updateCurrentSession]);

  const setCashReceived = useCallback((value) => {
    updateCurrentSession({ cashReceived: value });
  }, [updateCurrentSession]);

  const setCustomerName = useCallback((value) => {
    updateCurrentSession({ customerName: value });
  }, [updateCurrentSession]);

  const setCardName = useCallback((value) => {
    updateCurrentSession({ cardName: value });
  }, [updateCurrentSession]);

  const setInstallments = useCallback((value) => {
    updateCurrentSession({ installments: value });
  }, [updateCurrentSession]);

  const setCommission = useCallback((value) => {
    updateCurrentSession({ commission: value });
  }, [updateCurrentSession]);

  /**
   * Cambiar cliente activo
   */
  const changeActiveClient = useCallback(async (clientId) => {
    try {
      // Guardar sesión actual en Firebase si hay items
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
      
      // Si no existe la sesión del cliente, crearla
      if (!clientSessions[clientId]) {
        createClientSession(clientId);
      }

      // Cargar datos desde Firebase si existen
      try {
        const pendingSale = await getPendingSale(clientId);
        if (pendingSale) {
          setClientSessions(prev => ({
            ...prev,
            [clientId]: {
              cart: pendingSale.items || [],
              paymentMethod: pendingSale.paymentMethod || 'Efectivo',
              discountAmount: 0, // Los descuentos se recalculan
              discountPercent: 0,
              cashReceived: 0,
              customerName: pendingSale.customerName || '',
              cardName: pendingSale.cardName || '',
              installments: pendingSale.installments || 0,
              commission: pendingSale.commission || 0
            }
          }));
        }
      } catch (err) {
        console.log('No hay venta en espera para este cliente');
      }
    } catch (err) {
      console.error('Error al cambiar cliente activo:', err);
      setError('Error al cambiar de cliente');
    }
  }, [cart, paymentMethod, customerName, cardName, installments, commission, activeClient, calculateTotals, clientSessions, createClientSession]);

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
      
      // Limpiar sesión del cliente actual
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
   * Eliminar cliente/venta en espera
   */
  const deletePendingSaleData = useCallback(async (clientId) => {
    try {
      await deletePendingSale(clientId);
      setPendingSales(prev => prev.filter(sale => sale.clientId !== clientId));
      
      // Eliminar sesión del cliente
      setClientSessions(prev => {
        const newSessions = { ...prev };
        delete newSessions[clientId];
        return newSessions;
      });

      return clientId;
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar venta en espera:', err);
      throw err;
    }
  }, []);

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
   * Guardar venta en espera (legacy - mantenido para compatibilidad)
   */
  const savePendingSaleData = useCallback(async (clientId) => {
    const session = clientSessions[clientId];
    if (!session || session.cart.length === 0) {
      return null;
    }

    try {
      const totals = calculateTotals();
      const saleData = {
        items: session.cart,
        paymentMethod: session.paymentMethod,
        discount: totals.discountValue,
        total: totals.total,
        customerName: session.customerName,
        cardName: session.cardName,
        installments: session.installments,
        commission: session.commission
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
  }, [clientSessions, calculateTotals]);

  /**
   * Cargar venta en espera (legacy - mantenido para compatibilidad)
   */
  const loadPendingSaleData = useCallback(async (clientId) => {
    try {
      const pendingSale = await getPendingSale(clientId);
      
      if (pendingSale) {
        setClientSessions(prev => ({
          ...prev,
          [clientId]: {
            cart: pendingSale.items || [],
            paymentMethod: pendingSale.paymentMethod || 'Efectivo',
            discountAmount: 0,
            discountPercent: 0,
            cashReceived: 0,
            customerName: pendingSale.customerName || '',
            cardName: pendingSale.cardName || '',
            installments: pendingSale.installments || 0,
            commission: pendingSale.commission || 0
          }
        }));
      }

      return pendingSale;
    } catch (err) {
      console.error('Error al cargar venta en espera:', err);
      return null;
    }
  }, []);

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
    // Estado del carrito (sesión actual)
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
    getSalesStatistics,
    
    // Funciones de sesiones
    createClientSession,
    clientSessions
  };
};

export default useSales;
