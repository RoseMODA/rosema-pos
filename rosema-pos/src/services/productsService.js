import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  onSnapshot,
  
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Servicio para gestión de productos en Firestore
 * Maneja CRUD de productos con variantes de la colección 'articulos'
 */

const COLLECTION_NAME = 'articulos';

/**
 * Obtener todos los productos de la colección 'articulos'
 */
export const getAllProducts = async () => {
  try {
    console.log('🔍 Intentando obtener productos de la colección:', COLLECTION_NAME);
    
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    console.log('📊 Documentos encontrados:', querySnapshot.size);
    
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 Documento encontrado:', doc.id, data);
      
      // Calcular stock total sumando todas las variantes
      const totalStock = Array.isArray(data.variantes) 
        ? data.variantes.reduce((acc, variant) => acc + (variant.stock || 0), 0)
        : 0;
      
      return {
        id: doc.id,
        ...data,
        // Mapear el campo 'articulo' como 'name' para compatibilidad
        name: data.articulo || 'Sin nombre',
        // Mantener el array de variantes original
        variantes: data.variantes || [],
        // Stock total calculado
        stock: totalStock
      };
    });
    
    console.log('✅ Productos procesados:', products.length);
    return products;
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    console.error('Error details:', error.message);
    
    // Intentar obtener al menos un documento para ver la estructura
    try {
      const simpleQuery = await getDocs(collection(db, COLLECTION_NAME));
      if (simpleQuery.size > 0) {
        const firstDoc = simpleQuery.docs[0];
        console.log('🔍 Estructura del primer documento:', firstDoc.data());
      }
    } catch (debugError) {
      console.error('❌ Error en debug query:', debugError);
    }
    
    throw new Error('No se pudieron cargar los productos: ' + error.message);
  }
};

/**
 * Buscar productos por término (nombre, código de barras o tags)
 * Prioriza coincidencias exactas por ID
 */
export const searchProducts = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();
    const allProducts = await getAllProducts();
    
    // Separar productos por tipo de coincidencia
    const exactIdMatches = [];
    const partialIdMatches = [];
    const nameMatches = [];
    const tagMatches = [];
    const providerMatches = [];
    const sizeMatches = [];
    
    allProducts.forEach(product => {
      const productId = product.id?.toLowerCase() || '';
      const productName = product.articulo?.toLowerCase() || '';
      const productTags = Array.isArray(product.tags) 
        ? product.tags.map(tag => tag.toLowerCase()).join(' ')
        : '';
      const providerField = product.proveedorId ? product.proveedorId.toString().toLowerCase() : '';
      const variantSizeMatch = product.variantes && Array.isArray(product.variantes)
        ? product.variantes.some(variant => variant.talle && variant.talle.toLowerCase().includes(term))
        : false;
      
      // Coincidencia exacta por ID (máxima prioridad)
      if (productId === term) {
        exactIdMatches.push(product);
      }
      // Coincidencia parcial por ID
      else if (productId.includes(term)) {
        partialIdMatches.push(product);
      }
      // Coincidencia por nombre
      else if (productName.includes(term)) {
        nameMatches.push(product);
      }
      // Coincidencia por tags
      else if (productTags.includes(term)) {
        tagMatches.push(product);
      }
      // Nuevo: Coincidencia por proveedor
      else if (providerField.includes(term)) {
        providerMatches.push(product);
      }
      // Nuevo: Coincidencia por talle en variantes
      else if (variantSizeMatch) {
        sizeMatches.push(product);
      }
    });
    
    // Combinar resultados priorizando coincidencias exactas
    const results = [
      ...exactIdMatches,
      ...partialIdMatches,
      ...nameMatches,
      ...tagMatches,
      ...providerMatches,
      ...sizeMatches
    ];

    return results.slice(0, 10); // Limitar a 10 resultados
  } catch (error) {
    console.error('Error al buscar productos:', error);
    throw new Error('Error en la búsqueda de productos');
  }
};

/**
 * Obtener producto por código de barras (ID)
 */
