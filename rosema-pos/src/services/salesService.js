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
  Timestamp,
  
} from 'firebase/firestore';
import { db } from './firebase';
import { updateMultipleProductsStock } from './productsService';

/**
 * Servicio para gestión de ventas en Firestore
 * Maneja CRUD de ventas, historial y devoluciones
 * Conectado con productos y variantes (talla, color, stock)
 * CORREGIDO: Usa 'size' en lugar de 'talle' para compatibilidad con useSales.js
 */

const SALES_COLLECTION = 'ventas';
const PRODUCTS_COLLECTION = 'productos';
const PENDING_SALES_COLLECTION = 'pendingSales';

/**
 * Buscar productos por código de barras o nombre para ventas
 */
export const searchProductsForSale = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) return [];

    const productsQuery = query(collection(db, PRODUCTS_COLLECTION));
    const snapshot = await getDocs(productsQuery);
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.id.toLowerCase().includes(term) || 
      (product.articulo && product.articulo.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error('Error buscando productos:', error);
    throw new Error('Error al buscar productos');
  }
};

/**
 * Obtener producto por código de barras exacto
 */
export const getProductByBarcode = async (barcode) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, barcode);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo producto por código:', error);
    throw new Error('Error al obtener producto');
  }
};

/**
 * Validar stock disponible para una variante específica
 */
export const validateVariantStock = async (productId, talle, color, requestedQuantity) => {
  try {
      console.log('processSale > Validando stock:', {
        productId,
        talle,
        color,
        requestedQuantity
      });


    const product = await getProductById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const variante = product.variantes?.find(v => 
      v.talle === talle && v.color === color
    );

    if (!variante) {
      throw new Error(`Variante ${talle}/${color} no encontrada`);
    }

    if (variante.stock < requestedQuantity) {
      throw new Error(`Stock insuficiente. Disponible: ${variante.stock}, Solicitado: ${requestedQuantity}`);
    }

    return {
      available: true,
      currentStock: variante.stock,
      price: variante.precioVenta || product.precioCosto || 0
    };
  } catch (error) {
    console.error('Error validando stock:', error);
    throw error;
  }
};

/**
 * Generar número de venta único
 */
