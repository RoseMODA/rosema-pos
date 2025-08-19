import React, { useState } from 'react';

/**
 * Componente para mostrar el historial de ventas
 * Permite ver, filtrar y procesar devoluciones de ventas completadas
 */
const SalesHistory = ({ 
  sales, 
  onProcessReturn, 
  loading = false 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');

  /**
   * Formatear precio
   */
  const formatPrice = (price) => {
    return `$${price.toLocaleString()}`;
  };

  /**
   * Formatear fecha
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Filtrar ventas
   */
  const filteredSales = sales.filter(sale => {
    // Filtrar por fecha
    if (filterDate) {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      if (saleDate !== filterDate) return false;
    }

    // Filtrar por método de pago
    if (filterPayment !== 'all' && sale.paymentMethod !== filterPayment) {
      return false;
    }

    return true;
  });

  /**
   * Abrir modal de devolución
   */
  const openReturnModal = (sale) => {
    setSelectedSale(sale);
    setReturnItems(sale.items.map(item => ({
      ...item,
      returnQuantity: 0,
      selected: false
    })));
    setShowModal(true);
  };

  /**
   * Manejar selección de item para devolución
   */
  const handleItemSelection = (itemIndex, selected) => {
    setReturnItems(prev => prev.map((item, index) => 
      index === itemIndex 
        ? { ...item, selected, returnQuantity: selected ? item.quantity : 0 }
        : item
    ));
  };

  /**
   * Manejar cambio de cantidad a devolver
   */
  const handleQuantityChange = (itemIndex, quantity) => {
    setReturnItems(prev => prev.map((item, index) => 
      index === itemIndex 
        ? { ...item, returnQuantity: Math.min(Math.max(0, quantity), item.quantity) }
        : item
    ));
  };

  /**
   * Procesar devolución
   */
  const handleProcessReturn = async () => {
    const itemsToReturn = returnItems
      .filter(item => item.selected && item.returnQuantity > 0)
      .map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.returnQuantity,
        size: item.size,
        color: item.color
      }));

    if (itemsToReturn.length === 0) {
      alert('Seleccione al menos un artículo para devolver');
      return;
    }

    try {
      await onProcessReturn(selectedSale.id, itemsToReturn);
      setShowModal(false);
      setSelectedSale(null);
      setReturnItems([]);
    } catch (error) {
      console.error('Error al procesar devolución:', error);
    }
  };

  /**
   * Cerrar modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSale(null);
    setReturnItems([]);
  };

  /**
   * Calcular total de devolución
   */
  const getReturnTotal = () => {
    return returnItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.price * item.returnQuantity), 0);
  };

  /**
   * Obtener estadísticas rápidas
   */
  const getStats = () => {
    const completedSales = filteredSales.filter(sale => sale.type !== 'return');
    const returns = filteredSales.filter(sale => sale.type === 'return');
    
    const totalSales = completedSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalReturns = returns.reduce((sum, sale) => sum + (sale.returnTotal || 0), 0);
    
    return {
      totalSales: completedSales.length,
      totalAmount: totalSales,
      totalReturns: returns.length,
      returnAmount: totalReturns,
      netAmount: totalSales - totalReturns
    };
  };

  const stats = getStats();

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header con estadísticas */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Historial de Ventas
          </h3>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-600">Ventas</p>
              <p className="text-lg font-semibold text-green-700">{stats.totalSales}</p>
              <p className="text-xs text-green-600">{formatPrice(stats.totalAmount)}</p>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-600">Devoluciones</p>
              <p className="text-lg font-semibold text-red-700">{stats.totalReturns}</p>
              <p className="text-xs text-red-600">{formatPrice(stats.returnAmount)}</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600">Total Neto</p>
              <p className="text-lg font-semibold text-blue-700">{formatPrice(stats.netAmount)}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Filtradas</p>
              <p className="text-lg font-semibold text-gray-700">{filteredSales.length}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="input-rosema text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="input-rosema text-sm"
              >
                <option value="all">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="qr">QR</option>
              </select>
            </div>
            
            {(filterDate || filterPayment !== 'all') && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterDate('');
                    setFilterPayment('all');
                  }}
                  className="btn-secondary text-sm"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de ventas */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredSales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No hay ventas que mostrar</p>
              <p className="text-sm">Las ventas completadas aparecerán aquí</p>
            </div>
          ) : (
            filteredSales.map((sale) => (
              <div 
                key={sale.id} 
                className={`p-4 border rounded-lg ${
                  sale.type === 'return' 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header de la venta */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {sale.type === 'return' ? 'DEVOLUCIÓN' : `Venta #${sale.saleNumber || 'N/A'}`}
                      </h4>
                      {sale.type === 'return' && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Devolución
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(sale.createdAt)}
                    </p>
                    {sale.originalSaleNumber && (
                      <p className="text-xs text-gray-500">
                        Venta original: #{sale.originalSaleNumber}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold ${
                      sale.type === 'return' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {sale.type === 'return' ? '-' : ''}{formatPrice(sale.total || sale.returnTotal || 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sale.paymentMethod || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Resumen de productos */}
                <div className="mb-3">
                  <div className="text-sm text-gray-600 space-y-1">
                    {(sale.items || sale.returnItems || []).slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="truncate mr-2">
                          {item.quantity}x {item.name}
                          {item.size && ` (${item.size})`}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {(sale.items || sale.returnItems || []).length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{(sale.items || sale.returnItems || []).length - 2} artículos más
                      </div>
                    )}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span>
                    {(sale.items || sale.returnItems || []).length} {(sale.items || sale.returnItems || []).length === 1 ? 'artículo' : 'artículos'}
                  </span>
                  {sale.discount && sale.discount.value > 0 && (
                    <span className="text-green-600">
                      Desc: {sale.discount.type === 'percentage' ? `${sale.discount.value}%` : formatPrice(sale.discount.value)}
                    </span>
                  )}
                </div>

                {/* Botones de acción */}
                {sale.type !== 'return' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openReturnModal(sale)}
                      disabled={loading}
                      className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Procesar Devolución
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de devolución */}
      {showModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-90vh overflow-y-auto">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Procesar Devolución - Venta #{selectedSale.saleNumber}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Seleccione los artículos a devolver y especifique las cantidades:
                </p>
                
                <div className="space-y-3">
                  {returnItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => handleItemSelection(index, e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded"
                      />
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.price)} c/u
                          {item.size && ` • Talla: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Cantidad:</span>
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={item.returnQuantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                          disabled={!item.selected}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100"
                        />
                        <span className="text-sm text-gray-500">/ {item.quantity}</span>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(item.price * item.returnQuantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total de devolución */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total a devolver:</span>
                  <span className="text-lg font-semibold text-red-600">
                    {formatPrice(getReturnTotal())}
                  </span>
                </div>
              </div>

              {/* Nota importante */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Nota:</strong> Los productos devueltos se agregarán nuevamente al inventario automáticamente.
                </p>
              </div>
            </div>

            {/* Botones del modal */}
            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                disabled={loading}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessReturn}
                disabled={loading || getReturnTotal() === 0}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  'Procesar Devolución'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesHistory;
