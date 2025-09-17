import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Componente temporal para debuggear el problema de proveedores
 */
const ProvidersDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    totalDocs: 0,
    withDate: 0,
    withoutDate: 0,
    sampleProviders: [],
    error: null,
    loading: true
  });

  useEffect(() => {
    const debugProviders = async () => {
      try {
        console.log('🔍 DEBUG: Iniciando análisis de proveedores...');
        
        // Consulta directa a Firestore sin filtros
        const providersRef = collection(db, 'proveedores');
        const snapshot = await getDocs(providersRef);
        
        console.log('📊 DEBUG: Total documentos encontrados:', snapshot.size);
        
        const allProviders = [];
        let withDate = 0;
        let withoutDate = 0;
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const provider = {
            id: doc.id,
            ...data
          };
          
          allProviders.push(provider);
          
          if (data.createdAt) {
            withDate++;
          } else {
            withoutDate++;
          }
        });
        
        console.log('📈 DEBUG: Proveedores con fecha:', withDate);
        console.log('📉 DEBUG: Proveedores sin fecha:', withoutDate);
        console.log('📋 DEBUG: Primeros 5 proveedores:', allProviders.slice(0, 5));
        
        setDebugInfo({
          totalDocs: snapshot.size,
          withDate,
          withoutDate,
          sampleProviders: allProviders.slice(0, 10),
          error: null,
          loading: false
        });
        
      } catch (error) {
        console.error('❌ DEBUG: Error al consultar proveedores:', error);
        setDebugInfo(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      }
    };

    debugProviders();
  }, []);

  if (debugInfo.loading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">🔍 Analizando base de datos de proveedores...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">🔧 Debug de Proveedores</h3>
      
      {debugInfo.error ? (
        <div className="text-red-600">
          <p><strong>Error:</strong> {debugInfo.error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <div className="text-2xl font-bold text-blue-600">{debugInfo.totalDocs}</div>
              <div className="text-gray-600">Total en BD</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-2xl font-bold text-green-600">{debugInfo.withDate}</div>
              <div className="text-gray-600">Con fecha</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-2xl font-bold text-orange-600">{debugInfo.withoutDate}</div>
              <div className="text-gray-600">Sin fecha</div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-900 mb-2">Muestra de proveedores (primeros 10):</h4>
            <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
              {debugInfo.sampleProviders.map((provider, index) => (
                <div key={provider.id} className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="font-medium">{index + 1}. {provider.proveedor || 'Sin nombre'}</span>
                  <span className="text-gray-500">
                    {provider.createdAt ? '✅ Con fecha' : '❌ Sin fecha'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            <p><strong>Nota:</strong> Este componente es temporal para diagnosticar el problema.</p>
            <p>Si ves menos de 200 proveedores, puede ser un problema de permisos o consulta.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvidersDebug;
