import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useProviders } from '../hooks/useProviders';

/**
 * Componente de diagnóstico para verificar la conexión con Firestore
 * Este componente es temporal y se puede eliminar una vez que todo funcione
 */
const FirestoreDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    products: { loading: false, data: [], error: null },
    providers: { loading: false, data: [], error: null }
  });

  const { loadProducts } = useProducts();
  const { loadProviders } = useProviders();

  const testProductsConnection = async () => {
    setDebugInfo(prev => ({
      ...prev,
      products: { ...prev.products, loading: true, error: null }
    }));

    try {
      console.log('🧪 Iniciando test de productos...');
      const products = await loadProducts();
      console.log('🧪 Productos obtenidos:', products);
      
      setDebugInfo(prev => ({
        ...prev,
        products: { loading: false, data: products || [], error: null }
      }));
    } catch (error) {
      console.error('🧪 Error en test de productos:', error);
      setDebugInfo(prev => ({
        ...prev,
        products: { loading: false, data: [], error: error.message }
      }));
    }
  };

  const testProvidersConnection = async () => {
    setDebugInfo(prev => ({
      ...prev,
      providers: { ...prev.providers, loading: true, error: null }
    }));

    try {
      console.log('🧪 Iniciando test de proveedores...');
      const providers = await loadProviders();
      console.log('🧪 Proveedores obtenidos:', providers);
      
      setDebugInfo(prev => ({
        ...prev,
        providers: { loading: false, data: providers || [], error: null }
      }));
    } catch (error) {
      console.error('🧪 Error en test de proveedores:', error);
      setDebugInfo(prev => ({
        ...prev,
        providers: { loading: false, data: [], error: error.message }
      }));
    }
  };

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h2 className="text-xl font-bold text-yellow-800 mb-4">
        🔧 Diagnóstico de Firestore
      </h2>
      <p className="text-sm text-yellow-700 mb-4">
        Este panel te ayuda a diagnosticar la conexión con Firestore. 
        Revisa la consola del navegador (F12) para ver los logs detallados.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test de Productos */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold text-gray-800 mb-3">
            📦 Test de Productos (articulos)
          </h3>
          
          <button
            onClick={testProductsConnection}
            disabled={debugInfo.products.loading}
            className="mb-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {debugInfo.products.loading ? 'Cargando...' : 'Probar Conexión'}
          </button>

          {debugInfo.products.error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm">
                <strong>Error:</strong> {debugInfo.products.error}
              </p>
            </div>
          )}

          {debugInfo.products.data.length > 0 && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-600 text-sm mb-2">
                <strong>✅ Éxito:</strong> {debugInfo.products.data.length} productos encontrados
              </p>
              <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                <strong>Primer producto:</strong>
                <pre>{JSON.stringify(debugInfo.products.data[0], null, 2)}</pre>
              </div>
            </div>
          )}

          {!debugInfo.products.loading && debugInfo.products.data.length === 0 && !debugInfo.products.error && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-gray-600 text-sm">
                No se han cargado productos aún. Haz clic en "Probar Conexión".
              </p>
            </div>
          )}
        </div>

        {/* Test de Proveedores */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold text-gray-800 mb-3">
            🏪 Test de Proveedores (proveedores)
          </h3>
          
          <button
            onClick={testProvidersConnection}
            disabled={debugInfo.providers.loading}
            className="mb-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {debugInfo.providers.loading ? 'Cargando...' : 'Probar Conexión'}
          </button>

          {debugInfo.providers.error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm">
                <strong>Error:</strong> {debugInfo.providers.error}
              </p>
            </div>
          )}

          {debugInfo.providers.data.length > 0 && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-600 text-sm mb-2">
                <strong>✅ Éxito:</strong> {debugInfo.providers.data.length} proveedores encontrados
              </p>
              <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                <strong>Primer proveedor:</strong>
                <pre>{JSON.stringify(debugInfo.providers.data[0], null, 2)}</pre>
              </div>
            </div>
          )}

          {!debugInfo.providers.loading && debugInfo.providers.data.length === 0 && !debugInfo.providers.error && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-gray-600 text-sm">
                No se han cargado proveedores aún. Haz clic en "Probar Conexión".
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-700 text-sm">
          <strong>💡 Instrucciones:</strong>
        </p>
        <ul className="text-blue-600 text-sm mt-1 ml-4 list-disc">
          <li>Haz clic en los botones para probar cada conexión</li>
          <li>Abre la consola del navegador (F12) para ver logs detallados</li>
          <li>Si hay errores, revisa los permisos de Firestore</li>
          <li>Si no hay datos, verifica que las colecciones existan y tengan documentos</li>
        </ul>
      </div>
    </div>
  );
};

export default FirestoreDebug;
