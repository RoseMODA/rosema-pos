import { useState, useEffect } from "react";
import {
  createSale,
  getAllSales,
  getSalesByDateRange,
  createPendingSale,
  getPendingSales,
  completePendingSale,
  cancelPendingSale,
  processReturn,
  getSalesStats,
} from "../services/salesService";

/**
 * Hook personalizado para gestión de ventas
 * Maneja el estado del carrito, ventas y operaciones relacionadas
 */
export const useSales = () => {
  // Estado del carrito actual
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState({ type: "percentage", value: 0 });
  const [paymentMethod, setPaymentMethod] = useState("efectivo");

  // Estado de ventas
  const [sales, setSales] = useState([]);
  const [pendingSales, setPendingSales] = useState([]);
  const [currentPendingSale, setCurrentPendingSale] = useState(null);

  // Estado de carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estadísticas
  const [salesStats, setSalesStats] = useState({
    dailyTotal: 0,
    dailyCount: 0,
    monthlyTotal: 0,
    monthlyCount: 0,
  });

  /**
   * Agregar producto al carrito
   * @param {Object} product - Producto a agregar
   * @param {number} quantity - Cantidad
   * @param {string} size - Talla (opcional)
   * @param {string} color - Color (opcional)
   */
  const addToCart = (product, quantity = 1, size = null, color = null) => {
    try {
      setError(null);

      const cartItem = {
        id: `${product.id}-${size || "no-size"}-${
          color || "no-color"
        }-${Date.now()}`,
        productId: product.id,
        name: product.name,
        code: product.code,
        price: product.salePrice,
        quantity,
        size,
        color,
        stock: product.stock,
        isQuickItem: false,
      };

      setCart((prevCart) => [...prevCart, cartItem]);
    } catch (err) {
      setError("Error al agregar producto al carrito");
      console.error("Error al agregar al carrito:", err);
    }
  };

  /**
   * Agregar artículo rápido al carrito
   * @param {Object} quickItem - Artículo rápido {name, price, quantity, size}
   */
  const addQuickItemToCart = (quickItem) => {
    try {
      setError(null);

      const cartItem = {
        id: `quick-${Date.now()}`,
        productId: null,
        name: quickItem.name,
        code: null,
        price: quickItem.price,
        quantity: quickItem.quantity,
        size: quickItem.size || null,
        color: null,
        stock: null,
        isQuickItem: true,
      };

      setCart((prevCart) => [...prevCart, cartItem]);
    } catch (err) {
      setError("Error al agregar artículo rápido");
      console.error("Error al agregar artículo rápido:", err);
    }
  };

  /**
   * Actualizar cantidad de un item en el carrito
   * @param {string} itemId - ID del item
   * @param {number} newQuantity - Nueva cantidad
   */
  const updateCartItemQuantity = (itemId, newQuantity) => {
    try {
      setError(null);

      if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      setError("Error al actualizar cantidad");
      console.error("Error al actualizar cantidad:", err);
    }
  };

  /**
   * Remover item del carrito
   * @param {string} itemId - ID del item a remover
   */
  const removeFromCart = (itemId) => {
    try {
      setError(null);
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    } catch (err) {
      setError("Error al remover producto del carrito");
      console.error("Error al remover del carrito:", err);
    }
  };

  /**
   * Limpiar carrito
   */
  const clearCart = () => {
    setCart([]);
    setDiscount({ type: "percentage", value: 0 });
    setPaymentMethod("efectivo");
  };

  /**
   * Calcular subtotal del carrito
   * @returns {number} Subtotal
   */
  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  /**
   * Calcular descuento
   * @returns {number} Monto del descuento
   */
  const getDiscountAmount = () => {
    const subtotal = getSubtotal();
    if (discount.type === "percentage") {
      return (subtotal * discount.value) / 100;
    } else {
      return Math.min(discount.value, subtotal);
    }
  };

  /**
   * Calcular total del carrito
   * @returns {number} Total
   */
  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscountAmount());
  };

  /**
   * Completar venta
   * @param {Object} additionalData - Datos adicionales de la venta
   * @returns {Promise<string>} ID de la venta creada
   */
  const completeSale = async (additionalData = {}) => {
    try {
      setLoading(true);
      setError(null);

      if (cart.length === 0) {
        throw new Error("El carrito está vacío");
      }

      const saleData = {
        items: cart,
        subtotal: getSubtotal(),
        discount: {
          type: discount.type,
          value: discount.value,
          amount: getDiscountAmount(),
        },
        total: getTotal(),
        paymentMethod,
        ...additionalData,
      };

      const saleId = await createSale(saleData);

      // Limpiar carrito después de la venta
      clearCart();

      // Recargar datos
      await loadSales();
      await loadSalesStats();

      return saleId;
    } catch (err) {
      setError(err.message);
      console.error("Error al completar venta:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear venta en espera
   * @param {string} customerLabel - Etiqueta del cliente
   * @returns {Promise<string>} ID de la venta en espera
   */
  const createPendingSaleFromCart = async (customerLabel) => {
    try {
      setLoading(true);
      setError(null);

      if (cart.length === 0) {
        throw new Error("El carrito está vacío");
      }

      const saleData = {
        items: cart,
        subtotal: getSubtotal(),
        discount: {
          type: discount.type,
          value: discount.value,
          amount: getDiscountAmount(),
        },
        total: getTotal(),
        paymentMethod,
      };

      const pendingSaleId = await createPendingSale(saleData, customerLabel);

      // Limpiar carrito
      clearCart();

      // Recargar ventas en espera
      await loadPendingSales();

      return pendingSaleId;
    } catch (err) {
      setError(err.message);
      console.error("Error al crear venta en espera:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar venta en espera al carrito
   * @param {string} pendingSaleId - ID de la venta en espera
   */
  const loadPendingSaleToCart = async (pendingSaleId) => {
    try {
      setLoading(true);
      setError(null);

      const pendingSale = pendingSales.find(
        (sale) => sale.id === pendingSaleId
      );
      if (!pendingSale) {
        throw new Error("Venta en espera no encontrada");
      }

      // Cargar datos al carrito
      setCart(pendingSale.items);
      setDiscount(pendingSale.discount);
      setPaymentMethod(pendingSale.paymentMethod);
      setCurrentPendingSale(pendingSaleId);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar venta en espera:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finalizar venta en espera
   * @param {string} pendingSaleId - ID de la venta en espera
   * @returns {Promise<string>} ID de la venta completada
   */
  const finalizePendingSale = async (pendingSaleId) => {
    try {
      setLoading(true);
      setError(null);

      const completedSaleId = await completePendingSale(pendingSaleId);

      // Recargar datos
      await loadPendingSales();
      await loadSales();
      await loadSalesStats();

      // Limpiar carrito si era la venta actual
      if (currentPendingSale === pendingSaleId) {
        clearCart();
        setCurrentPendingSale(null);
      }

      return completedSaleId;
    } catch (err) {
      setError(err.message);
      console.error("Error al finalizar venta en espera:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancelar venta en espera
   * @param {string} pendingSaleId - ID de la venta en espera
   */
  const cancelPendingSaleById = async (pendingSaleId) => {
    try {
      setLoading(true);
      setError(null);

      await cancelPendingSale(pendingSaleId);

      // Recargar ventas en espera
      await loadPendingSales();

      // Limpiar carrito si era la venta actual
      if (currentPendingSale === pendingSaleId) {
        clearCart();
        setCurrentPendingSale(null);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error al cancelar venta en espera:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar todas las ventas
   */
  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const salesData = await getAllSales();
      setSales(salesData);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar ventas:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar ventas en espera
   */
  const loadPendingSales = async () => {
    try {
      setError(null);
      const pendingSalesData = await getPendingSales();
      setPendingSales(pendingSalesData);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar ventas en espera:", err);
    }
  };

  /**
   * Cargar estadísticas de ventas
   */
  const loadSalesStats = async () => {
    try {
      setError(null);
      const stats = await getSalesStats();
      setSalesStats(stats);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  };

  /**
   * Procesar devolución
   * @param {string} saleId - ID de la venta
   * @param {Array} returnItems - Items a devolver
   */
  const processReturnById = async (saleId, returnItems) => {
    try {
      setLoading(true);
      setError(null);

      await processReturn(saleId, returnItems);

      // Recargar datos
      await loadSales();
      await loadSalesStats();
    } catch (err) {
      setError(err.message);
      console.error("Error al procesar devolución:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadSales();
    loadPendingSales();
    loadSalesStats();
  }, []);

  return {
    // Estado del carrito
    cart,
    discount,
    paymentMethod,

    // Estado de ventas
    sales,
    pendingSales,
    currentPendingSale,
    salesStats,

    // Estado de carga
    loading,
    error,

    // Acciones del carrito
    addToCart,
    addQuickItemToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    setDiscount,
    setPaymentMethod,

    // Cálculos
    getSubtotal,
    getDiscountAmount,
    getTotal,

    // Acciones de ventas
    completeSale,
    createPendingSaleFromCart,
    loadPendingSaleToCart,
    finalizePendingSale,
    cancelPendingSaleById,
    processReturnById,

    // Carga de datos
    loadSales,
    loadPendingSales,
    loadSalesStats,
  };
};
