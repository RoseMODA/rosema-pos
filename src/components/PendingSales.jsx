import React, { useState } from 'react';

/**
 * Componente para gestionar ventas en espera
 * Permite ver, cargar, finalizar y cancelar ventas pendientes
 */
const PendingSales = ({ 
  pendingSales, 
  onLoadPendingSale, 
  onFinalizePendingSale, 
  onCancelPendingSale,
  currentPendingSale,
  loading = false 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [actionType, setActionType] = useState(null); // 'finalize' | 'cancel'

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
   * Manejar carga de venta en espera
   */
  const handleLoadSale = (sale) => {
    onLoadPendingSale(sale.id);
  };

  /**
   * Mostrar modal de confirmación
   */
  const showConfirmationModal = (sale, action) => {
    setSelectedSale(sale);
    setActionType(action);
    setShowModal(true);
  };

  /**
   * Confirmar acción
   */
  const handleConfirmAction = async () => {
    if (!selectedSale || !actionType) return;

    try {
      if (actionType === 'finalize') {
        await onFinalizePendingSale(selectedSale.id);
      } else if (actionType === 'cancel') {
        await onCancelPendingSale(selectedSale.id);
      }
      
      setShowModal(false);
      setSelectedSale(null);
      setActionType(null);
    } catch (error) {
      console.error('Error al procesar acción:', error);
    }
  };

  /**
   * Cerrar modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSale(null);
    setActionType(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Ventas en Espera
          </h3>
          <span className="text-sm text-gray-600">
            {pendingSales.length} {pendingSales.length === 1 ? 'venta' : 'ventas'}
          </span>
        </div>

        {/* Lista de ventas en espera */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {pendingSales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p>No hay ventas en espera</p>
              <p className="text-sm">Las ventas guardadas aparecerán aquí</p>
            </div>
          ) : (
            pendingSales.map((sale) => (
              <div 
                key={sale.id} 
                className={`p-4 border rounded-lg transition-colors ${
                  currentPendingSale === sale.id 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header de la venta */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {sale.customerLabel}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(sale.createdAt)}
                    </p>
                    {currentPendingSale === sale.id && (
                      <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        Cargada en carrito
                      </span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatPrice(sale.total)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sale.items.length} {sale.items.length === 1 ? 'artículo' : 'artículos'}
                    </p>
                  </div>
                </div>

                {/* Resumen de productos */}
                <div className="mb-3">
                  <div className="text-sm text-gray-600 space-y-1">
                    {sale.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="truncate mr-2">
                          {item.quantity}x {item.name}
                          {item.size && ` (${item.size})`}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {sale.items.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{sale.items.length - 2} artículos más
                      </div>
                    )}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span>Pago: {sale.paymentMethod}</span>
                  {sale.discount && sale.discount.value > 0 && (
                    <span className="text-green-600">
                      Desc: {sale.discount.type === 'percentage' ? `${sale.discount.value}%` : formatPrice(sale.discount.value)}
                    </span>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoadSale(sale)}
                    disabled={loading || currentPendingSale === sale.id}
                    className="flex-1 btn-secondary text-sm disabled:opacity-50"
                  >
                    {currentPendingSale === sale.id ? 'Cargada' : 'Cargar'}
                  </button>
                  
                  <button
                    onClick={() => showConfirmationModal(sale, 'finalize')}
                    disabled={loading}
                    className="flex-1 btn-rosema text-sm"
                  >
                    Finalizar
                  </button>
                  
                  <button
                    onClick={() => showConfirmationModal(sale, 'cancel')}
                    disabled={loading}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Información adicional */}
        {pendingSales.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 text-center">
              <p>💡 <strong>Tip:</strong> Las ventas en espera no afectan el inventario hasta ser finalizadas</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === 'finalize' ? 'Finalizar Venta' : 'Cancelar Venta'}
              </h3>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  {actionType === 'finalize' 
                    ? '¿Está seguro que desea finalizar esta venta?' 
                    : '¿Está seguro que desea cancelar esta venta?'
                  }
                </p>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p><strong>Cliente:</strong> {selectedSale.customerLabel}</p>
                  <p><strong>Total:</strong> {formatPrice(selectedSale.total)}</p>
                  <p><strong>Artículos:</strong> {selectedSale.items.length}</p>
                  <p><strong>Fecha:</strong> {formatDate(selectedSale.createdAt)}</p>
                </div>
              </div>

              {actionType === 'finalize' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Nota:</strong> Al finalizar la venta se descontará el stock de los productos y se generará el registro de venta.
                  </p>
                </div>
              )}

              {actionType === 'cancel' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm">
                    <strong>Advertencia:</strong> Esta acción no se puede deshacer. La venta será eliminada permanentemente.
                  </p>
                </div>
              )}
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
                onClick={handleConfirmAction}
                disabled={loading}
                className={`flex-1 ${
                  actionType === 'finalize' ? 'btn-rosema' : 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  actionType === 'finalize' ? 'Finalizar Venta' : 'Eliminar Venta'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PendingSales;
