import React, { useState, useEffect } from 'react';

/**
 * Modal para mostrar detalles completos del cliente
 * Incluye estadísticas de compras, historial y preferencias
 */
const CustomerDetails = ({ 
  customer, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  onLoadHistory,
  onLoadAnalysis
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [customerAnalysis, setCustomerAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && customer) {
      loadCustomerData();
    }
  }, [isOpen, customer]);

  const loadCustomerData = async () => {
    if (!customer) return;
    
    setLoading(true);
    try {
      // Cargar historial de compras
      if (onLoadHistory) {
        const history = await onLoadHistory(customer.id);
        setPurchaseHistory(history);
      }

      // Cargar análisis de preferencias
      if (onLoadAnalysis) {
        const analysis = await onLoadAnalysis(customer.id);
        setCustomerAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error cargando datos del cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = birthDate.seconds ? new Date(birthDate.seconds * 1000) : new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!isOpen || !customer) return null;

  const age = calculateAge(customer.fechaNacimiento);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {customer.nombre}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {customer.telefono && (
                <span>📞 {customer.telefono}</span>
              )}
              {customer.email && (
                <span>✉️ {customer.email}</span>
              )}
              {age && (
                <span>🎂 {age} años</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{customer.totalCompras || 0}</div>
              <div className="text-sm text-gray-600">Compras Realizadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(customer.montoTotalGastado)}
              </div>
              <div className="text-sm text-gray-600">Total Gastado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {customer.totalCompras > 0 ? 
                  formatCurrency((customer.montoTotalGastado || 0) / customer.totalCompras) : 
                  formatCurrency(0)
                }
              </div>
              <div className="text-sm text-gray-600">Promedio por Compra</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {customer.ultimaCompra ? formatDate(customer.ultimaCompra) : 'Nunca'}
              </div>
              <div className="text-sm text-gray-600">Última Compra</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Información Personal
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Historial de Compras
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Preferencias
            </button>
          </nav>
        </div>

        {/* Contenido de tabs */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
              <div className="text-gray-600">Cargando datos...</div>
            </div>
          )}

          {/* Tab: Información Personal */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de contacto */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Contacto</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-gray-900">{customer.telefono || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{customer.email || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dirección</label>
                      <p className="text-gray-900">{customer.direccion || 'No especificada'}</p>
                    </div>
                  </div>
                </div>

                {/* Información personal */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Personal</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                      <p className="text-gray-900">
                        {customer.fechaNacimiento ? formatDate(customer.fechaNacimiento) : 'No especificada'}
                        {age && <span className="text-gray-500 ml-2">({age} años)</span>}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cliente desde</label>
                      <p className="text-gray-900">{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {customer.tags && customer.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {customer.notas && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{customer.notas}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Historial de Compras */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Historial de Compras</h3>
              
              {purchaseHistory.length > 0 ? (
                <div className="space-y-4">
                  {purchaseHistory.map((purchase) => (
                    <div key={purchase.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Venta #{purchase.saleNumber || purchase.id}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(purchase.saleDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(purchase.total)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {purchase.paymentMethod}
                          </div>
                        </div>
                      </div>
                      
                      {/* Items de la compra */}
                      {purchase.items && purchase.items.length > 0 && (
                        <div className="border-t border-gray-100 pt-3">
                          <div className="space-y-2">
                            {purchase.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-900">
                                  {item.name || item.productName} 
                                  {item.talle && <span className="text-gray-500"> - {item.talle}</span>}
                                  {item.color && <span className="text-gray-500"> - {item.color}</span>}
                                </span>
                                <span className="text-gray-600">
                                  {item.quantity}x {formatCurrency(item.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p>No hay compras registradas</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Preferencias */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Análisis de Preferencias</h3>
              
              {customerAnalysis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Talles preferidos */}
                  {customerAnalysis.preferences.topSizes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Talles Más Comprados</h4>
                      <div className="space-y-2">
                        {customerAnalysis.preferences.topSizes.map((sizeData, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-900">{sizeData.size}</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {sizeData.count} veces
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estadísticas de compra */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Estadísticas de Compra</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor promedio por compra:</span>
                        <span className="font-medium">
                          {formatCurrency(customerAnalysis.preferences.averageOrderValue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frecuencia de compra:</span>
                        <span className="font-medium">
                          {customerAnalysis.preferences.purchaseFrequency} compras
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Última compra:</span>
                        <span className="font-medium">
                          {customerAnalysis.preferences.lastPurchase ? 
                            formatDate(customerAnalysis.preferences.lastPurchase) : 
                            'Nunca'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No hay suficientes datos para mostrar preferencias</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            onClick={() => onEdit(customer)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(customer.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
