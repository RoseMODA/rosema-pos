import { useState, useEffect, useCallback } from 'react';
import {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  getProviderStats,
  searchProviders,
  getProvidersByCategory,
  getProvidersByArea,
  getProvidersByGallery,
  getProvidersWithFilters,
  getProviderProductStats,
  getUniqueCategories,
  getUniqueAreas,
  getUniqueGalleries
} from '../services/providersService';

/**
 * Hook personalizado para gestión completa de proveedores
 * Implementa todas las funcionalidades de la Etapa 5
 */
export const useProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [galleries, setGalleries] = useState([]);

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
   * Cargar categorías únicas
   */
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await getUniqueCategories();
      setCategories(categoriesData);
      return categoriesData;
    } catch (err) {
      console.error('Error loading categories:', err);
      return [];
    }
  }, []);

  /**
   * Cargar áreas únicas
   */
  const loadAreas = useCallback(async () => {
    try {
      const areasData = await getUniqueAreas();
      setAreas(areasData);
      return areasData;
    } catch (err) {
      console.error('Error loading areas:', err);
      return [];
    }
  }, []);

  /**
   * Cargar galerías únicas
   */
  const loadGalleries = useCallback(async () => {
    try {
      const galleriesData = await getUniqueGalleries();
      setGalleries(galleriesData);
      return galleriesData;
    } catch (err) {
      console.error('Error loading galleries:', err);
      return [];
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
   * Aplicar filtros combinados
   * Permite usar múltiples filtros al mismo tiempo
   */
  const applyFilters = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🎯 Hook: Aplicando filtros:', filters);
      
      // Si no hay filtros activos, cargar todos los proveedores
      const hasActiveFilters = Object.values(filters).some(value => 
        value && value.toString().trim() !== ''
      );
      
      if (!hasActiveFilters) {
        console.log('🔄 Hook: No hay filtros activos, cargando todos los proveedores');
        const allProviders = await getAllProviders();
        setProviders(allProviders);
        return allProviders;
      }
      
      const results = await getProvidersWithFilters(filters);
      setProviders(results);
      return results;
    } catch (err) {
      setError(err.message || 'Error al aplicar filtros');
      console.error('Error applying filters:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Filtrar por categoría (mantener para compatibilidad)
   */
  const filterByCategory = useCallback(async (categoria) => {
    return applyFilters({ categoria });
  }, [applyFilters]);

  /**
   * Filtrar por área (mantener para compatibilidad)
   */
  const filterByArea = useCallback(async (area) => {
    return applyFilters({ area });
  }, [applyFilters]);

  /**
   * Filtrar por galería (mantener para compatibilidad)
   */
  const filterByGallery = useCallback(async (galeria) => {
    return applyFilters({ galeria });
  }, [applyFilters]);

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
   * Obtener estadísticas de productos de un proveedor
   */
  const getProviderProductStatistics = useCallback(async (providerId) => {
    try {
      const stats = await getProviderProductStats(providerId);
      return stats;
    } catch (err) {
      console.error('Error getting provider product stats:', err);
      return {
        totalComprados: 0,
        totalVendidos: 0,
        productosActivos: 0,
        ultimaCompra: null,
        ultimaVenta: null
      };
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
      
      // Recargar listas únicas
      loadCategories();
      loadAreas();
      loadGalleries();
      
      return newProvider;
    } catch (err) {
      setError(err.message || 'Error al crear proveedor');
      console.error('Error adding provider:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadAreas, loadGalleries]);

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
      
      // Recargar listas únicas si se actualizaron campos relevantes
      if (updates.categoria || updates.locales) {
        loadCategories();
        loadAreas();
        loadGalleries();
      }
      
      return updatedProvider;
    } catch (err) {
      setError(err.message || 'Error al actualizar proveedor');
      console.error('Error updating provider:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadAreas, loadGalleries]);

  /**
   * Eliminar proveedor
   */
  const removeProvider = useCallback(async (providerId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProvider(providerId);
      setProviders(prev => prev.filter(provider => provider.id !== providerId));
      
      // Recargar listas únicas
      loadCategories();
      loadAreas();
      loadGalleries();
      
      return providerId;
    } catch (err) {
      setError(err.message || 'Error al eliminar proveedor');
      console.error('Error removing provider:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadAreas, loadGalleries]);

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
        categorias: {},
        tags: {},
        galerias: {}
      };
    }
  }, [providers]);

  /**
   * Obtener estadísticas locales (sin llamada a la API)
   */
  const getProviderStatsLocal = useCallback(() => {
    const stats = {
      totalProviders: providers.length,
      activeProviders: providers.filter(provider => provider.active !== false).length,
      areas: {},
      categorias: {},
      tags: {},
      galerias: {}
    };

    providers.forEach(provider => {
      // Áreas de locales
      if (provider.locales && Array.isArray(provider.locales)) {
        provider.locales.forEach(local => {
          if (local.area) {
            stats.areas[local.area] = (stats.areas[local.area] || 0) + 1;
          }
          if (local.galeria) {
            stats.galerias[local.galeria] = (stats.galerias[local.galeria] || 0) + 1;
          }
        });
      }

      // Categorías
      if (provider.categoria) {
        stats.categorias[provider.categoria] = (stats.categorias[provider.categoria] || 0) + 1;
      }

      // Tags
      if (provider.tags && Array.isArray(provider.tags)) {
        provider.tags.forEach(tag => {
          stats.tags[tag] = (stats.tags[tag] || 0) + 1;
        });
      }
    });

    return stats;
  }, [providers]);

  /**
   * Filtrar localmente por tags
   */
  const filterByTags = useCallback((tags) => {
    if (!tags || tags.length === 0) return providers;
    return providers.filter(provider => 
      provider.tags && provider.tags.some(tag => tags.includes(tag))
    );
  }, [providers]);

  /**
   * Filtrar localmente por talles
   */
  const filterByTalles = useCallback((talles) => {
    if (!talles || talles.length === 0) return providers;
    return providers.filter(provider => 
      provider.talles && provider.talles.some(talle => talles.includes(talle))
    );
  }, [providers]);

  // Cargar datos iniciales
  useEffect(() => {
    loadCategories();
    loadAreas();
    loadGalleries();
  }, [loadCategories, loadAreas, loadGalleries]);

  return {
    // Estado
    providers,
    loading,
    error,
    searchResults,
    categories,
    areas,
    galleries,

    // Funciones CRUD
    loadProviders,
    searchProvidersByTerm,
    getProvider,
    addProvider,
    updateProviderData,
    removeProvider,
    clearSearch,

    // Filtros
    applyFilters,
    filterByCategory,
    filterByArea,
    filterByGallery,
    filterByTags,
    filterByTalles,

    // Estadísticas
    getProviderStatistics,
    getProviderStatsLocal,
    getProviderProductStatistics,

    // Cargar listas
    loadCategories,
    loadAreas,
    loadGalleries
  };
};

export default useProviders;