export const getProductByBarcode = async (barcode) => {
  try {
    console.log("🔎 Buscando producto en Firestore por campo id:", barcode);

    const q = query(collection(db, COLLECTION_NAME), where("id", "==", barcode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Producto no encontrado");
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    const totalStock = Array.isArray(data.variantes)
      ? data.variantes.reduce((acc, v) => acc + (v.stock || 0), 0)
      : 0;

    return {
      id: docSnap.id,            // el UID de Firestore
      codigo: data.id,           // el código de barras que usaste
      ...data,
      name: data.articulo || "Sin nombre",
      variantes: data.variantes || [],
      stock: totalStock,
    };
  } catch (error) {
    console.error("Error al buscar producto por código:", error);
    throw error;
  }
};


/**
 * Obtener producto por ID (mantener compatibilidad)
 */
export const getProductById = async (productId) => {
  const productRef = doc(db, articulos, productId);
  const snap = await getDoc(productRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Verificar si existe un producto con el mismo código
 */
export const checkProductCodeExists = async (code, excludeId = null) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('id', '==', code)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Si estamos editando, excluir el producto actual
    if (excludeId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeId);
    }
    
    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Error al verificar código:', error);
    return false;
  }
};

/**
 * Crear nuevo producto
 */
export const createProduct = async (productData) => {
  try {
    // Verificar que el código no exista
    const codeExists = await checkProductCodeExists(productData.id);
    if (codeExists) {
      throw new Error('Ya existe un producto con este código de barras');
    }

    const newProduct = {
      ...productData,
      searchName: (productData.articulo || '').toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Usar el ID del producto como ID del documento en Firestore
    const docRef = doc(db, COLLECTION_NAME, productData.id);
    await setDoc(docRef, newProduct);
    
    return { id: productData.id, ...newProduct };
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw new Error(error.message || 'No se pudo crear el producto');
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
      updatedAt: new Date()
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(docRef, updateData);
    return { id: productId, ...updateData };
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw new Error('No se pudo actualizar el producto');
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
    console.error('Error al eliminar producto:', error);
    throw new Error('No se pudo eliminar el producto');
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
      updatedAt: new Date()
    });
    return newStock;
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    throw new Error('No se pudo actualizar el stock');
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
        updatedAt: new Date()
      });
    });

    await batch.commit();
    return stockUpdates;
  } catch (error) {
    console.error('Error al actualizar stocks múltiples:', error);
    throw new Error('No se pudieron actualizar los stocks');
  }
};

/**
 * Crear productos de ejemplo para desarrollo
 */
export const createSampleProducts = async () => {
  try {
    const sampleProducts = [
      {
        name: 'Remera Básica Mujer',
        code: 'RBM001',
        purchasePrice: 1500,
        salePrice: 3000,
        profitMargin: 100,
        category: 'mujer',
        tags: ['básico', 'remera', 'algodón'],
        stock: 25,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['#FF0000', '#000000', '#FFFFFF', '#0000FF'],
        supplier: 'Proveedor Ejemplo'
      },
      {
        name: 'Jean Clásico Hombre',
        code: 'JCH002',
        purchasePrice: 2500,
        salePrice: 5000,
        profitMargin: 100,
        category: 'hombre',
        tags: ['jean', 'clásico', 'denim'],
        stock: 15,
        sizes: ['28', '30', '32', '34', '36', '38'],
        colors: ['#1E3A8A', '#000000'],
        supplier: 'Proveedor Ejemplo'
      },
      {
        name: 'Vestido Fiesta',
        code: 'VF003',
        purchasePrice: 3000,
        salePrice: 7500,
        profitMargin: 150,
        category: 'mujer',
        tags: ['vestido', 'fiesta', 'elegante'],
        stock: 8,
        sizes: ['S', 'M', 'L'],
        colors: ['#000000', '#FF0000', '#800080'],
        supplier: 'Proveedor Ejemplo'
      },
      {
        name: 'Campera Niños',
        code: 'CN004',
        purchasePrice: 2000,
        salePrice: 4000,
        profitMargin: 100,
        category: 'niños',
        tags: ['campera', 'abrigo', 'invierno'],
        stock: 12,
        sizes: ['2', '4', '6', '8', '10', '12'],
        colors: ['#FF0000', '#0000FF', '#008000'],
        supplier: 'Proveedor Ejemplo'
      },
      {
        name: 'Zapatillas Deportivas',
        code: 'ZD005',
        purchasePrice: 4000,
        salePrice: 8000,
        profitMargin: 100,
        category: 'otros',
        tags: ['zapatillas', 'deporte', 'running'],
        stock: 20,
        sizes: ['35', '36', '37', '38', '39', '40', '41', '42'],
        colors: ['#FFFFFF', '#000000', '#FF0000'],
        supplier: 'Proveedor Ejemplo'
      }
    ];

    const createdProducts = [];
    for (const product of sampleProducts) {
      const created = await createProduct(product);
      createdProducts.push(created);
    }

    return createdProducts;
  } catch (error) {
    console.error('Error al crear productos de ejemplo:', error);
    throw new Error('No se pudieron crear los productos de ejemplo');
  }
};

