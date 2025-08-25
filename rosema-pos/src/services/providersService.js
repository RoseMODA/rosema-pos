import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Servicio para gestión de proveedores en Firestore
 * Maneja CRUD de proveedores con información completa
 */

const COLLECTION_NAME = 'proveedores';

/**
 * Obtener todos los proveedores
 */
export const getAllProviders = async () => {
  try {
    console.log('🔍 Intentando obtener proveedores de la colección:', COLLECTION_NAME);
    
    // Primero intentamos sin ordenar para evitar errores de índice
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    console.log('📊 Proveedores encontrados:', querySnapshot.size);
    
    const providers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 Proveedor encontrado:', doc.id, data);
      
      return {
        id: doc.id,
        ...data,
        // Mapear campos comunes que podrían tener nombres diferentes
        name: data.name || data.nombre || data.razonSocial || 'Sin nombre',
        address: data.address || data.direccion || data.domicilio || '',
        contact: data.contact || data.contacto || data.telefono || data.whatsapp || '',
        area: data.area || data.zona || data.barrio || '',
        tags: data.tags || data.etiquetas || []
      };
    });
    
    console.log('✅ Proveedores procesados:', providers.length);
    return providers;
  } catch (error) {
    console.error('❌ Error al obtener proveedores:', error);
    console.error('Error details:', error.message);
    
    // Intentar obtener al menos un documento para ver la estructura
    try {
      const simpleQuery = await getDocs(collection(db, COLLECTION_NAME));
      if (simpleQuery.size > 0) {
        const firstDoc = simpleQuery.docs[0];
        console.log('🔍 Estructura del primer proveedor:', firstDoc.data());
      }
    } catch (debugError) {
      console.error('❌ Error en debug query:', debugError);
    }
    
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
      return { id: docSnap.id, ...docSnap.data() };
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
    const newProvider = {
      ...providerData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newProvider);
    return { id: docRef.id, ...newProvider };
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    throw new Error('No se pudo crear el proveedor');
  }
};

/**
 * Actualizar proveedor
 */
export const updateProvider = async (providerId, updates) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, providerId);
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
    throw new Error('No se pudo actualizar el proveedor');
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
    throw new Error('No se pudo eliminar el proveedor');
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
      tags: {}
    };

    // Contar por áreas
    providers.forEach(provider => {
      if (provider.area) {
        stats.areas[provider.area] = (stats.areas[provider.area] || 0) + 1;
      }
    });

    // Contar por tags
    providers.forEach(provider => {
      if (provider.tags && Array.isArray(provider.tags)) {
        provider.tags.forEach(tag => {
          stats.tags[tag] = (stats.tags[tag] || 0) + 1;
        });
      }
    });

    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas de proveedores:', error);
    throw new Error('No se pudieron obtener las estadísticas');
  }
};

/**
 * Buscar proveedores por término
 */
export const searchProviders = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const providers = await getAllProviders();
    const term = searchTerm.toLowerCase().trim();
    
    return providers.filter(provider => 
      (provider.name && provider.name.toLowerCase().includes(term)) ||
      (provider.area && provider.area.toLowerCase().includes(term)) ||
      (provider.tags && provider.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  } catch (error) {
    console.error('Error al buscar proveedores:', error);
    throw new Error('Error en la búsqueda de proveedores');
  }
};
