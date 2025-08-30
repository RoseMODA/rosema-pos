import React, { useState } from 'react';
import SalesInterface from '../components/SalesInterface';
import SalesHistory from '../components/SalesHistory';

/**
 * Nueva página de ventas con sistema mejorado
 * Conectada a productos con variantes y actualización automática de stock
 */
const SalesNew = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [lastSale, setLastSale] = useState(null);

  /**
   * Manejar venta completada
   */
  const handleSaleComplete = (saleData) => {
    setLastSale(saleData);
    // Opcional: cambiar a historial para ver la venta
    // setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Ventas</h1>
              <p className="text-sm text-gray-600">Gestión completa de ventas con productos y variantes</p>
            </div>
            
            {/* Navegación por tabs */}
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'sales'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nueva Venta
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Historial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'sales' ? (
          <SalesInterface onSaleComplete={handleSaleComplete} />
        ) : (
          <SalesHistory />
        )}
      </div>

      {/* Notificación de venta completada */}
      {lastSale && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium">¡Venta procesada!</p>
              <p className="text-sm opacity-90">
                Total: ${lastSale.total?.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setLastSale(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesNew;
