import { useState, useEffect, useCallback } from 'react';
import {
  getAllProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  createSampleProducts,
  getProductStats,
  checkProductCodeExists
} from '../services/productsService';

/**
 * Hook personalizado para gestión de productos
 * Proporciona estado y funciones para manejar productos
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  /**
   * Cargar todos los productos
   */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const productsData = await getAllProducts();
      setProducts(productsData);
      return productsData;
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar productos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar productos por término
   */
  const searchProductsByTerm = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setProducts([]);
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const results = await searchProducts(searchTerm);
      setSearchResults(results);
      setProducts(results);
      return results;
    } catch (err) {
      setError(err.message);
      console.error('Error al buscar productos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener producto por ID
   */
  const getProduct = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    
    try {
      const product = await getProductById(productId);
      return product;
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener producto:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo producto
   */
  const addProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newProduct = await createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      setError(err.message);
      console.error('Error al crear producto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar producto existente
   */
  const updateProductData = useCallback(async (productId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedProduct = await updateProduct(productId, updates);
      setProducts(prev => 
        prev.map(product => 
          product.id === productId ? { ...product, ...updatedProduct } : product
        )
      );
      return updatedProduct;
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar producto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar producto
   */
  const removeProduct = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
      return productId;
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar producto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar stock de producto
   */
  const updateStock = useCallback(async (productId, newStock) => {
    setError(null);
    
    try {
      await updateProductStock(productId, newStock);
      setProducts(prev => 
        prev.map(product => 
          product.id === productId ? { ...product, stock: newStock } : product
        )
      );
      return newStock;
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar stock:', err);
      throw err;
    }
  }, []);

  /**
   * Crear productos de ejemplo
   */
  const createSampleData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const sampleProducts = await createSampleProducts();
      setProducts(prev => [...sampleProducts, ...prev]);
      return sampleProducts;
    } catch (err) {
      setError(err.message);
      console.error('Error al crear productos de ejemplo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar resultados de búsqueda
   */
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setProducts([]);
    setError(null);
  }, []);

  /**
   * Obtener estadísticas de productos
   */
  const getProductStatistics = useCallback(async () => {
    try {
      const stats = await getProductStats();
      return stats;
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      return {
        totalProducts: products.length,
        totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0),
        lowStockProducts: products.filter(p => (p.stock || 0) <= 5).length,
        outOfStockProducts: products.filter(p => (p.stock || 0) === 0).length,
        categories: {}
      };
    }
  }, [products]);

  /**
   * Obtener estadísticas básicas de productos actuales
   */
  const getProductStats = useCallback(() => {
    return {
      totalProducts: products.length,
      totalStock: products.reduce((sum, product) => sum + (product.stock || 0), 0),
      lowStockProducts: products.filter(product => (product.stock || 0) <= 5).length,
      outOfStockProducts: products.filter(product => (product.stock || 0) === 0).length,
      categories: products.reduce((acc, product) => {
        const category = product.category || 'otros';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {})
    };
  }, [products]);

  /**
   * Filtrar productos por categoría
   */
  const filterByCategory = useCallback((category) => {
    if (category === 'all') {
      return products;
    }
    return products.filter(product => product.category === category);
  }, [products]);

  /**
   * Obtener productos con stock bajo
   */
  const getLowStockProducts = useCallback((threshold = 5) => {
    return products.filter(product => (product.stock || 0) <= threshold);
  }, [products]);

  /**
   * Obtener productos sin stock
   */
  const getOutOfStockProducts = useCallback(() => {
    return products.filter(product => (product.stock || 0) === 0);
  }, [products]);

  /**
   * Validar código único
   */
  const validateProductCode = useCallback(async (code, excludeId = null) => {
    try {
      return await checkProductCodeExists(code, excludeId);
    } catch (error) {
      console.error('Error al validar código:', error);
      return false;
    }
  }, []);

  // Cargar productos al montar el componente
  useEffect(() => {
    // Solo cargar automáticamente si no hay productos y no estamos buscando
    if (products.length === 0 && searchResults.length === 0) {
      // No cargar automáticamente para evitar llamadas innecesarias
      // loadProducts();
    }
  }, []);

  return {
    // Estado
    products,
    loading,
    error,
    searchResults,
    
    // Funciones CRUD
    loadProducts,
    searchProductsByTerm,
    getProduct,
    addProduct,
    updateProductData,
    removeProduct,
    updateStock,
    
    // Utilidades
    clearSearch,
    createSampleData,
    getProductStats,
    getProductStatistics,
    filterByCategory,
    getLowStockProducts,
    getOutOfStockProducts,
    validateProductCode
  };
};

export default useProducts;
