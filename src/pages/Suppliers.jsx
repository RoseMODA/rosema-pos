import React, { useState, useEffect, useCallback } from 'react';
import { useProviders } from '../hooks/useProviders';
import ProviderForm from '../components/ProviderForm';
import ProviderDetails from '../components/ProviderDetails';

/**
 * Página completa de Proveedores del sistema POS Rosema
 * Implementa todos los requisitos de la Etapa 5
 */
const Suppliers = () => {
  const {
    providers,
    loading,
    error,
    categories,
    areas,
    galleries,
    loadProviders,
    searchProvidersByTerm,
    applyFilters,
    filterByCategory,
    filterByArea,
    filterByGallery,
    getProviderStatsLocal,
    getProviderProductStatistics,
    addProvider,
    updateProviderData,
    removeProvider,
    clearSearch
  } = useProviders();

  // Estados locales para filtros combinados
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedGallery, setSelectedGallery] = useState('');
  
  // Estados de modales
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [showProviderDetails, setShowProviderDetails] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [providerProductStats, setProviderProductStats] = useState({});

  // Cargar proveedores al montar el componente
  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  // Obtener estadísticas locales
  const stats = getProviderStatsLocal();

  /**
   * Aplicar todos los filtros combinados
   */
  const applyAllFilters = useCallback(async () => {
    const filters = {};
    
    if (searchTerm.trim()) filters.searchTerm = searchTerm;
    if (selectedCategory) filters.categoria = selectedCategory;
    if (selectedArea) filters.area = selectedArea;
    if (selectedGallery) filters.galeria = selectedGallery;
    
    // Si no hay filtros, cargar todos los proveedores
    if (Object.keys(filters).length === 0) {
      await loadProviders();
      setShowResults(false);
    } else {
      await applyFilters(filters);
      setShowResults(true);
    }
  }, [searchTerm, selectedCategory, selectedArea, selectedGallery, applyFilters, loadProviders]);

  /**
   * Manejar búsqueda (sin limpiar otros filtros)
   */
  const handleSearch = async (term) => {
    console.log('🔍 Cambiando búsqueda a:', term);
    setSearchTerm(term);
    
    // Aplicar filtros inmediatamente con el nuevo valor
    const filters = {};
    if (term && term.trim()) filters.searchTerm = term;
    if (selectedCategory && selectedCategory.trim()) filters.categoria = selectedCategory;
    if (selectedArea && selectedArea.trim()) filters.area = selectedArea;
    if (selectedGallery && selectedGallery.trim()) filters.galeria = selectedGallery;
    
    await applyFilters(filters);
    setShowResults(Object.keys(filters).length > 0);
  };

  /**
   * Limpiar búsqueda y filtros
   */
  const handleClearSearch = async () => {
    console.log('🧹 Limpiando todos los filtros...');
    setSearchTerm('');
    setShowResults(false);
    setSelectedCategory('');
    setSelectedArea('');
    setSelectedGallery('');
    clearSearch();
    await loadProviders();
  };

  /**
   * Manejar filtro por categoría (sin limpiar otros filtros)
   */
  const handleCategoryFilter = async (categoria) => {
    console.log('🏷️ Cambiando categoría a:', categoria);
    setSelectedCategory(categoria);
    
    // Aplicar filtros inmediatamente con el nuevo valor
    const filters = {};
    if (searchTerm.trim()) filters.searchTerm = searchTerm;
    if (categoria && categoria.trim()) filters.categoria = categoria;
    if (selectedArea && selectedArea.trim()) filters.area = selectedArea;
    if (selectedGallery && selectedGallery.trim()) filters.galeria = selectedGallery;
    
    await applyFilters(filters);
    setShowResults(Object.keys(filters).length > 0);
  };

  /**
   * Manejar filtro por área (sin limpiar otros filtros)
   */
  const handleAreaFilter = async (area) => {
    console.log('📍 Cambiando área a:', area);
    setSelectedArea(area);
    
    // Aplicar filtros inmediatamente con el nuevo valor
    const filters = {};
    if (searchTerm.trim()) filters.searchTerm = searchTerm;
    if (selectedCategory && selectedCategory.trim()) filters.categoria = selectedCategory;
    if (area && area.trim()) filters.area = area;
    if (selectedGallery && selectedGallery.trim()) filters.galeria = selectedGallery;
    
    await applyFilters(filters);
    setShowResults(Object.keys(filters).length > 0);
  };

  /**
   * Manejar filtro por galería (sin limpiar otros filtros)
   */
  const handleGalleryFilter = async (galeria) => {
    console.log('🏢 Cambiando galería a:', galeria);
    setSelectedGallery(galeria);
    
    // Aplicar filtros inmediatamente con el nuevo valor
    const filters = {};
    if (searchTerm.trim()) filters.searchTerm = searchTerm;
    if (selectedCategory && selectedCategory.trim()) filters.categoria = selectedCategory;
    if (selectedArea && selectedArea.trim()) filters.area = selectedArea;
    if (galeria && galeria.trim()) filters.galeria = galeria;
    
    await applyFilters(filters);
    setShowResults(Object.keys(filters).length > 0);
  };

  /**
   * Abrir modal de agregar proveedor
   */
  const handleAddProvider = () => {
    setEditingProvider(null);
    setShowProviderForm(true);
  };

  /**
   * Abrir modal de editar proveedor
   */
  const handleEditProvider = (provider) => {
    setEditingProvider(provider);
    setShowProviderForm(true);
    setShowProviderDetails(false);
  };

  /**
   * Ver detalles del proveedor
   */
  const handleViewProvider = async (provider) => {
    setSelectedProvider(provider);
    
    // Obtener estadísticas de productos
    try {
      const productStats = await getProviderProductStatistics(provider.id);
      setProviderProductStats(productStats);
    } catch (error) {
      console.error('Error al obtener estadísticas de productos:', error);
      setProviderProductStats({ totalComprados: 0, totalVendidos: 0 });
    }
    
    setShowProviderDetails(true);
  };

  /**
   * Guardar proveedor (crear o actualizar)
   */
  const handleSaveProvider = async (providerData) => {
    try {
      if (editingProvider) {
        await updateProviderData(editingProvider.id, providerData);
      } else {
        await addProvider(providerData);
      }
      setShowProviderForm(false);
      setEditingProvider(null);
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      // El error ya se maneja en el hook
    }
  };

  /**
   * Eliminar proveedor
   */
  const handleDeleteProvider = async (providerId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.')) {
      try {
        await removeProvider(providerId);
        setShowProviderDetails(false);
        setSelectedProvider(null);
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        // El error ya se maneja en el hook
      }
    }
  };

  /**
   * Obtener texto de los filtros activos
   */
  const getActiveFilterText = () => {
    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Búsqueda: "${searchTerm}"`);
    if (selectedCategory) activeFilters.push(`Categoría: ${selectedCategory}`);
    if (selectedArea) activeFilters.push(`Área: ${selectedArea}`);
    if (selectedGallery) activeFilters.push(`Galería: ${selectedGallery}`);
    return activeFilters.join(' | ');
  };

  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
        <p className="text-gray-600 mt-2">Sistema completo de gestión de proveedores</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, tags, talles o dirección..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          {(searchTerm || selectedCategory || selectedArea || selectedGallery) && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Botones de acción y filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={handleAddProvider}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Proveedor
        </button>

        {/* Filtro por categoría */}
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {categories.map(categoria => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </select>

        {/* Filtro por área */}
        <select
          value={selectedArea}
          onChange={(e) => handleAreaFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Todas las áreas</option>
          {areas.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        {/* Filtro por galería */}
        <select
          value={selectedGallery}
          onChange={(e) => handleGalleryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Todas las galerías</option>
          {galleries.map(galeria => (
            <option key={galeria} value={galeria}>{galeria}</option>
          ))}
        </select>
      </div>

      {/* Estadísticas de proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.totalProviders}</div>
          <div className="text-gray-600">Total Proveedores</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeProviders}</div>
          <div className="text-gray-600">Proveedores Activos</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-blue-600 mb-2">{Object.keys(stats.areas).length}</div>
          <div className="text-gray-600">Áreas Cubiertas</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-purple-600 mb-2">{Object.keys(stats.tags).length}</div>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <div className="text-gray-600">Cargando proveedores...</div>
        </div>
      )}

      {/* Lista de proveedores */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Directorio de Proveedores
              {(showResults || selectedCategory || selectedArea || selectedGallery) && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({providers.length} resultados{getActiveFilterText() && ` - ${getActiveFilterText()}`})
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
                        {provider.proveedor || 'Sin Nombre'}
                      </h3>
                      {provider.categoria && (
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mt-1">
                          {provider.categoria}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {/* Mostrar primer local */}
                      {provider.locales && provider.locales[0] && (
                        <>
                          {provider.locales[0].area && (
                            <p>
                              <span className="font-medium">Área:</span> {provider.locales[0].area}
                            </p>
                          )}
                          {provider.locales[0].direccion && (
                            <p>
                              <span className="font-medium">Dirección:</span> {provider.locales[0].direccion}
                            </p>
                          )}
                          {provider.locales[0].galeria && (
                            <p>
                              <span className="font-medium">Galería:</span> {provider.locales[0].galeria}
                            </p>
                          )}
                        </>
                      )}
                      
                      {provider.whattsapp && (
                        <p>
                          <span className="font-medium">WhatsApp:</span> {provider.whattsapp}
                        </p>
                      )}
                      
                      {provider.web && (
                        <p>
                          <span className="font-medium">Web:</span> 
                          <a href={provider.web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                            Ver sitio
                          </a>
                        </p>
                      )}

                      {/* Calidad y precios */}
                      <div className="flex gap-2 mt-2">
                        {provider.calidad && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            provider.calidad === 'excelente' ? 'bg-green-100 text-green-800' :
                            provider.calidad === 'buena' ? 'bg-blue-100 text-blue-800' :
                            provider.calidad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                            provider.calidad === 'mala' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {provider.calidad}
                          </span>
                        )}
                        {provider.precios && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            provider.precios === 'baratos' ? 'bg-green-100 text-green-800' :
                            provider.precios === 'buenos' ? 'bg-blue-100 text-blue-800' :
                            provider.precios === 'medios' || provider.precios === 'razonable' ? 'bg-yellow-100 text-yellow-800' :
                            provider.precios === 'caro' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {provider.precios}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
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

                    {/* Botones de acción */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => handleViewProvider(provider)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Ver detalles
                        </button>
                        <button 
                          onClick={() => handleEditProvider(provider)}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                        >
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
                  {showResults || selectedCategory || selectedArea || selectedGallery 
                    ? 'No se encontraron proveedores' 
                    : 'No hay proveedores disponibles'}
                </p>
                <p className="text-sm text-gray-500">
                  {showResults || selectedCategory || selectedArea || selectedGallery
                    ? 'Intenta con otros términos de búsqueda o filtros' 
                    : 'Agrega tu primer proveedor para comenzar'}
                </p>
                {!showResults && !selectedCategory && !selectedArea && !selectedGallery && (
                  <button
                    onClick={handleAddProvider}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Agregar Primer Proveedor
                  </button>
                )}
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
                  className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
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
                  onClick={() => handleAreaFilter(area)}
                >
                  <div className="font-medium text-gray-900">{area}</div>
                  <div className="text-sm text-gray-600">{count} proveedores</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modales */}
      <ProviderForm
        provider={editingProvider}
        isOpen={showProviderForm}
        onClose={() => {
          setShowProviderForm(false);
          setEditingProvider(null);
        }}
        onSave={handleSaveProvider}
        loading={loading}
      />

      <ProviderDetails
        provider={selectedProvider}
        isOpen={showProviderDetails}
        onClose={() => {
          setShowProviderDetails(false);
          setSelectedProvider(null);
          setProviderProductStats({});
        }}
        onEdit={handleEditProvider}
        onDelete={handleDeleteProvider}
        productStats={providerProductStats}
      />
    </div>
  );
};

export default Suppliers;
