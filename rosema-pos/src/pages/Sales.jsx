import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import QuickItemModal from '../components/QuickItemModal';
import SalesHistoryModal from '../components/SalesHistoryModal';
import ReturnModal from '../components/ReturnModal';
import PrintReceiptModal from '../components/PrintReceiptModal';

/**
 * Página principal del sistema de ventas
 * Implementa el diseño visual específico con layout de dos columnas
 */
const Sales = () => {
  // Hooks personalizados
  const { 
    products, 
    loading: productsLoading, 
    searchProductsByTerm, 
    createSampleData,
    getProductStats 
  } = useProducts();
  
  const {
    sessions,
    activeSessionId,
    cart,
    paymentMethod,
    discountAmount,
    discountPercent,
    cashReceived,
    customerName,
    cardName,
    installments,
    commission,
    totals,
    loading: salesLoading,
    error,
    createSession,
    switchSession,
    cancelSession,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    completeSale,
    setPaymentMethod,
    setDiscountAmount,
    setDiscountPercent,
    setCashReceived,
    setCustomerName,
    setCardName,
    setInstallments,
    setCommission,
    addQuickItem,
    addReturnItem
  } = useSales();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showQuickItemModal, setShowQuickItemModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastSaleData, setLastSaleData] = useState(null);

  // Convertir sesiones a formato compatible con la UI existente
  const pendingSales = Object.values(sessions).map(session => ({
    id: session.id,
    name: session.label,
    total: totals.total || 0,
    items: session.items || []
  }));

  // Estadísticas de productos
  const productStats = getProductStats();

  /**
   * Manejar búsqueda de productos
   */
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchProductsByTerm(term);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  /**
   * Manejar selección de producto
   */
  const handleProductSelect = (product) => {
    if (product.stock <= 0) {
      alert('Producto sin stock disponible');
      return;
    }
    
    addToCart(product, 1, null, null);
    setSearchTerm('');
    setShowResults(false);
  };

  /**
   * Cambiar cliente activo
   */
  const handleClientChange = (clientId) => {
    switchSession(clientId);
  };

  /**
   * Eliminar cliente/venta en espera
   */
  const handleDeleteClient = (clientId) => {
    if (pendingSales.length > 1) {
      cancelSession(clientId);
    }
  };

  /**
   * Procesar venta
   */
  const handleProcessSale = async () => {
    try {
      if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
      }

      if (totals.total <= 0) {
        alert('El total debe ser mayor a cero');
        return;
      }

      const sale = await completeSale();
      alert('Venta procesada exitosamente');
      console.log('Venta completada:', sale);
    } catch (error) {
      alert(`Error al procesar venta: ${error.message}`);
    }
  };

  /**
   * Crear productos de ejemplo
   */
  const handleCreateSampleData = async () => {
    if (confirm('¿Crear productos de ejemplo? Esto agregará productos de prueba a la base de datos.')) {
      try {
        await createSampleData();
        alert('Productos de ejemplo creados exitosamente');
      } catch (error) {
        alert(`Error al crear productos: ${error.message}`);
      }
    }
  };

  /**
   * Manejar agregar artículo rápido
   */
  const handleAddQuickItem = (itemData) => {
    addQuickItem(itemData);
    setShowQuickItemModal(false);
  };

  /**
   * Manejar agregar devolución
   */
  const handleAddReturn = (returnData) => {
    addReturnItem(returnData);
    setShowReturnModal(false);
  };

  /**
   * Crear nueva venta (agregar nuevo cliente)
   */
  const handleNewSale = () => {
    try {
      // Crear nueva sesión con etiqueta automática
      const sessionCount = Object.keys(sessions).length;
      const newSessionId = createSession(`Cliente ${sessionCount + 1}`);
      console.log('Nueva sesión creada:', newSessionId);
    } catch (error) {
      console.error('Error al crear nueva venta:', error);
      alert(`Error al crear nueva venta: ${error.message}`);
    }
  };

  /**
   * Manejar impresión de recibo
   */
  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      alert('No hay productos en el carrito para imprimir');
      return;
    }

    // Preparar datos para el recibo
    const receiptData = {
      saleNumber: `PREV-${Date.now()}`, // Número temporal para vista previa
      items: cart.map(item => ({
        name: item.name,
        code: item.code || 'N/A',
        quantity: item.qty || item.quantity,
        price: item.price
      })),
      customerName: customerName,
      paymentMethod: paymentMethod,
      subtotal: totals.subtotal,
      discount: totals.discountValue,
      total: totals.total,
      cashReceived: cashReceived,
      change: totals.change,
      saleDate: new Date()
    };

    setLastSaleData(receiptData);
    setShowPrintModal(true);
  };

  return (
    <div key={activeSessionId} className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Ventas</h1>
          <p className="text-gray-600">Busca productos y agrégalos al carrito para procesar una venta</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={handleNewSale}
            className="btn-rosema flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nueva Venta</span>
          </button>
          
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Historial de Ventas</span>
          </button>
        </div>
      </div>

      {/* Tabs de clientes en espera */}
      <div className="flex space-x-2 mb-6">
        {pendingSales.map((client) => {
          const session = sessions[client.id];
          const sessionTotals = session ? {
            subtotal: session.items.reduce((sum, item) => sum + (item.price * item.qty), 0),
            discountValue: session.discountPercent > 0 
              ? (session.items.reduce((sum, item) => sum + (item.price * item.qty), 0) * session.discountPercent / 100)
              : session.discountAmount,
            get total() { return Math.max(0, this.subtotal - this.discountValue); }
          } : { total: 0 };

          return (
            <div key={client.id} className="flex items-center">
              <button
                onClick={() => handleClientChange(client.id)}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeSessionId === client.id
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {client.name}
              </button>
              
              {/* Indicador de total y botón eliminar */}
              <div className={`flex items-center px-2 py-2 ${
                activeSessionId === client.id ? 'bg-gray-800' : 'bg-gray-200'
              } rounded-t-lg`}>
                <span className={`text-sm mr-2 ${
                  activeSessionId === client.id ? 'text-white' : 'text-gray-600'
                }`}>
                  ${sessionTotals.total.toLocaleString()}
                </span>
                {pendingSales.length > 1 && (
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      activeSessionId === client.id 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Layout principal de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna izquierda - Búsqueda y productos */}
        <div className="space-y-6">
          
          {/* Sección de búsqueda */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar Productos
              </h3>
              
              <button 
                onClick={() => setShowQuickItemModal(true)}
                className="btn-rosema text-sm flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Artículo Rápido</span>
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por código o nombre del producto..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full input-rosema pl-10"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* Resultados de búsqueda */}
              {showResults && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  {productsLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Buscando productos...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No se encontraron productos</p>
                      {productStats.totalProducts === 0 && (
                        <button
                          onClick={handleCreateSampleData}
                          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                        >
                          Crear productos de ejemplo
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            product.stock <= 0 ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {product.name}
                              </h4>
                              {product.code && (
                                <p className="text-sm text-gray-500">
                                  Código: {product.code}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-lg font-semibold text-green-600">
                                  ${product.salePrice?.toLocaleString()}
                                </span>
                                <span className={`text-sm ${
                                  product.stock <= 5 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  Stock: {product.stock}
                                </span>
                                {product.category && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {product.category}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {product.stock <= 0 && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                Sin Stock
                              </span>
                            )}
                          </div>
                          
                          {/* Tallas y colores disponibles */}
                          {(product.sizes || product.colors) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {product.sizes && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">Tallas:</span>
                                  {product.sizes.slice(0, 3).map((size, index) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                                      {size}
                                    </span>
                                  ))}
                                  {product.sizes.length > 3 && (
                                    <span className="text-xs text-gray-400">+{product.sizes.length - 3}</span>
                                  )}
                                </div>
                              )}
                              
                              {product.colors && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">Colores:</span>
                                  {product.colors.slice(0, 3).map((color, index) => (
                                    <div
                                      key={index}
                                      className="w-3 h-3 rounded-full border border-gray-300"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    ></div>
                                  ))}
                                  {product.colors.length > 3 && (
                                    <span className="text-xs text-gray-400">+{product.colors.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botón de cambio de prenda */}
          <button 
            onClick={() => setShowReturnModal(true)}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Realizar Cambio de Prenda
          </button>

          {/* Carrito de compra (versión izquierda) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              Carrito de Compra
            </h3>

            {/* Método de pago */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full input-rosema"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Débito">Débito</option>
                <option value="Crédito">Crédito</option>
                <option value="QR">QR</option>
              </select>
            </div>

            {/* Descuentos */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descuento en $
                </label>
                <input
                  type="number"
                  value={discountAmount || ''}
                  onChange={(e) => {
                    setDiscountAmount(Number(e.target.value) || 0);
                    setDiscountPercent(0);
                  }}
                  className="w-full input-rosema"
                  placeholder="Ingrese monto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descuento en %
                </label>
                <input
                  type="number"
                  value={discountPercent || ''}
                  onChange={(e) => {
                    setDiscountPercent(Number(e.target.value) || 0);
                    setDiscountAmount(0);
                  }}
                  className="w-full input-rosema"
                  placeholder="Ingrese porcentaje"
                  max="100"
                />
              </div>
            </div>

            {/* Campos específicos para Efectivo */}
            {paymentMethod === 'Efectivo' && (
              <>
                {/* Recibido en efectivo */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recibido en Efectivo
                  </label>
                  <input
                    type="number"
                    value={cashReceived || ''}
                    onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                    className="w-full input-rosema"
                    placeholder="Ingrese monto recibido"
                  />
                </div>

                {/* Vuelto */}
                <div className="mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Vuelto:</span>
                    <span className={totals.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${totals.change.toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Campos específicos para Crédito */}
            {paymentMethod === 'Crédito' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Tarjeta
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full input-rosema"
                    placeholder="Ingrese nombre de la tarjeta"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuotas sin Interés
                    </label>
                    <input
                      type="number"
                      value={installments || ''}
                      onChange={(e) => setInstallments(Number(e.target.value) || 0)}
                      className="w-full input-rosema"
                      placeholder="Número de cuotas"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comisión (%)
                    </label>
                    <input
                      type="number"
                      value={commission || ''}
                      onChange={(e) => setCommission(Number(e.target.value) || 0)}
                      className="w-full input-rosema"
                      placeholder="% de comisión"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Mostrar cálculo de comisión */}
                {commission > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Información de Comisión:</p>
                      <p>Comisión: ${((totals.total * commission) / 100).toLocaleString()}</p>
                      <p>Neto a recibir: ${(totals.total - ((totals.total * commission) / 100)).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center text-2xl font-bold">
                <span>Total:</span>
                <span className="text-green-600">${totals.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3">
              <button 
                onClick={handlePrintReceipt}
                className="flex-1 btn-secondary flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Imprimir recibo</span>
              </button>
              
              <button 
                onClick={handleProcessSale}
                disabled={salesLoading || cart.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {salesLoading ? 'Procesando...' : 'Procesar Venta'}
              </button>
            </div>
          </div>
        </div>

        {/* Columna derecha - Carrito detallado */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              Carrito de Compra
            </h3>
            
            <button className="w-8 h-8 bg-gray-800 hover:bg-gray-900 text-white rounded-lg flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {/* Campo de cliente */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Cliente (Opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full input-rosema"
            />
          </div>

          {/* Lista de productos en el carrito */}
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.lineId || item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    Código: {item.code || 'N/A'} | Talla: {item.variant?.talla || item.size || 'N/A'} | Color: {item.variant?.color || item.color || 'N/A'}
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    ${item.price.toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Controles de cantidad */}
                  <button
                    onClick={() => updateCartItemQuantity(item.lineId || item.id, (item.qty || item.quantity) - 1)}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span className="w-8 text-center font-medium">{item.qty || item.quantity}</span>
                  
                  <button
                    onClick={() => updateCartItemQuantity(item.lineId || item.id, (item.qty || item.quantity) + 1)}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  
                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeFromCart(item.lineId || item.id)}
                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje si el carrito está vacío */}
          {cart.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <p>El carrito está vacío</p>
              <p className="text-sm">Busca productos para agregar a la venta</p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <QuickItemModal
        isOpen={showQuickItemModal}
        onClose={() => setShowQuickItemModal(false)}
        onAddItem={handleAddQuickItem}
      />

      <SalesHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      <ReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onAddReturn={handleAddReturn}
      />

      <PrintReceiptModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        saleData={lastSaleData}
      />
    </div>
  );
};

export default Sales;
