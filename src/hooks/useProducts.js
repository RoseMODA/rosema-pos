import { useState, useEffect, useCallback } from 'react';
import {
  getAllProducts,
  searchProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  updateVariantStock,
  incrementVariantStock,
  createSampleProducts,
  getProductStats,
  checkProductCodeExists,
  subscribeToProducts
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
  const [realtimeProducts, setRealtimeProducts] = useState([]);

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
    // 👇 Aseguramos valores por defecto
    const enrichedData = {
      ...productData,
      ecommerce: productData.ecommerce ?? false,
      deposito: productData.deposito ?? { guardado: false, fila: null, columna: "", lugar: "" }
    };

    const newProduct = await createProduct(enrichedData);
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
    // 👇 Igual que arriba: valores por defecto
    const enrichedUpdates = {
      ...updates,
      ecommerce: updates.ecommerce ?? false,
      deposito: updates.deposito ?? { guardado: false, fila: null, columna: "", lugar: "" }
    };

    const updatedProduct = await updateProduct(productId, enrichedUpdates);
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
   * Buscar producto por código de barras
   */
  const getProductByBarcode = useCallback(async (barcode) => {
    setLoading(true);
    setError(null);
    
    try {
      const product = await getProductByBarcode(barcode);
      return product;
    } catch (err) {
      setError(err.message);
      console.error('Error al buscar producto por código:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar stock de variante específica (descontar)
   */
  const updateVariantStockData = useCallback(async (productId, variant, quantitySold) => {
    setError(null);
    
    try {
      const updatedVariants = await updateVariantStock(productId, variant, quantitySold);
      
      // Actualizar el producto en el estado local si existe
      setProducts(prev => 
        prev.map(product => {
          if (product.id === productId) {
            const newTotalStock = updatedVariants.reduce((acc, v) => acc + (v.stock || 0), 0);
            return { 
              ...product, 
              variantes: updatedVariants,
              stock: newTotalStock
            };
          }
          return product;
        })
      );
      
      return updatedVariants;
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar stock de variante:', err);
      throw err;
    }
  }, []);

  /**
   * Incrementar stock de variante específica (para devoluciones)
   */
  const incrementVariantStockData = useCallback(async (productId, variant, quantityReturned) => {
    setError(null);
    
    try {
      const updatedVariants = await incrementVariantStock(productId, variant, quantityReturned);
      
      // Actualizar el producto en el estado local si existe
      setProducts(prev => 
        prev.map(product => {
          if (product.id === productId) {
            const newTotalStock = updatedVariants.reduce((acc, v) => acc + (v.stock || 0), 0);
            return { 
              ...product, 
              variantes: updatedVariants,
              stock: newTotalStock
            };
          }
          return product;
        })
      );
      
      return updatedVariants;
    } catch (err) {
      setError(err.message);
      console.error('Error al incrementar stock de variante:', err);
      throw err;
    }
  }, []);

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

  // Suscripción en tiempo real a productos
  useEffect(() => {
    console.log('🔄 Iniciando suscripción en tiempo real a productos...');
    
    const unsubscribe = subscribeToProducts((products) => {
      console.log('📡 Productos actualizados en tiempo real:', products.length);
      setRealtimeProducts(products);
      
      // Si estamos en modo búsqueda, actualizar también los resultados
      if (searchResults.length > 0) {
        const updatedResults = searchResults.map(result => 
          products.find(p => p.id === result.id) || result
        ).filter(Boolean);
        setSearchResults(updatedResults);
      }
      
      // Si tenemos productos cargados, actualizarlos también
      if (products.length > 0) {
        setProducts(products);
      }
    });

    return () => {
      console.log('🔌 Desconectando suscripción de productos...');
      unsubscribe();
    };
  }, [searchResults]);

  return {
    // Estado
    products,
    loading,
    error,
    searchResults,
    realtimeProducts,
    
    // Funciones CRUD
    loadProducts,
    searchProductsByTerm,
    getProduct,
    getProductByBarcode,
    addProduct,
    updateProductData,
    removeProduct,
    updateStock,
    updateVariantStockData,
    incrementVariantStockData,
    
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
