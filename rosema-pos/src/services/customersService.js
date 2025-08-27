import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Servicio para gestión de clientes en Firestore
 * Implementa sistema CRM básico con historial de compras
 */

const COLLECTION_NAME = 'clientes';

/**
 * Obtener todos los clientes
 */
export const getAllCustomers = async () => {
  try {
    console.log('🔍 Obteniendo clientes de la colección:', COLLECTION_NAME);
    
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    );
    
    console.log('📊 Clientes encontrados:', querySnapshot.size);
    
    const customers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        // Asegurar que los campos requeridos existan
        nombre: data.nombre || data.name || 'Sin nombre',
        telefono: data.telefono || data.phone || '',
        email: data.email || '',
        direccion: data.direccion || data.address || '',
        fechaNacimiento: data.fechaNacimiento || null,
        notas: data.notas || '',
        tags: data.tags || [],
        // Estadísticas calculadas
        totalCompras: data.totalCompras || 0,
        montoTotalGastado: data.montoTotalGastado || 0,
        ultimaCompra: data.ultimaCompra || null,
        categoriasPreferidas: data.categoriasPreferidas || [],
        tallesPreferidos: data.tallesPreferidos || []
      };
    });
    
    console.log('✅ Clientes procesados:', customers.length);
    return customers;
  } catch (error) {
    console.error('❌ Error al obtener clientes:', error);
    throw new Error('No se pudieron cargar los clientes: ' + error.message);
  }
};

/**
 * Obtener cliente por ID
 */
export const getCustomerById = async (customerId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, customerId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        nombre: data.nombre || 'Sin nombre',
        telefono: data.telefono || '',
        email: data.email || '',
        direccion: data.direccion || '',
        fechaNacimiento: data.fechaNacimiento || null,
        notas: data.notas || '',
        tags: data.tags || [],
        totalCompras: data.totalCompras || 0,
        montoTotalGastado: data.montoTotalGastado || 0,
        ultimaCompra: data.ultimaCompra || null,
        categoriasPreferidas: data.categoriasPreferidas || [],
        tallesPreferidos: data.tallesPreferidos || []
      };
    } else {
      throw new Error('Cliente no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw error;
  }
};

/**
 * Crear nuevo cliente
 */
export const createCustomer = async (customerData) => {
  try {
    // Validar datos requeridos
    if (!customerData.nombre || !customerData.nombre.trim()) {
      throw new Error('El nombre del cliente es requerido');
    }

    const newCustomer = {
      nombre: customerData.nombre.trim(),
      telefono: customerData.telefono || '',
      email: customerData.email || '',
      direccion: customerData.direccion || '',
      fechaNacimiento: customerData.fechaNacimiento || null,
      notas: customerData.notas || '',
      tags: customerData.tags || [],
      // Estadísticas iniciales
      totalCompras: 0,
      montoTotalGastado: 0,
      ultimaCompra: null,
      categoriasPreferidas: [],
      tallesPreferidos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newCustomer);
    return { id: docRef.id, ...newCustomer };
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw new Error('No se pudo crear el cliente: ' + error.message);
  }
};

/**
 * Actualizar cliente
 */
export const updateCustomer = async (customerId, updates) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, customerId);
    
    // Validar datos requeridos
    if (updates.nombre !== undefined && (!updates.nombre || !updates.nombre.trim())) {
      throw new Error('El nombre del cliente es requerido');
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(docRef, updateData);
    return { id: customerId, ...updateData };
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    throw new Error('No se pudo actualizar el cliente: ' + error.message);
  }
};

/**
 * Eliminar cliente
 */
export const deleteCustomer = async (customerId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, customerId));
    return customerId;
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    throw new Error('No se pudo eliminar el cliente: ' + error.message);
  }
};

/**
 * Buscar clientes por término
 */
export const searchCustomers = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const customers = await getAllCustomers();
    const term = searchTerm.toLowerCase().trim();
    
    return customers.filter(customer => {
      // Buscar en nombre
      if (customer.nombre && customer.nombre.toLowerCase().includes(term)) {
        return true;
      }

      // Buscar en teléfono
      if (customer.telefono && customer.telefono.includes(term)) {
        return true;
      }

      // Buscar en email
      if (customer.email && customer.email.toLowerCase().includes(term)) {
        return true;
      }

      // Buscar en tags
      if (customer.tags && Array.isArray(customer.tags)) {
        if (customer.tags.some(tag => tag.toLowerCase().includes(term))) {
          return true;
        }
      }

      return false;
    });
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    throw new Error('Error en la búsqueda de clientes: ' + error.message);
  }
};

/**
 * Obtener estadísticas de clientes
 */
export const getCustomerStats = async () => {
  try {
    const customers = await getAllCustomers();
    
    const stats = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(customer => customer.totalCompras > 0).length,
      newCustomersThisMonth: 0,
      topCustomers: [],
      averageSpending: 0,
      totalRevenue: 0
    };

    // Calcular clientes nuevos este mes
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    stats.newCustomersThisMonth = customers.filter(customer => {
      if (!customer.createdAt) return false;
      const createdDate = customer.createdAt.seconds ? 
        new Date(customer.createdAt.seconds * 1000) : 
        new Date(customer.createdAt);
      return createdDate >= thisMonth;
    }).length;

    // Calcular ingresos totales y promedio
    stats.totalRevenue = customers.reduce((sum, customer) => sum + (customer.montoTotalGastado || 0), 0);
    stats.averageSpending = customers.length > 0 ? stats.totalRevenue / customers.length : 0;

    // Top 10 clientes
    stats.topCustomers = customers
      .filter(customer => customer.totalCompras > 0)
      .sort((a, b) => (b.montoTotalGastado || 0) - (a.montoTotalGastado || 0))
      .slice(0, 10)
      .map(customer => ({
        id: customer.id,
        nombre: customer.nombre,
        totalCompras: customer.totalCompras,
        montoTotalGastado: customer.montoTotalGastado,
        ultimaCompra: customer.ultimaCompra
      }));

    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas de clientes:', error);
    throw new Error('No se pudieron obtener las estadísticas: ' + error.message);
  }
};

