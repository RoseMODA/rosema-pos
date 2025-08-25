import { useState, useEffect, useCallback } from 'react';
import {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  getProviderStats,
  searchProviders
} from '../services/providersService';

/**
 * Hook personalizado para gestión de proveedores
 * Maneja estado, carga y operaciones CRUD
 */
export const useProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  /**
   * Cargar todos los proveedores
   */
  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const providersData = await getAllProviders();
      setProviders(providersData);
      return providersData;
    } catch (err) {
      setError(err.message || 'Error al cargar proveedores');
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar proveedores por término
   */
  const searchProvidersByTerm = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setProviders([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const results = await searchProviders(searchTerm);
      setSearchResults(results);
      setProviders(results);
      return results;
    } catch (err) {
      setError(err.message || 'Error en la búsqueda');
      console.error('Error searching providers:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener proveedor por ID
   */
  const getProvider = useCallback(async (providerId) => {
    setLoading(true);
    setError(null);
    try {
      const provider = await getProviderById(providerId);
      return provider;
    } catch (err) {
      setError(err.message || 'Error al obtener proveedor');
      console.error('Error getting provider:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Agregar nuevo proveedor
   */
  const addProvider = useCallback(async (providerData) => {
    setLoading(true);
    setError(null);
    try {
      const newProvider = await createProvider(providerData);
      setProviders(prev => [newProvider, ...prev]);
      return newProvider;
    } catch (err) {
      setError(err.message || 'Error al crear proveedor');
      console.error('Error adding provider:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar proveedor existente
   */
  const updateProviderData = useCallback(async (providerId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProvider = await updateProvider(providerId, updates);
      setProviders(prev =>
        prev.map(provider =>
          provider.id === providerId ? { ...provider, ...updatedProvider } : provider
        )
      );
      return updatedProvider;
    } catch (err) {
      setError(err.message || 'Error al actualizar proveedor');
      console.error('Error updating provider:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar proveedor
   */
  const removeProvider = useCallback(async (providerId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProvider(providerId);
      setProviders(prev => prev.filter(provider => provider.id !== providerId));
      return providerId;
    } catch (err) {
      setError(err.message || 'Error al eliminar proveedor');
      console.error('Error removing provider:', err);
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
    setProviders([]);
    setError(null);
  }, []);

  /**
   * Obtener estadísticas de proveedores
   */
  const getProviderStatistics = useCallback(async () => {
    try {
      const stats = await getProviderStats();
      return stats;
    } catch (err) {
      console.error('Error getting provider stats:', err);
      return {
        totalProviders: providers.length,
        activeProviders: providers.filter(p => p.active !== false).length,
        areas: {},
        tags: {}
      };
    }
  }, [providers]);

  /**
   * Obtener estadísticas locales (sin llamada a la API)
   */
  const getProviderStatsLocal = useCallback(() => {
    return {
      totalProviders: providers.length,
      activeProviders: providers.filter(provider => provider.active !== false).length,
      areas: providers.reduce((acc, provider) => {
        if (provider.area) {
          acc[provider.area] = (acc[provider.area] || 0) + 1;
        }
        return acc;
      }, {}),
      tags: providers.reduce((acc, provider) => {
        if (provider.tags && Array.isArray(provider.tags)) {
          provider.tags.forEach(tag => {
            acc[tag] = (acc[tag] || 0) + 1;
          });
        }
        return acc;
      }, {})
    };
  }, [providers]);

  /**
   * Filtrar por área
   */
  const filterByArea = useCallback((area) => {
    if (!area) return providers;
    return providers.filter(provider => provider.area === area);
  }, [providers]);

  /**
   * Filtrar por tags
   */
  const filterByTags = useCallback((tags) => {
    if (!tags || tags.length === 0) return providers;
    return providers.filter(provider => 
      provider.tags && provider.tags.some(tag => tags.includes(tag))
    );
  }, [providers]);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    // No cargar automáticamente para evitar llamadas innecesarias
    // loadProviders();
  }, []);

  return {
    // Estado
    providers,
    loading,
    error,
    searchResults,

    // Funciones CRUD
    loadProviders,
    searchProvidersByTerm,
    getProvider,
    addProvider,
    updateProviderData,
    removeProvider,
    clearSearch,

    // Estadísticas y filtros
    getProviderStatistics,
    getProviderStatsLocal,
    filterByArea,
    filterByTags
  };
};

export default useProviders;
