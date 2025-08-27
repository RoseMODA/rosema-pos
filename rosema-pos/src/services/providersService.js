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
  where 
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Servicio para gestión de proveedores en Firestore
 * Implementa todos los requisitos de la Etapa 5
 * CORREGIDO: Usa colección 'articulos' para estadísticas de productos
 */

const COLLECTION_NAME = 'proveedores';

/**
 * Obtener todos los proveedores
 */
export const getAllProviders = async () => {
  try {
    console.log('🔍 Obteniendo proveedores de la colección:', COLLECTION_NAME);
    
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    console.log('📊 Proveedores encontrados:', querySnapshot.size);
    
    const providers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        // Asegurar que los campos requeridos existan
        proveedor: data.proveedor || data.name || data.nombre || 'Sin nombre',
        locales: data.locales || [{ direccion: '', area: '', galeria: '', pasillo: '', local: '' }],
        tags: data.tags || [],
        talles: data.talles || []
      };
    });
    
    console.log('✅ Proveedores procesados:', providers.length);
    return providers;
  } catch (error) {
    console.error('❌ Error al obtener proveedores:', error);
    throw new Error('No se pudieron cargar los proveedores: ' + error.message);
  }
};

/**
 * Obtener proveedor por ID
 */
export const getProviderById = async (providerId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, providerId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        proveedor: data.proveedor || 'Sin nombre',
        locales: data.locales || [{ direccion: '', area: '', galeria: '', pasillo: '', local: '' }],
        tags: data.tags || [],
        talles: data.talles || []
      };
    } else {
      throw new Error('Proveedor no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    throw error;
  }
};

/**
 * Crear nuevo proveedor
 */
export const createProvider = async (providerData) => {
  try {
    // Validar datos requeridos
    if (!providerData.proveedor || !providerData.proveedor.trim()) {
      throw new Error('El nombre del proveedor es requerido');
    }

    const newProvider = {
      proveedor: providerData.proveedor.trim(),
      cuit: providerData.cuit || null,
      whattsapp: providerData.whattsapp || null,
      whattsapp2: providerData.whattsapp2 || null,
      catalogo: providerData.catalogo || null,
      web: providerData.web || null,
      categoria: providerData.categoria || null,
      locales: providerData.locales && providerData.locales.length > 0 
        ? providerData.locales 
        : [{ direccion: '', area: '', galeria: '', pasillo: '', local: '' }],
      tags: providerData.tags || [],
      instagram: providerData.instagram || null,
      tiktok: providerData.tiktok || null,
      calidad: providerData.calidad || null,
      precios: providerData.precios || null,
      notas: providerData.notas || null,
      talles: providerData.talles || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newProvider);
    return { id: docRef.id, ...newProvider };
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    throw new Error('No se pudo crear el proveedor: ' + error.message);
  }
};

/**
 * Actualizar proveedor
 */
export const updateProvider = async (providerId, updates) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, providerId);
    
    // Validar datos requeridos
    if (updates.proveedor !== undefined && (!updates.proveedor || !updates.proveedor.trim())) {
      throw new Error('El nombre del proveedor es requerido');
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
    return { id: providerId, ...updateData };
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    throw new Error('No se pudo actualizar el proveedor: ' + error.message);
  }
};

/**
 * Eliminar proveedor
 */
export const deleteProvider = async (providerId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, providerId));
    return providerId;
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    throw new Error('No se pudo eliminar el proveedor: ' + error.message);
  }
};

/**
 * Obtener estadísticas de proveedores
 */
export const getProviderStats = async () => {
  try {
    const providers = await getAllProviders();
    
    const stats = {
      totalProviders: providers.length,
      activeProviders: providers.filter(provider => provider.active !== false).length,
      areas: {},
      categorias: {},
      tags: {},
      galerias: {}
    };

    // Contar por áreas, categorías, tags y galerías
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
  } catch (error) {
    console.error('Error al obtener estadísticas de proveedores:', error);
    throw new Error('No se pudieron obtener las estadísticas: ' + error.message);
  }
};

/**
 * Buscar proveedores por término
 * Busca en nombre, tags, talles y dirección
 */
export const searchProviders = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const providers = await getAllProviders();
    const term = searchTerm.toLowerCase().trim();
    
    return providers.filter(provider => {
      // Buscar en nombre del proveedor
      if (provider.proveedor && provider.proveedor.toLowerCase().includes(term)) {
        return true;
      }

      // Buscar en tags
      if (provider.tags && Array.isArray(provider.tags)) {
        if (provider.tags.some(tag => tag.toLowerCase().includes(term))) {
          return true;
        }
      }

      // Buscar en talles
      if (provider.talles && Array.isArray(provider.talles)) {
        if (provider.talles.some(talle => talle.toLowerCase().includes(term))) {
          return true;
        }
      }

      // Buscar en direcciones de locales
      if (provider.locales && Array.isArray(provider.locales)) {
        return provider.locales.some(local => 
          (local.direccion && local.direccion.toLowerCase().includes(term)) ||
          (local.area && local.area.toLowerCase().includes(term)) ||
          (local.galeria && local.galeria.toLowerCase().includes(term))
        );
      }

      return false;
    });
  } catch (error) {
    console.error('Error al buscar proveedores:', error);
    throw new Error('Error en la búsqueda de proveedores: ' + error.message);
  }
};

/**
 * Filtrar proveedores por categoría
 */
export const getProvidersByCategory = async (categoria) => {
  try {
    const providers = await getAllProviders();
    return providers.filter(provider => provider.categoria === categoria);
  } catch (error) {
    console.error('Error al filtrar por categoría:', error);
    throw new Error('Error al filtrar proveedores por categoría: ' + error.message);
  }
};

