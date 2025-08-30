import React, { useState, useEffect } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import CustomerForm from '../components/CustomerForm';
import CustomerDetails from '../components/CustomerDetails';

/**
 * Página completa de Clientes del sistema POS Rosema
 * Implementa sistema CRM básico con estadísticas y análisis
 */
const Customers = () => {
  const {
    customers,
    loading,
    error,
    loadCustomers,
    searchCustomersByTerm,
    getCustomer,
    addCustomer,
    updateCustomerData,
    removeCustomer,
    clearSearch,
    getCustomerHistory,
    getCustomerAnalysis,
    getCustomerStatsLocal,
    getTopCustomersData
  } = useCustomers();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, name, purchases, spending
  
  // Estados de modales
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Estados de estadísticas
  const [topCustomers, setTopCustomers] = useState([]);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadCustomers();
    loadTopCustomers();
  }, [loadCustomers]);

  // Cargar top clientes
  const loadTopCustomers = async () => {
    try {
      const top = await getTopCustomersData(5);
      setTopCustomers(top);
    } catch (error) {
      console.error('Error cargando top clientes:', error);
    }
  };

  // Obtener estadísticas locales
  const stats = getCustomerStatsLocal();

  /**
   * Manejar búsqueda
   */
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchCustomersByTerm(term);
      setShowResults(true);
    } else {
      await loadCustomers();
      setShowResults(false);
    }
  };

  /**
   * Limpiar búsqueda
   */
  const handleClearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
    clearSearch();
    loadCustomers();
  };

  /**
   * Ordenar clientes
   */
  const getSortedCustomers = () => {
    const customersCopy = [...customers];
    
    switch (sortBy) {
      case 'name':
        return customersCopy.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'purchases':
        return customersCopy.sort((a, b) => (b.totalCompras || 0) - (a.totalCompras || 0));
      case 'spending':
        return customersCopy.sort((a, b) => (b.montoTotalGastado || 0) - (a.montoTotalGastado || 0));
      case 'recent':
      default:
        return customersCopy.sort((a, b) => {
          const dateA = a.ultimaCompra ? 
            (a.ultimaCompra.seconds ? new Date(a.ultimaCompra.seconds * 1000) : new Date(a.ultimaCompra)) : 
            new Date(0);
          const dateB = b.ultimaCompra ? 
            (b.ultimaCompra.seconds ? new Date(b.ultimaCompra.seconds * 1000) : new Date(b.ultimaCompra)) : 
            new Date(0);
          return dateB - dateA;
        });
    }
  };

  /**
   * Abrir modal de agregar cliente
   */
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowCustomerForm(true);
  };

  /**
   * Abrir modal de editar cliente
   */
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
    setShowCustomerDetails(false);
  };

  /**
   * Ver detalles del cliente
   */
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  /**
   * Guardar cliente (crear o actualizar)
   */
  const handleSaveCustomer = async (customerData) => {
    try {
      if (editingCustomer) {
        await updateCustomerData(editingCustomer.id, customerData);
      } else {
        await addCustomer(customerData);
      }
      setShowCustomerForm(false);
      setEditingCustomer(null);
      // Recargar top clientes
      loadTopCustomers();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      // El error ya se maneja en el hook
    }
  };

  /**
   * Eliminar cliente
   */
  const handleDeleteCustomer = async (customerId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        await removeCustomer(customerId);
        setShowCustomerDetails(false);
        setSelectedCustomer(null);
        // Recargar top clientes
        loadTopCustomers();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        // El error ya se maneja en el hook
      }
    }
  };

  /**
   * Formatear moneda
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  };

  /**
   * Formatear fecha
   */
  const formatDate = (date) => {
    if (!date) return 'Nunca';
    const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dateObj.toLocaleDateString('es-ES');
  };

  const sortedCustomers = getSortedCustomers();

  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
        <p className="text-gray-600 mt-2">Sistema CRM para gestión de clientes y análisis de preferencias</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, email o tags..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

      {/* Botones de acción y filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={handleAddCustomer}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Cliente
        </button>

        {/* Selector de ordenamiento */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="recent">Última compra</option>
          <option value="name">Nombre A-Z</option>
          <option value="purchases">Más compras</option>
          <option value="spending">Mayor gasto</option>
        </select>
      </div>

      {/* Estadísticas de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.totalCustomers}</div>
          <div className="text-gray-600">Total Clientes</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeCustomers}</div>
          <div className="text-gray-600">Clientes Activos</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.newCustomers}</div>
          <div className="text-gray-600">Nuevos este Mes</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatCurrency(stats.averageSpending)}
          </div>
          <div className="text-gray-600">Gasto Promedio</div>
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
          <div className="text-gray-600">Cargando clientes...</div>
        </div>
      )}

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista de clientes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Lista de Clientes
                {showResults && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({sortedCustomers.length} resultados)
                  </span>
                )}
              </h2>
            </div>
            
            <div className="p-6">
              {sortedCustomers.length > 0 ? (
                <div className="space-y-4">
                  {sortedCustomers.map(customer => (
                    <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {customer.nombre}
                          </h3>
                          
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            {customer.telefono && (
                              <p>📞 {customer.telefono}</p>
                            )}
                            {customer.email && (
                              <p>✉️ {customer.email}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {customer.totalCompras || 0} compras
                              </span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {formatCurrency(customer.montoTotalGastado)}
                              </span>
                              <span className="text-gray-500 text-xs">
                                Última: {formatDate(customer.ultimaCompra)}
                              </span>
                            </div>
                          </div>

                          {/* Tags */}
                          {customer.tags && customer.tags.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-1">
                                {customer.tags.slice(0, 3).map((tag, index) => (
                                  <span 
                                    key={index}
                                    className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {customer.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{customer.tags.length - 3} más
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Botones de acción */}
                        <div className="ml-4 flex flex-col gap-2">
                          <button 
                            onClick={() => handleViewCustomer(customer)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Ver detalles
                          </button>
                          <button 
                            onClick={() => handleEditCustomer(customer)}
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
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-gray-600 mb-2">
                    {showResults 
                      ? 'No se encontraron clientes' 
                      : 'No hay clientes registrados'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {showResults
                      ? 'Intenta con otros términos de búsqueda' 
                      : 'Agrega tu primer cliente para comenzar'}
                  </p>
                  {!showResults && (
                    <button
                      onClick={handleAddCustomer}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Agregar Primer Cliente
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral - Top clientes */}
        <div className="space-y-6">
          {/* Top clientes más frecuentes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top Clientes
            </h2>
            
            {topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {customer.totalCompras} compras
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {formatCurrency(customer.montoTotalGastado)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay datos suficientes
              </p>
            )}
          </div>

          {/* Resumen de ingresos */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resumen de Ingresos
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total facturado:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Promedio por cliente:</span>
                <span className="font-medium">
                  {formatCurrency(stats.averageSpending)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clientes activos:</span>
                <span className="font-medium">
                  {stats.activeCustomers} de {stats.totalCustomers}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <CustomerForm
        customer={editingCustomer}
        isOpen={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        loading={loading}
      />

      <CustomerDetails
        customer={selectedCustomer}
        isOpen={showCustomerDetails}
        onClose={() => {
          setShowCustomerDetails(false);
          setSelectedCustomer(null);
        }}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onLoadHistory={getCustomerHistory}
        onLoadAnalysis={getCustomerAnalysis}
      />
    </div>
  );
};

export default Customers;
