import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Servicio para gestión de productos en Firestore
 * Maneja CRUD de productos con stock, tallas y colores
 */

const COLLECTION_NAME = "products";

/**
 * Obtener todos los productos
 */
export const getAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), orderBy("name"))
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw new Error("No se pudieron cargar los productos");
  }
};

/**
 * Buscar productos por término (nombre o código)
 */
export const searchProducts = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();

    // Buscar por código exacto
    const codeQuery = query(
      collection(db, COLLECTION_NAME),
      where("code", ">=", term),
      where("code", "<=", term + "\uf8ff"),
      limit(10)
    );

    // Buscar por nombre
    const nameQuery = query(
      collection(db, COLLECTION_NAME),
      where("searchName", ">=", term),
      where("searchName", "<=", term + "\uf8ff"),
      limit(10)
    );

    const [codeResults, nameResults] = await Promise.all([
      getDocs(codeQuery),
      getDocs(nameQuery),
    ]);

    const products = new Map();

    // Agregar resultados por código
    codeResults.docs.forEach((doc) => {
      products.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Agregar resultados por nombre
    nameResults.docs.forEach((doc) => {
      products.set(doc.id, { id: doc.id, ...doc.data() });
    });

    return Array.from(products.values());
  } catch (error) {
    console.error("Error al buscar productos:", error);
    throw new Error("Error en la búsqueda de productos");
  }
};

/**
 * Obtener producto por ID
 */
export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Producto no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener producto:", error);
    throw error;
  }
};

/**
 * Crear nuevo producto
 */
export const createProduct = async (productData) => {
  try {
    const newProduct = {
      ...productData,
      searchName: productData.name.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newProduct);
    return { id: docRef.id, ...newProduct };
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw new Error("No se pudo crear el producto");
  }
};

/**
 * Actualizar producto
 */
export const updateProduct = async (productId, updates) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const updateData = {
      ...updates,
      searchName: updates.name ? updates.name.toLowerCase() : undefined,
      updatedAt: new Date(),
    };

    // Remover campos undefined
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(docRef, updateData);
    return { id: productId, ...updateData };
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw new Error("No se pudo actualizar el producto");
  }
};

/**
 * Eliminar producto
 */
export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, productId));
    return productId;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw new Error("No se pudo eliminar el producto");
  }
};

/**
 * Actualizar stock de producto
 */
export const updateProductStock = async (productId, newStock) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, {
      stock: newStock,
      updatedAt: new Date(),
    });
    return newStock;
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    throw new Error("No se pudo actualizar el stock");
  }
};

/**
 * Actualizar stock de múltiples productos (para ventas)
 */
export const updateMultipleProductsStock = async (stockUpdates) => {
  try {
    const batch = writeBatch(db);

    stockUpdates.forEach(({ productId, newStock }) => {
      const docRef = doc(db, COLLECTION_NAME, productId);
      batch.update(docRef, {
        stock: newStock,
        updatedAt: new Date(),
      });
    });

    await batch.commit();
    return stockUpdates;
  } catch (error) {
    console.error("Error al actualizar stocks múltiples:", error);
    throw new Error("No se pudieron actualizar los stocks");
  }
};

/**
 * Crear productos de ejemplo para desarrollo
 */
export const createSampleProducts = async () => {
  try {
    const sampleProducts = [
      {
        name: "Remera Básica Mujer",
        code: "RBM001",
        purchasePrice: 1500,
        salePrice: 3000,
        profitMargin: 100,
        category: "mujer",
        tags: ["básico", "remera", "algodón"],
        stock: 25,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["#FF0000", "#000000", "#FFFFFF", "#0000FF"],
        supplier: "Proveedor Ejemplo",
      },
      {
        name: "Jean Clásico Hombre",
        code: "JCH002",
        purchasePrice: 2500,
        salePrice: 5000,
        profitMargin: 100,
        category: "hombre",
        tags: ["jean", "clásico", "denim"],
        stock: 15,
        sizes: ["28", "30", "32", "34", "36", "38"],
        colors: ["#1E3A8A", "#000000"],
        supplier: "Proveedor Ejemplo",
      },
      {
        name: "Vestido Fiesta",
        code: "VF003",
        purchasePrice: 3000,
        salePrice: 7500,
        profitMargin: 150,
        category: "mujer",
        tags: ["vestido", "fiesta", "elegante"],
        stock: 8,
        sizes: ["S", "M", "L"],
        colors: ["#000000", "#FF0000", "#800080"],
        supplier: "Proveedor Ejemplo",
      },
      {
        name: "Campera Niños",
        code: "CN004",
        purchasePrice: 2000,
        salePrice: 4000,
        profitMargin: 100,
        category: "niños",
        tags: ["campera", "abrigo", "invierno"],
        stock: 12,
        sizes: ["2", "4", "6", "8", "10", "12"],
        colors: ["#FF0000", "#0000FF", "#008000"],
        supplier: "Proveedor Ejemplo",
      },
      {
        name: "Zapatillas Deportivas",
        code: "ZD005",
        purchasePrice: 4000,
        salePrice: 8000,
        profitMargin: 100,
        category: "otros",
        tags: ["zapatillas", "deporte", "running"],
        stock: 20,
        sizes: ["35", "36", "37", "38", "39", "40", "41", "42"],
        colors: ["#FFFFFF", "#000000", "#FF0000"],
        supplier: "Proveedor Ejemplo",
      },
    ];

    const createdProducts = [];
    for (const product of sampleProducts) {
      const created = await createProduct(product);
      createdProducts.push(created);
    }

    return createdProducts;
  } catch (error) {
    console.error("Error al crear productos de ejemplo:", error);
    throw new Error("No se pudieron crear los productos de ejemplo");
  }
};

/**
 * Obtener estadísticas de productos
 */
export const getProductStats = async () => {
  try {
    const products = await getAllProducts();

    const stats = {
      totalProducts: products.length,
      totalStock: products.reduce(
        (sum, product) => sum + (product.stock || 0),
        0
      ),
      lowStockProducts: products.filter((product) => (product.stock || 0) <= 5)
        .length,
      outOfStockProducts: products.filter(
        (product) => (product.stock || 0) === 0
      ).length,
      categories: {},
    };

    // Contar por categorías
    products.forEach((product) => {
      const category = product.category || "otros";
      stats.categories[category] = (stats.categories[category] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    throw new Error("No se pudieron obtener las estadísticas");
  }
};