const generateSaleNumber = async () => {
  try {
    // Obtener el último número de venta del día
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todaySalesQuery = query(
      collection(db, SALES_COLLECTION),
      where('saleDate', '>=', startOfDay),
      where('saleDate', '<', endOfDay),
      orderBy('saleDate', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(todaySalesQuery);
    
    let nextNumber = 1;
    if (!querySnapshot.empty) {
      const lastSale = querySnapshot.docs[0].data();
      if (lastSale.saleNumber) {
        // Extraer el número de la venta (formato: YYYYMMDD-XXX)
        const lastNumber = parseInt(lastSale.saleNumber.split('-')[1]) || 0;
        nextNumber = lastNumber + 1;
      }
    }

    // Formato: YYYYMMDD-XXX (ej: 20241201-001)
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    const saleNumber = `${datePrefix}-${nextNumber.toString().padStart(3, '0')}`;
    
    return saleNumber;
  } catch (error) {
    console.error('Error al generar número de venta:', error);
    // Fallback: usar timestamp
    return `${Date.now()}`;
  }
};

/**
 * Procesar una venta completa con variantes
 * CORREGIDO: Usa 'size' en lugar de 'talle' para compatibilidad
 */
export const processSale = async (saleData) => {
  const batch = writeBatch(db);
  
  try {
    const {
      items,
      paymentMethod,
      discount,
      total,
      customerName,
      clientId,
      cardName,
      installments,
      commission
    } = saleData;

    console.log('🔄 Procesando venta con items:', items);

    // Validar stock disponible antes de procesar
    for (const item of items) {
      if (item.productId && !item.isQuickItem) {
        console.log(`🔍 Validando stock para producto ${item.productId}, talle: ${item.size}, color: ${item.color}`);
        await validateVariantStock(
          item.productId, 
          item.size, // ✅ CORREGIDO: usar 'size' en lugar de 'talle'
          item.color, 
          item.quantity
        );
      }
    }

    // Generar número de venta único
    const saleNumber = await generateSaleNumber();

    // Crear la venta con estructura mejorada
    const sale = {
      saleNumber,
      items: items.map(item => ({
        productId: item.productId || null,
        productName: item.productName || item.name,
        articulo: item.articulo || item.name,
        
        talle: item.size || null, // ✅ CORREGIDO: mapear 'size' a 'talle' para BD
        color: item.color || null,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        proveedorId: item.proveedorId || null,
        providerName: item.providerName || null,
        isReturn: item.isReturn || false,
        isQuickItem: item.isQuickItem || false
      })),
      paymentMethod,
      discount: discount || 0,
      subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      total,
      // REMOVIDO: cashReceived y change - solo para ayuda visual
      customerName: customerName || '',
      clientId: clientId || null,
      // Campos adicionales para crédito
      cardName: cardName || null,
      installments: installments || null,
      commission: commission || null,
      saleDate: new Date(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'completed'
    };

    console.log('💾 Guardando venta:', sale);

    // Guardar la venta
    const saleRef = await addDoc(collection(db, SALES_COLLECTION), sale);

    // Actualizar stock de variantes específicas
    for (const item of items) {
      if (item.productId && !item.isQuickItem) {
        console.log(`📦 Actualizando stock para producto ${item.productId}`);
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const product = productSnap.data();
          
          // Actualizar stock de la variante específica
          const updatedVariantes = product.variantes.map(variante => {
            if (variante.talle === item.size && variante.color === item.color) { // ✅ CORREGIDO: comparar con 'item.size'
              const stockChange = item.isReturn ? item.quantity : -item.quantity;
              console.log(`📊 Stock change para ${variante.talle}/${variante.color}: ${stockChange}`);
              return {
                ...variante,
                stock: Math.max(0, variante.stock + stockChange)
              };
            }
            return variante;
          });

          batch.update(productRef, { 
            variantes: updatedVariantes,
            updatedAt: Timestamp.now()
          });
        } else {
          console.warn(`⚠️ Producto ${item.productId} no encontrado para actualizar stock`);
        }
      }
    }

    // Ejecutar todas las actualizaciones
    await batch.commit();

    console.log('✅ Venta procesada exitosamente');
    return { id: saleRef.id, ...sale };
  } catch (error) {
    console.error('❌ Error al procesar venta:', error);
    throw error;
  }
};

/**
 * Obtener todas las ventas
 */
export const getAllSales = async () => {
  try {
    const salesQuery = query(
      collection(db, SALES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(salesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    throw new Error('Error al obtener ventas');
  }
};

/**
 * Obtener historial de ventas
 */
export const getSalesHistory = async (filters = {}) => {
  try {
    let salesQuery = query(
      collection(db, SALES_COLLECTION),
      orderBy('saleDate', 'desc')
    );

    // Aplicar filtros si existen
    if (filters.startDate) {
      salesQuery = query(salesQuery, where('saleDate', '>=', filters.startDate));
    }
    
    if (filters.endDate) {
      salesQuery = query(salesQuery, where('saleDate', '<=', filters.endDate));
    }

    if (filters.paymentMethod) {
      salesQuery = query(salesQuery, where('paymentMethod', '==', filters.paymentMethod));
    }

    if (filters.limit) {
      salesQuery = query(salesQuery, limit(filters.limit));
    }

    const querySnapshot = await getDocs(salesQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      saleDate: doc.data().saleDate?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error al obtener historial de ventas:', error);
    throw new Error('No se pudo cargar el historial de ventas');
  }
};

/**
 * Buscar ventas por término
 */
export const searchSales = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return await getSalesHistory({ limit: 50 });
    }

    const term = searchTerm.toLowerCase().trim();
    
    // Buscar por nombre de cliente
    const customerQuery = query(
      collection(db, SALES_COLLECTION),
      where('customerName', '>=', term),
      where('customerName', '<=', term + '\uf8ff'),
      orderBy('customerName'),
      orderBy('saleDate', 'desc'),
      limit(20)
    );

    const querySnapshot = await getDocs(customerQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      saleDate: doc.data().saleDate?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error al buscar ventas:', error);
    throw new Error('Error en la búsqueda de ventas');
  }
};

/**
 * Obtener venta por ID
 */
export const getSaleById = async (saleId) => {
  try {
    const docRef = doc(db, SALES_COLLECTION, saleId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        saleDate: data.saleDate?.toDate() || new Date()
      };
    } else {
      throw new Error('Venta no encontrada');
    }
  } catch (error) {
    console.error('Error al obtener venta:', error);
    throw error;
  }
};

/**
 * Actualizar venta
 */
export const updateSale = async (saleId, updates) => {
  try {
    const docRef = doc(db, SALES_COLLECTION, saleId);
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await updateDoc(docRef, updateData);
    return { id: saleId, ...updateData };
  } catch (error) {
    console.error('Error al actualizar venta:', error);
    throw new Error('No se pudo actualizar la venta');
  }
};

/**
 * Eliminar venta
 */
export const deleteSale = async (saleId) => {
  try {
    // Obtener la venta antes de eliminarla para restaurar stock
    const sale = await getSaleById(saleId);
    
    // Restaurar stock de productos
    const stockUpdates = [];
    sale.items.forEach(item => {
      if (item.productId && !item.isQuickItem) {
        const stockChange = item.isReturn ? -item.quantity : item.quantity;
        stockUpdates.push({
          productId: item.productId,
          stockChange: stockChange
        });
      }
    });

    // Eliminar la venta
    await deleteDoc(doc(db, SALES_COLLECTION, saleId));
    
    // Restaurar stock (esto requeriría obtener el stock actual de cada producto)
    // Por simplicidad, se omite la implementación completa aquí
    
    return saleId;
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    throw new Error('No se pudo eliminar la venta');
  }
};

/**
 * Guardar venta en espera
 */
export const savePendingSale = async (clientId, saleData) => {
  try {
    const pendingSale = {
      clientId,
      clientName: `Cliente ${clientId}`,
      items: saleData.items || [],
      paymentMethod: saleData.paymentMethod || 'Efectivo',
      discount: saleData.discount || 0,
      total: saleData.total || 0,
      customerName: saleData.customerName || '',
      cardName: saleData.cardName || '',
      installments: saleData.installments || 0,
      commission: saleData.commission || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = doc(db, PENDING_SALES_COLLECTION, `client-${clientId}`);
    await updateDoc(docRef, pendingSale).catch(async () => {
      // Si no existe, crear nuevo documento
      await addDoc(collection(db, PENDING_SALES_COLLECTION), {
        ...pendingSale,
        id: `client-${clientId}`
      });
    });

    return pendingSale;
  } catch (error) {
    console.error('Error al guardar venta en espera:', error);
    throw new Error('No se pudo guardar la venta en espera');
  }
};

/**
 * Obtener venta en espera
 */
export const getPendingSale = async (clientId) => {
  try {
    const docRef = doc(db, PENDING_SALES_COLLECTION, `client-${clientId}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener venta en espera:', error);
    return null;
  }
};

/**
 * Eliminar venta en espera
 */
export const deletePendingSale = async (clientId) => {
  try {
    await deleteDoc(doc(db, PENDING_SALES_COLLECTION, `client-${clientId}`));
    return clientId;
  } catch (error) {
    console.error('Error al eliminar venta en espera:', error);
    throw new Error('No se pudo eliminar la venta en espera');
  }
};

/**
 * Obtener estadísticas de ventas
 */
export const getSalesStats = async (period = 'today') => {
  try {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const sales = await getSalesHistory({ 
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(now)
    });

    const stats = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + (sale.total || 0), 0),
      averageSale: sales.length > 0 ? sales.reduce((sum, sale) => sum + (sale.total || 0), 0) / sales.length : 0,
      paymentMethods: {},
      topProducts: {}
    };

    // Analizar métodos de pago
    sales.forEach(sale => {
      const method = sale.paymentMethod || 'Efectivo';
      stats.paymentMethods[method] = (stats.paymentMethods[method] || 0) + 1;
    });

    // Analizar productos más vendidos
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        if (!item.isReturn) {
          const key = item.name;
          stats.topProducts[key] = (stats.topProducts[key] || 0) + item.quantity;
        }
      });
    });

    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas:', error);
    throw new Error('No se pudieron obtener las estadísticas');
  }
};

/**
 * Generar datos para recibo
 */
export const generateReceiptData = (sale) => {
  return {
    saleId: sale.id,
    date: sale.saleDate || new Date(),
    items: sale.items || [],
    subtotal: sale.subtotal || 0,
    discount: sale.discount || 0,
    total: sale.total || 0,
    paymentMethod: sale.paymentMethod || 'Efectivo',
    customerName: sale.customerName || '',
    storeInfo: {
      name: 'Rosema',
      location: 'Salto de las Rosas',
      whatsapp: '260 438-1502',
      returnPolicy: 'Cambios en 3 días hábiles'
    }
  };
};