/**
 * Obtener historial de compras de un cliente
 */
export const getCustomerPurchaseHistory = async (customerId) => {
  try {
    console.log('🔍 Obteniendo historial de compras para cliente:', customerId);
    
    // Buscar ventas donde el customerName coincida con el nombre del cliente
    const customer = await getCustomerById(customerId);
    
    const ventasQuery = query(
      collection(db, 'ventas'),
      where('customerName', '==', customer.nombre),
      orderBy('saleDate', 'desc')
    );
    
    const ventasSnapshot = await getDocs(ventasQuery);
    const purchases = ventasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      saleDate: doc.data().saleDate?.toDate() || new Date()
    }));

    console.log(`📦 Compras encontradas para ${customer.nombre}:`, purchases.length);
    return purchases;
  } catch (error) {
    console.error('❌ Error al obtener historial de compras:', error);
    return [];
  }
};

/**
 * Actualizar estadísticas de cliente basado en una nueva venta
 */
export const updateCustomerStats = async (customerName, saleData) => {
  try {
    if (!customerName || !customerName.trim()) {
      console.log('ℹ️ No hay nombre de cliente para actualizar estadísticas');
      return;
    }

    console.log('🔄 Actualizando estadísticas para cliente:', customerName);

    // Buscar cliente por nombre
    const customers = await getAllCustomers();
    let customer = customers.find(c => c.nombre.toLowerCase() === customerName.toLowerCase());

    // Si no existe, crear cliente automáticamente
    if (!customer) {
      console.log('👤 Creando nuevo cliente automáticamente:', customerName);
      customer = await createCustomer({
        nombre: customerName,
        telefono: '',
        email: '',
        direccion: '',
        notas: 'Cliente creado automáticamente desde venta'
      });
    }

    // Calcular nuevas estadísticas
    const newTotalCompras = (customer.totalCompras || 0) + 1;
    const newMontoTotal = (customer.montoTotalGastado || 0) + (saleData.total || 0);

    // Analizar categorías y talles de la venta
    const categoriasEnVenta = [];
    const tallesEnVenta = [];

    if (saleData.items && Array.isArray(saleData.items)) {
      saleData.items.forEach(item => {
        // Obtener categoría del producto (esto requeriría consultar la colección de productos)
        if (item.talle) {
          tallesEnVenta.push(item.talle);
        }
      });
    }

    // Actualizar categorías y talles preferidos
    const categoriasPreferidas = [...(customer.categoriasPreferidas || []), ...categoriasEnVenta];
    const tallesPreferidos = [...(customer.tallesPreferidos || []), ...tallesEnVenta];

    // Actualizar cliente
    await updateCustomer(customer.id, {
      totalCompras: newTotalCompras,
      montoTotalGastado: newMontoTotal,
      ultimaCompra: new Date(),
      categoriasPreferidas: [...new Set(categoriasPreferidas)], // Eliminar duplicados
      tallesPreferidos: [...new Set(tallesPreferidos)] // Eliminar duplicados
    });

    console.log('✅ Estadísticas de cliente actualizadas');
  } catch (error) {
    console.error('❌ Error al actualizar estadísticas de cliente:', error);
    // No lanzar error para no interrumpir el proceso de venta
  }
};

/**
 * Obtener clientes más frecuentes
 */
export const getTopCustomers = async (limitCount = 10) => {
  try {
    const customers = await getAllCustomers();
    
    return customers
      .filter(customer => customer.totalCompras > 0)
      .sort((a, b) => {
        // Ordenar por número de compras, luego por monto gastado
        if (b.totalCompras !== a.totalCompras) {
          return b.totalCompras - a.totalCompras;
        }
        return (b.montoTotalGastado || 0) - (a.montoTotalGastado || 0);
      })
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error al obtener top clientes:', error);
    return [];
  }
};

/**
 * Obtener análisis de preferencias de un cliente
 */
export const getCustomerPreferences = async (customerId) => {
  try {
    const customer = await getCustomerById(customerId);
    const purchases = await getCustomerPurchaseHistory(customerId);

    // Analizar categorías más compradas
    const categoryCount = {};
    const sizeCount = {};
    const monthlySpending = {};

    purchases.forEach(purchase => {
      // Analizar por mes
      const month = purchase.saleDate.toISOString().slice(0, 7); // YYYY-MM
      monthlySpending[month] = (monthlySpending[month] || 0) + (purchase.total || 0);

      // Analizar items
      if (purchase.items && Array.isArray(purchase.items)) {
        purchase.items.forEach(item => {
          if (item.talle) {
            sizeCount[item.talle] = (sizeCount[item.talle] || 0) + (item.quantity || 1);
          }
        });
      }
    });

    // Obtener top 5 de cada categoría
    const topSizes = Object.entries(sizeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([size, count]) => ({ size, count }));

    const monthlyData = Object.entries(monthlySpending)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));

    return {
      customer,
      purchases,
      preferences: {
        topSizes,
        monthlySpending: monthlyData,
        averageOrderValue: purchases.length > 0 ? 
          purchases.reduce((sum, p) => sum + (p.total || 0), 0) / purchases.length : 0,
        purchaseFrequency: purchases.length,
        lastPurchase: purchases.length > 0 ? purchases[0].saleDate : null
      }
    };
  } catch (error) {
    console.error('Error al obtener preferencias del cliente:', error);
    throw error;
  }
};
