import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Servicio para gestión de productos en Firestore
 * Maneja CRUD de productos para el sistema POS Rosema
 */

const PRODUCTS_COLLECTION = "products";

/**
 * Obtener todos los productos
 * @returns {Promise<Array>} Lista de productos
 */
export const getAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, PRODUCTS_COLLECTION), orderBy("name"))
    );

    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return products;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw new Error("No se pudieron cargar los productos");
  }
};

/**
 * Buscar productos por nombre o código
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Productos encontrados
 */
export const searchProducts = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return await getAllProducts();
    }

    const searchTermLower = searchTerm.toLowerCase();
    const products = await getAllProducts();

    // Filtrar productos por nombre o código
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTermLower) ||
        (product.code && product.code.toLowerCase().includes(searchTermLower))
    );
  } catch (error) {
    console.error("Error al buscar productos:", error);
    throw new Error("Error en la búsqueda de productos");
  }
};

/**
 * Obtener un producto por ID
 * @param {string} productId - ID del producto
 * @returns {Promise<Object>} Producto encontrado
 */
export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      throw new Error("Producto no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener producto:", error);
    throw error;
  }
};

/**
 * Agregar un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Promise<string>} ID del producto creado
 */
export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error al agregar producto:", error);
    throw new Error("No se pudo agregar el producto");
  }
};

/**
 * Actualizar stock de un producto
 * @param {string} productId - ID del producto
 * @param {number} newStock - Nuevo stock
 * @returns {Promise<void>}
 */
export const updateProductStock = async (productId, newStock) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    throw new Error("No se pudo actualizar el stock");
  }
};

/**
 * Descontar stock de productos (para ventas)
 * @param {Array} items - Items vendidos [{productId, quantity}]
 * @returns {Promise<void>}
 */
export const decreaseProductsStock = async (items) => {
  try {
    const updatePromises = items.map(async (item) => {
      const product = await getProductById(item.productId);
      const newStock = Math.max(0, product.stock - item.quantity);
      return updateProductStock(item.productId, newStock);
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error al descontar stock:", error);
    throw new Error("No se pudo actualizar el inventario");
  }
};

/**
 * Crear productos de ejemplo para testing
 * @returns {Promise<void>}
 */
export const createSampleProducts = async () => {
  const sampleProducts = [
    {
      name: "Remera Básica Mujer",
      code: "RBM001",
      purchasePrice: 1500,
      salePrice: 3000,
      profitPercentage: 100,
      category: "mujer",
      tags: ["básico", "algodón", "casual"],
      stock: 25,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["#FFFFFF", "#000000", "#FF0000", "#0000FF"],
      supplier: "Proveedor A",
    },
    {
      name: "Jean Clásico Hombre",
      code: "JCH002",
      purchasePrice: 2500,
      salePrice: 5500,
      profitPercentage: 120,
      category: "hombre",
      tags: ["jeans", "clásico", "denim"],
      stock: 15,
      sizes: ["28", "30", "32", "34", "36", "38"],
      colors: ["#1E3A8A", "#000000"],
      supplier: "Proveedor B",
    },
    {
      name: "Vestido Fiesta Mujer",
      code: "VFM003",
      purchasePrice: 4000,
      salePrice: 8500,
      profitPercentage: 112.5,
      category: "mujer",
      tags: ["fiesta", "elegante", "noche"],
      stock: 8,
      sizes: ["XS", "S", "M", "L"],
      colors: ["#000000", "#FF0000", "#800080"],
      supplier: "Proveedor C",
    },
  ];

  try {
    for (const product of sampleProducts) {
      await addProduct(product);
    }
    console.log("Productos de ejemplo creados exitosamente");
  } catch (error) {
    console.error("Error al crear productos de ejemplo:", error);
  }
};
