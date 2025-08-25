import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Configuración de Firebase (usar las mismas credenciales del proyecto)
const firebaseConfig = {
  // Aquí deberían ir las credenciales reales de Firebase
  // Por seguridad, estas deberían estar en variables de entorno
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Script para importar proveedores desde el archivo JSON a Firestore
 */
async function importProviders() {
  try {
    console.log('🚀 Iniciando importación de proveedores...');

    // Leer el archivo JSON
    const jsonPath = path.join(process.cwd(), 'data', 'proveedores.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const providers = JSON.parse(jsonData);

    console.log(`📊 Encontrados ${providers.length} proveedores en el archivo JSON`);

    // Verificar si ya existen proveedores en Firestore
    const existingProviders = await getDocs(collection(db, 'proveedores'));
    console.log(`📋 Proveedores existentes en Firestore: ${existingProviders.size}`);

    if (existingProviders.size > 0) {
      console.log('⚠️  Ya existen proveedores en Firestore. ¿Deseas continuar? (Esto agregará más proveedores)');
      // En un entorno real, aquí podrías pedir confirmación del usuario
    }

    let importedCount = 0;
    let errorCount = 0;

    // Importar cada proveedor
    for (const provider of providers) {
      try {
        // Transformar los datos al formato esperado por el sistema
        const providerData = {
          proveedor: provider.proveedor || 'Sin nombre',
          cuit: provider.cuit || null,
          whattsapp: provider.whattsapp || null,
          whattsapp2: provider.whattsapp2 || null,
          catalogo: provider.catalogo || null,
          web: provider.web || null,
          categoria: provider.categoria || null,
          locales: provider.locales || [{ 
            direccion: '', 
            area: '', 
            galeria: '', 
            pasillo: '', 
            local: '' 
          }],
          tags: provider.tags || [],
          instagram: provider.instagram || null,
          tiktok: provider.tiktok || null,
          calidad: provider.calidad || null,
          precios: provider.precios || null,
          notas: provider.notas || null,
          talles: provider.talles || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          // Mantener el ID original como referencia
          originalId: provider.id
        };

        // Agregar a Firestore
        const docRef = await addDoc(collection(db, 'proveedores'), providerData);
        console.log(`✅ Proveedor "${providerData.proveedor}" importado con ID: ${docRef.id}`);
        importedCount++;

      } catch (error) {
        console.error(`❌ Error al importar proveedor "${provider.proveedor}":`, error);
        errorCount++;
      }
    }

    console.log('\n📈 Resumen de importación:');
    console.log(`✅ Proveedores importados exitosamente: ${importedCount}`);
    console.log(`❌ Errores durante la importación: ${errorCount}`);
    console.log(`📊 Total procesados: ${providers.length}`);

    if (importedCount > 0) {
      console.log('\n🎉 ¡Importación completada! Los proveedores están ahora disponibles en el sistema POS.');
    }

  } catch (error) {
    console.error('💥 Error fatal durante la importación:', error);
    process.exit(1);
  }
}

/**
 * Función para limpiar la colección de proveedores (usar con cuidado)
 */
async function clearProviders() {
  try {
    console.log('🗑️  Limpiando colección de proveedores...');
    
    const querySnapshot = await getDocs(collection(db, 'proveedores'));
    const deletePromises = [];
    
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    console.log(`✅ Se eliminaron ${querySnapshot.size} proveedores`);
    
  } catch (error) {
    console.error('❌ Error al limpiar proveedores:', error);
  }
}

// Ejecutar el script
const command = process.argv[2];

if (command === 'import') {
  importProviders();
} else if (command === 'clear') {
  clearProviders();
} else {
  console.log('📋 Uso del script:');
  console.log('  npm run import-providers import  - Importar proveedores desde JSON');
  console.log('  npm run import-providers clear   - Limpiar todos los proveedores (¡CUIDADO!)');
}