/**
 * Suscribirse a cambios en tiempo real de productos
 */
export const subscribeToProducts = (callback) => {
  const q = collection(db, COLLECTION_NAME);
  return onSnapshot(q, (querySnapshot) => {
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Calcular stock total
      const totalStock = Array.isArray(data.variantes) 
        ? data.variantes.reduce((acc, variant) => acc + (variant.stock || 0), 0)
        : 0;
      
      return {
        id: doc.id,
        ...data,
        name: data.articulo || 'Sin nombre',
        variantes: data.variantes || [],
        stock: totalStock
      };
    });
    callback(products);
  }, (error) => {
    console.error('Error en suscripción a productos:', error);
  });
};

/**
 * Actualizar stock de variante específica (descontar)
 */
export const updateVariantStock = async (productId, variantToUpdate, quantitySold) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const productDoc = await getDoc(docRef);
    
    if (!productDoc.exists()) {
      throw new Error("Producto no encontrado");
    }
    
    const productData = productDoc.data();
    const variants = productData.variantes || [];
    
    const updatedVariants = variants.map(variant => {
      if (variant.talle === variantToUpdate.talle && 
          variant.color === variantToUpdate.color) {
        if (variant.stock < quantitySold) {
          throw new Error(`Stock insuficiente. Disponible: ${variant.stock}, Solicitado: ${quantitySold}`);
        }
        return { ...variant, stock: variant.stock - quantitySold };
      }
      return variant;
    });
    
    await updateDoc(docRef, { 
      variantes: updatedVariants, 
      updatedAt: new Date() 
    });
    
    console.log(`✅ Stock descontado para producto ${productId}:`, variantToUpdate);
    return updatedVariants;
  } catch (error) {
    console.error("Error actualizando stock de variante:", error);
    throw error;
  }
};

/**
 * Incrementar stock de variante específica (para devoluciones)
 */
export const incrementVariantStock = async (productId, variantToUpdate, quantityReturned) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const productDoc = await getDoc(docRef);
    
    if (!productDoc.exists()) {
      throw new Error("Producto no encontrado");
    }
    
    const productData = productDoc.data();
    const variants = productData.variantes || [];
    
    const updatedVariants = variants.map(variant => {
      if (variant.talle === variantToUpdate.talle && 
          variant.color === variantToUpdate.color) {
        return { ...variant, stock: variant.stock + quantityReturned };
      }
      return variant;
    });
    
    await updateDoc(docRef, { 
      variantes: updatedVariants, 
      updatedAt: new Date() 
    });
    
    console.log(`✅ Stock incrementado para producto ${productId}:`, variantToUpdate);
    return updatedVariants;
  } catch (error) {
    console.error("Error incrementando stock de variante:", error);
    throw error;
  }
};

/**
 * Obtener estadísticas de productos
 */
export const getProductStats = async () => {
  try {
    const products = await getAllProducts();
    
    // Calcular costo total y ganancia esperada
    let totalCost = 0;
    let expectedProfit = 0;
    
    products.forEach(product => {
      const stock = product.stock || 0;
      const cost = product.precioCosto || 0;
      
      // Sumar costo total del inventario
      totalCost += stock * cost;
      
      // Calcular ganancia esperada
      if (product.variantes && Array.isArray(product.variantes)) {
        // Si tiene variantes, calcular ganancia promedio por variante
        product.variantes.forEach(variant => {
          const variantStock = variant.stock || 0;
          const variantSalePrice = variant.precioVenta || 0;
          const profit = variantSalePrice - cost;
          expectedProfit += variantStock * profit;
        });
      } else {
        // Si no tiene variantes, usar precio de venta general
        const salePrice = product.precioVenta || 0;
        const profit = salePrice - cost;
        expectedProfit += stock * profit;
      }
    });
    
    const stats = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, product) => sum + (product.stock || 0), 0),
      lowStockProducts: products.filter(product => (product.stock || 0) <= 5).length,
      outOfStockProducts: products.filter(product => (product.stock || 0) === 0).length,
      totalCost: Math.round(totalCost),
      expectedProfit: Math.round(expectedProfit),
      categories: {}
    };

    // Contar por categorías
    products.forEach(product => {
      const category = product.categoria || 'otros';
      stats.categories[category] = (stats.categories[category] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw new Error('No se pudieron obtener las estadísticas');
  }
};