/**
 * Filtrar proveedores por área
 */
export const getProvidersByArea = async (area) => {
  try {
    const providers = await getAllProviders();
    return providers.filter(provider => 
      provider.locales && provider.locales.some(local => local.area === area)
    );
  } catch (error) {
    console.error('Error al filtrar por área:', error);
    throw new Error('Error al filtrar proveedores por área: ' + error.message);
  }
};

/**
 * Filtrar proveedores por galería
 */
export const getProvidersByGallery = async (galeria) => {
  try {
    const providers = await getAllProviders();
    return providers.filter(provider => 
      provider.locales && provider.locales.some(local => local.galeria === galeria)
    );
  } catch (error) {
    console.error('Error al filtrar por galería:', error);
    throw new Error('Error al filtrar proveedores por galería: ' + error.message);
  }
};

/**
 * Obtener estadísticas de productos para un proveedor específico
 * CORREGIDO: Usa colección 'articulos' y 'ventas' correctas
 */
export const getProviderProductStats = async (providerId) => {
  try {
    console.log('🔍 Obteniendo estadísticas de productos para proveedor:', providerId);
    
    // Convertir providerId a número para comparación
    const providerIdNum = parseInt(providerId);
    
    // Obtener productos del proveedor desde la colección 'articulos'
    const productsQuery = query(
      collection(db, 'articulos'),
      where('proveedorId', '==', providerIdNum)
    );
    
    const productsSnapshot = await getDocs(productsQuery);
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('📦 Productos encontrados para el proveedor:', products.length);

    // Calcular estadísticas de productos
    const totalProductos = products.length;
    const productosActivos = products.filter(p => {
      const totalStock = p.variantes?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
      return totalStock > 0;
    }).length;

    // Obtener ventas relacionadas con estos productos
    let totalVendidos = 0;
    let ultimaVenta = null;
    let ingresosTotales = 0;
    
    try {
      const ventasQuery = query(collection(db, 'ventas'));
      const ventasSnapshot = await getDocs(ventasQuery);
      
      ventasSnapshot.docs.forEach(doc => {
        const venta = doc.data();
        if (venta.items && Array.isArray(venta.items)) {
          venta.items.forEach(item => {
            // Buscar si este item pertenece a un producto del proveedor
            const product = products.find(p => p.id === item.productId);
            if (product && !item.isReturn && !item.isQuickItem) {
              totalVendidos += item.quantity || 0;
              ingresosTotales += (item.price * item.quantity) || 0;
              
              // Actualizar última venta
              const ventaDate = venta.saleDate ? 
                (venta.saleDate.seconds ? new Date(venta.saleDate.seconds * 1000) : new Date(venta.saleDate)) : 
                (venta.createdAt ? new Date(venta.createdAt.seconds * 1000) : null);
              
              if (ventaDate && (!ultimaVenta || ventaDate > ultimaVenta)) {
                ultimaVenta = ventaDate;
              }
            }
          });
        }
      });
      
      console.log(`💰 Total vendidos del proveedor ${providerId}: ${totalVendidos} unidades, $${ingresosTotales.toLocaleString()}`);
    } catch (ventasError) {
      console.log('ℹ️ Error al acceder a ventas:', ventasError.message);
    }

    // Calcular última compra (fecha de creación del producto más reciente)
    const ultimaCompra = products.length > 0 ? 
      products.reduce((latest, product) => {
        const productDate = product.createdAt ? 
          (product.createdAt.seconds ? new Date(product.createdAt.seconds * 1000) : new Date(product.createdAt)) : null;
        return (!latest || (productDate && productDate > latest)) ? productDate : latest;
      }, null) : null;

    const stats = {
      totalComprados: totalProductos,
      totalVendidos: totalVendidos,
      productosActivos: productosActivos,
      ingresosTotales: ingresosTotales,
      ultimaCompra: ultimaCompra,
      ultimaVenta: ultimaVenta,
      productos: products // Incluir lista de productos para referencia
    };

    console.log('📊 Estadísticas calculadas para proveedor:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de productos del proveedor:', error);
    return {
      totalComprados: 0,
      totalVendidos: 0,
      productosActivos: 0,
      ingresosTotales: 0,
      ultimaCompra: null,
      ultimaVenta: null,
      productos: []
    };
  }
};

/**
 * Obtener todas las categorías únicas
 */
export const getUniqueCategories = async () => {
  try {
    const providers = await getAllProviders();
    const categories = new Set();
    
    providers.forEach(provider => {
      if (provider.categoria) {
        categories.add(provider.categoria);
      }
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
};

/**
 * Obtener todas las áreas únicas
 */
export const getUniqueAreas = async () => {
  try {
    const providers = await getAllProviders();
    const areas = new Set();
    
    providers.forEach(provider => {
      if (provider.locales && Array.isArray(provider.locales)) {
        provider.locales.forEach(local => {
          if (local.area) {
            areas.add(local.area);
          }
        });
      }
    });
    
    return Array.from(areas).sort();
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    return [];
  }
};

/**
 * Obtener todas las galerías únicas
 */
export const getUniqueGalleries = async () => {
  try {
    const providers = await getAllProviders();
    const galleries = new Set();
    
    providers.forEach(provider => {
      if (provider.locales && Array.isArray(provider.locales)) {
        provider.locales.forEach(local => {
          if (local.galeria) {
            galleries.add(local.galeria);
          }
        });
      }
    });
    
    return Array.from(galleries).sort();
  } catch (error) {
    console.error('Error al obtener galerías:', error);
    return [];
  }
};
