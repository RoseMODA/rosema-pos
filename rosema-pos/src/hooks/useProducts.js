import { useState, useEffect } from "react";
import {
  getAllProducts,
  searchProducts,
  getProductById,
  addProduct,
  updateProductStock,
  createSampleProducts,
} from "../services/productsService";

/**
 * Hook personalizado para gestión de productos
 * Maneja el estado y operaciones CRUD de productos
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Cargar todos los productos
   */
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await getAllProducts();
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar productos:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar productos por término
   * @param {string} term - Término de búsqueda
   */
  const searchProductsByTerm = async (term) => {
    try {
      setLoading(true);
      setError(null);
      setSearchTerm(term);
      const searchResults = await searchProducts(term);
      setProducts(searchResults);
    } catch (err) {
      setError(err.message);
      console.error("Error al buscar productos:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener un producto específico por ID
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} Producto encontrado
   */
  const getProduct = async (productId) => {
    try {
      setError(null);
      return await getProductById(productId);
    } catch (err) {
      setError(err.message);
      console.error("Error al obtener producto:", err);
      throw err;
    }
  };

  /**
   * Agregar un nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise<string>} ID del producto creado
   */
  const createProduct = async (productData) => {
    try {
      setError(null);
      const productId = await addProduct(productData);
      await loadProducts(); // Recargar lista
      return productId;
    } catch (err) {
      setError(err.message);
      console.error("Error al crear producto:", err);
      throw err;
    }
  };

  /**
   * Actualizar stock de un producto
   * @param {string} productId - ID del producto
   * @param {number} newStock - Nuevo stock
   */
  const updateStock = async (productId, newStock) => {
    try {
      setError(null);
      await updateProductStock(productId, newStock);
      await loadProducts(); // Recargar lista
    } catch (err) {
      setError(err.message);
      console.error("Error al actualizar stock:", err);
      throw err;
    }
  };

  /**
   * Crear productos de ejemplo para testing
   */
  const createSampleData = async () => {
    try {
      setLoading(true);
      setError(null);
      await createSampleProducts();
      await loadProducts(); // Recargar lista
    } catch (err) {
      setError(err.message);
      console.error("Error al crear productos de ejemplo:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar búsqueda y mostrar todos los productos
   */
  const clearSearch = () => {
    setSearchTerm("");
    loadProducts();
  };

  /**
   * Filtrar productos por categoría
   * @param {string} category - Categoría a filtrar
   */
  const filterByCategory = async (category) => {
    try {
      setLoading(true);
      setError(null);
      const allProducts = await getAllProducts();
      const filtered =
        category === "all"
          ? allProducts
          : allProducts.filter((product) => product.category === category);
      setProducts(filtered);
    } catch (err) {
      setError(err.message);
      console.error("Error al filtrar productos:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener productos con stock bajo
   * @param {number} threshold - Umbral de stock bajo (default: 5)
   * @returns {Array} Productos con stock bajo
   */
  const getLowStockProducts = () => {
    return products.filter((product) => product.stock <= 5);
  };

  /**
   * Obtener estadísticas de productos
   * @returns {Object} Estadísticas de productos
   */
  const getProductStats = () => {
    const totalProducts = products.length;
    const totalStock = products.reduce(
      (sum, product) => sum + product.stock,
      0
    );
    const lowStockCount = getLowStockProducts().length;
    const categories = [
      ...new Set(products.map((product) => product.category)),
    ];

    return {
      totalProducts,
      totalStock,
      lowStockCount,
      categoriesCount: categories.length,
      categories,
    };
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  return {
    // Estado
    products,
    loading,
    error,
    searchTerm,

    // Acciones
    loadProducts,
    searchProductsByTerm,
    getProduct,
    createProduct,
    updateStock,
    createSampleData,
    clearSearch,
    filterByCategory,

    // Utilidades
    getLowStockProducts,
    getProductStats,
  };
};
