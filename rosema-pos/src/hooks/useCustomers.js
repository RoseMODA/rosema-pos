import { useState, useEffect, useCallback } from 'react';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerStats,
  getCustomerPurchaseHistory,
  updateCustomerStats,
  getTopCustomers,
  getCustomerPreferences
} from '../services/customersService';

/**
 * Hook personalizado para gestión completa de clientes
 * Implementa sistema CRM básico con estadísticas y historial
 */
export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  /**
   * Cargar todos los clientes
   */
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const customersData = await getAllCustomers();
      setCustomers(customersData);
      return customersData;
    } catch (err) {
      setError(err.message || 'Error al cargar clientes');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar clientes por término
   */
  const searchCustomersByTerm = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setCustomers([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const results = await searchCustomers(searchTerm);
      setSearchResults(results);
      setCustomers(results);
      return results;
    } catch (err) {
      setError(err.message || 'Error en la búsqueda');
      console.error('Error searching customers:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener cliente por ID
   */
  const getCustomer = useCallback(async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const customer = await getCustomerById(customerId);
      return customer;
    } catch (err) {
      setError(err.message || 'Error al obtener cliente');
      console.error('Error getting customer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener historial de compras de un cliente
   */
  const getCustomerHistory = useCallback(async (customerId) => {
    try {
      const history = await getCustomerPurchaseHistory(customerId);
      return history;
    } catch (err) {
      console.error('Error getting customer history:', err);
      return [];
    }
  }, []);

  /**
   * Obtener análisis de preferencias de un cliente
   */
  const getCustomerAnalysis = useCallback(async (customerId) => {
    try {
      const analysis = await getCustomerPreferences(customerId);
      return analysis;
    } catch (err) {
      console.error('Error getting customer analysis:', err);
      throw err;
    }
  }, []);

  /**
   * Agregar nuevo cliente
   */
  const addCustomer = useCallback(async (customerData) => {
    setLoading(true);
    setError(null);
    try {
      const newCustomer = await createCustomer(customerData);
      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err) {
      setError(err.message || 'Error al crear cliente');
      console.error('Error adding customer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar cliente existente
   */
  const updateCustomerData = useCallback(async (customerId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCustomer = await updateCustomer(customerId, updates);
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === customerId ? { ...customer, ...updatedCustomer } : customer
        )
      );
      return updatedCustomer;
    } catch (err) {
      setError(err.message || 'Error al actualizar cliente');
      console.error('Error updating customer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar cliente
   */
  const removeCustomer = useCallback(async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCustomer(customerId);
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
      return customerId;
    } catch (err) {
      setError(err.message || 'Error al eliminar cliente');
      console.error('Error removing customer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar búsqueda
   */
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setCustomers([]);
    setError(null);
  }, []);

  /**
   * Obtener estadísticas de clientes
   */
  const getCustomerStatistics = useCallback(async () => {
    try {
      const stats = await getCustomerStats();
      return stats;
    } catch (err) {
      console.error('Error getting customer stats:', err);
      return {
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.totalCompras > 0).length,
        newCustomersThisMonth: 0,
        topCustomers: [],
        averageSpending: 0,
        totalRevenue: 0
      };
    }
  }, [customers]);

  /**
   * Obtener estadísticas locales (sin llamada a la API)
   */
  const getCustomerStatsLocal = useCallback(() => {
    const stats = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(customer => customer.totalCompras > 0).length,
      newCustomers: 0,
      averageSpending: 0,
      totalRevenue: 0
    };

    // Calcular clientes nuevos este mes
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    stats.newCustomers = customers.filter(customer => {
      if (!customer.createdAt) return false;
      const createdDate = customer.createdAt.seconds ? 
        new Date(customer.createdAt.seconds * 1000) : 
        new Date(customer.createdAt);
      return createdDate >= thisMonth;
    }).length;

    // Calcular ingresos totales y promedio
    stats.totalRevenue = customers.reduce((sum, customer) => sum + (customer.montoTotalGastado || 0), 0);
    stats.averageSpending = customers.length > 0 ? stats.totalRevenue / customers.length : 0;

    return stats;
  }, [customers]);

  /**
   * Obtener top clientes
   */
  const getTopCustomersData = useCallback(async (limit = 10) => {
    try {
      const topCustomers = await getTopCustomers(limit);
      return topCustomers;
    } catch (err) {
      console.error('Error getting top customers:', err);
      return customers
        .filter(customer => customer.totalCompras > 0)
        .sort((a, b) => (b.montoTotalGastado || 0) - (a.montoTotalGastado || 0))
        .slice(0, limit);
    }
  }, [customers]);

  /**
   * Actualizar estadísticas de cliente desde venta
   */
  const updateCustomerStatsFromSale = useCallback(async (customerName, saleData) => {
    try {
      await updateCustomerStats(customerName, saleData);
      // Recargar clientes para reflejar cambios
      await loadCustomers();
    } catch (err) {
      console.error('Error updating customer stats from sale:', err);
      // No lanzar error para no interrumpir el flujo de venta
    }
  }, [loadCustomers]);

  /**
   * Filtrar clientes por criterios
   */
  const filterCustomers = useCallback((criteria) => {
    let filtered = [...customers];

    if (criteria.hasCompras) {
      filtered = filtered.filter(customer => customer.totalCompras > 0);
    }

    if (criteria.minSpending) {
      filtered = filtered.filter(customer => (customer.montoTotalGastado || 0) >= criteria.minSpending);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      filtered = filtered.filter(customer => 
        customer.tags && customer.tags.some(tag => criteria.tags.includes(tag))
      );
    }

    return filtered;
  }, [customers]);

  /**
   * Obtener clientes por rango de fechas
   */
  const getCustomersByDateRange = useCallback((startDate, endDate) => {
    return customers.filter(customer => {
      if (!customer.createdAt) return false;
      
      const createdDate = customer.createdAt.seconds ? 
        new Date(customer.createdAt.seconds * 1000) : 
        new Date(customer.createdAt);
      
      return createdDate >= startDate && createdDate <= endDate;
    });
  }, [customers]);

  return {
    // Estado
    customers,
    loading,
    error,
    searchResults,

    // Funciones CRUD
    loadCustomers,
    searchCustomersByTerm,
    getCustomer,
    addCustomer,
    updateCustomerData,
    removeCustomer,
    clearSearch,

    // Historial y análisis
    getCustomerHistory,
    getCustomerAnalysis,
    updateCustomerStatsFromSale,

    // Estadísticas
    getCustomerStatistics,
    getCustomerStatsLocal,
    getTopCustomersData,

    // Filtros y utilidades
    filterCustomers,
    getCustomersByDateRange
  };
};

export default useCustomers;
