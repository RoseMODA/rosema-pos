import React, { useState, useEffect } from 'react';
import { useProviders } from '../hooks/useProviders';

/**
 * Página de Proveedores del sistema POS Rosema
 * Sistema completo de gestión de proveedores conectado a Firestore
 */
const Suppliers = () => {
  const {
    providers,
    loading,
    error,
    loadProviders,
    searchProvidersByTerm,
    getProviderStatsLocal,
    clearSearch
  } = useProviders();

  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  // Obtener estadísticas locales
  const stats = getProviderStatsLocal();

  // Manejar búsqueda
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchProvidersByTerm(term);
      setShowResults(true);
    } else {
      await loadProviders();
      setShowResults(false);
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
    clearSearch();
    loadProviders();
  };

  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
        <p className="text-gray-600 mt-2">Gestión completa de proveedores</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar proveedores por nombre, área o tags..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Agregar Proveedor
        </button>
        <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">
          Buscar por Área
        </button>
        <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">
          Filtrar por Tags
        </button>
      </div>

      {/* Estadísticas de proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalProviders}</div>
          <div className="text-gray-600">Total Proveedores</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeProviders}</div>
          <div className="text-gray-600">Proveedores Activos</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-purple-600 mb-2">{Object.keys(stats.areas).length}</div>
          <div className="text-gray-600">Áreas Cubiertas</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-orange-600 mb-2">{Object.keys(stats.tags).length}</div>
          <div className="text-gray-600">Tags Únicos</div>
        </div>
      </div>

      {/* Estado de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-600">Cargando proveedores...</div>
        </div>
      )}

      {/* Lista de proveedores */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Directorio de Proveedores
              {showResults && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({providers.length} resultados)
                </span>
              )}
            </h2>
          </div>
          
          <div className="p-6">
            {providers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map(provider => (
                  <div key={provider.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {provider.name || provider.nombre || 'Sin Nombre'}
                      </h3>
                      {provider.area && (
                        <p className="text-sm text-blue-600 font-medium">
                          {provider.area}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {provider.address && (
                        <p>
                          <span className="font-medium">Dirección:</span> {provider.address}
                        </p>
                      )}
                      {provider.direccion && (
                        <p>
                          <span className="font-medium">Dirección:</span> {provider.direccion}
                        </p>
                      )}
                      {provider.whatsapp && (
                        <p>
                          <span className="font-medium">WhatsApp:</span> {provider.whatsapp}
                        </p>
                      )}
                      {provider.contacto && (
                        <p>
                          <span className="font-medium">Contacto:</span> {provider.contacto}
                        </p>
                      )}
                      {provider.website && (
                        <p>
                          <span className="font-medium">Web:</span> 
                          <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                            {provider.website}
                          </a>
                        </p>
                      )}
                    </div>

                    {provider.tags && provider.tags.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {provider.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {provider.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{provider.tags.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Ver detalles
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 text-sm">
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏪</div>
                <p className="text-gray-600 mb-2">
                  {showResults ? 'No se encontraron proveedores' : 'No hay proveedores disponibles'}
                </p>
                <p className="text-sm text-gray-500">
                  {showResults ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primer proveedor para comenzar'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags más comunes */}
      {Object.keys(stats.tags).length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tags Más Utilizados
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.tags)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 15)
              .map(([tag, count]) => (
                <span 
                  key={tag}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSearch(tag)}
                >
                  {tag} ({count})
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Áreas más comunes */}
      {Object.keys(stats.areas).length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Áreas con Más Proveedores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.areas)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([area, count]) => (
                <div 
                  key={area}
                  className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSearch(area)}
                >
                  <div className="font-medium text-gray-900">{area}</div>
                  <div className="text-sm text-gray-600">{count} proveedores</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
