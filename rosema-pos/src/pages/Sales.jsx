import React, { useState } from 'react';
import { useSales } from '../hooks/useSales';
import ProductSearch from '../components/ProductSearch';
import SalesCart from '../components/SalesCart';
import QuickProduct from '../components/QuickProduct';
import PendingSales from '../components/PendingSales';
import SalesHistory from '../components/SalesHistory';
import Receipt from '../components/Receipt';

/**
 * Página principal del Sistema de Ventas - Etapa 3
 * Integra todos los componentes del sistema de ventas completo
 */
const Sales = () => {
  const {
    // Estado del carrito
    cart,
    discount,
    paymentMethod,
    
    // Estado de ventas
    sales,
    pendingSales,
    currentPendingSale,
    salesStats,
    
    // Estado de carga
    loading,
    error,
    
    // Acciones del carrito
    addToCart,
    addQuickItemToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    setDiscount,
    setPaymentMethod,
    
    // Cálculos
    getSubtotal,
    getDiscountAmount,
    getTotal,
    
    // Acciones de ventas
    completeSale,
    createPendingSaleFromCart,
    loadPendingSaleToCart,
    finalizePendingSale,
    cancelPendingSaleById,
    processReturnById,
    
    // Carga de datos
    loadSales,
    loadPendingSales,
    loadSalesStats
  } = useSales();

  // Estado local para UI
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'pending', 'history'
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  /**
   * Manejar completar venta
   */
  const handleCompleteSale = async () => {
    try {
      const saleId = await completeSale();
      
      // Mostrar recibo
      const completedSale = {
        id: saleId,
        items: cart,
        subtotal: getSubtotal(),
        discount: {
          type: discount.type,
          value: discount.value,
          amount: getDiscountAmount()
        },
        total: getTotal(),
        paymentMethod,
        createdAt: new Date(),
        saleNumber: `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-3)}`
      };
      
      setLastSale(completedSale);
      setShowReceipt(true);
      
    } catch (error) {
      alert(`Error al completar la venta: ${error.message}`);
    }
  };

  /**
   * Manejar creación de venta en espera
   */
  const handleCreatePendingSale = async (customerLabel) => {
    try {
      await createPendingSaleFromCart(customerLabel);
      alert('Venta guardada en espera exitosamente');
    } catch (error) {
      alert(`Error al crear venta en espera: ${error.message}`);
    }
  };

  /**
   * Manejar carga de venta en espera
   */
  const handleLoadPendingSale = async (pendingSaleId) => {
    try {
      await loadPendingSaleToCart(pendingSaleId);
      setActiveTab('sales'); // Cambiar a la pestaña de ventas
    } catch (error) {
      alert(`Error al cargar venta en espera: ${error.message}`);
    }
  };

  /**
   * Manejar finalización de venta en espera
   */
  const handleFinalizePendingSale = async (pendingSaleId) => {
    try {
      await finalizePendingSale(pendingSaleId);
      alert('Venta finalizada exitosamente');
    } catch (error) {
      alert(`Error al finalizar venta: ${error.message}`);
    }
  };

  /**
   * Manejar cancelación de venta en espera
   */
  const handleCancelPendingSale = async (pendingSaleId) => {
    try {
      await cancelPendingSaleById(pendingSaleId);
      alert('Venta cancelada exitosamente');
    } catch (error) {
      alert(`Error al cancelar venta: ${error.message}`);
    }
  };

  /**
   * Manejar procesamiento de devolución
   */
  const handleProcessReturn = async (saleId, returnItems) => {
    try {
      await processReturnById(saleId, returnItems);
      alert('Devolución procesada exitosamente');
    } catch (error) {
      alert(`Error al procesar devolución: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Ventas</h1>
            <p className="text-gray-600 mt-1">
              Gestión completa de ventas, carrito y pagos
            </p>
          </div>
          <div className="text-right">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Etapa 3 - Activo
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600">Ventas Hoy</p>
            <p className="text-lg font-semibold text-blue-700">{salesStats.dailyCount}</p>
            <p className="text-xs text-blue-600">${salesStats.dailyTotal.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-600">Ventas Mes</p>
            <p className="text-lg font-semibold text-green-700">{salesStats.monthlyCount}</p>
            <p className="text-xs text-green-600">${salesStats.monthlyTotal.toLocaleString()}</p>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-600">En Espera</p>
            <p className="text-lg font-semibold text-yellow-700">{pendingSales.length}</p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-600">En Carrito</p>
            <p className="text-lg font-semibold text-purple-700">{cart.length}</p>
            <p className="text-xs text-purple-600">${getTotal().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'sales', name: 'Nueva Venta', icon: '🛒' },
              { id: 'pending', name: 'Ventas en Espera', icon: '⏳', badge: pendingSales.length },
              { id: 'history', name: 'Historial', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
                {tab.badge > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-6">
          {/* Pestaña de Nueva Venta */}
          {activeTab === 'sales' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna izquierda - Búsqueda y Artículo Rápido */}
              <div className="space-y-6">
                <ProductSearch 
                  onAddToCart={addToCart}
                  disabled={loading}
                />
                
                <QuickProduct 
                  onAddQuickItem={addQuickItemToCart}
                  disabled={loading}
                />
              </div>

              {/* Columna derecha - Carrito */}
              <div className="lg:col-span-2">
                <SalesCart
                  cart={cart}
                  discount={discount}
                  paymentMethod={paymentMethod}
                  subtotal={getSubtotal()}
                  discountAmount={getDiscountAmount()}
                  total={getTotal()}
                  onUpdateQuantity={updateCartItemQuantity}
                  onRemoveItem={removeFromCart}
                  onSetDiscount={setDiscount}
                  onSetPaymentMethod={setPaymentMethod}
                  onCompleteSale={handleCompleteSale}
                  onCreatePendingSale={handleCreatePendingSale}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {/* Pestaña de Ventas en Espera */}
          {activeTab === 'pending' && (
            <PendingSales
              pendingSales={pendingSales}
              onLoadPendingSale={handleLoadPendingSale}
              onFinalizePendingSale={handleFinalizePendingSale}
              onCancelPendingSale={handleCancelPendingSale}
              currentPendingSale={currentPendingSale}
              loading={loading}
            />
          )}

          {/* Pestaña de Historial */}
          {activeTab === 'history' && (
            <SalesHistory
              sales={sales}
              onProcessReturn={handleProcessReturn}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Mostrar errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Componente de recibo */}
      <Receipt
        sale={lastSale}
        show={showReceipt}
        onClose={() => setShowReceipt(false)}
        onPrint={() => {
          console.log('Recibo impreso');
          setShowReceipt(false);
        }}
      />
    </div>
  );
};

export default Sales;
