import React, { useState, useEffect } from 'react';
import { useSales } from '../hooks/useSales';
import PrintReceiptModal from './PrintReceiptModal';

/**
 * Modal para mostrar el historial de ventas
 */
const SalesHistoryModal = ({ isOpen, onClose }) => {
  const { 
    salesHistory, 
    loading, 
    loadSalesHistory, 
    searchSalesHistory,
    deleteSaleFromHistory 
  } = useSales();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [saleForPrint, setSaleForPrint] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');

  /**
   * Cargar historial al abrir el modal
   */
  useEffect(() => {
    if (isOpen) {
      loadSalesHistory({ limit: 50 });
    }
  }, [isOpen, loadSalesHistory]);

  /**
   * Manejar búsqueda y filtros
   */
  const handleSearch = async (term = searchTerm) => {
    setSearchTerm(term);
    
    const filters = { limit: 50 };
    
    // Filtro por fechas
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // Incluir todo el día
      filters.endDate = endDateTime;
    }
    
    // Filtro por método de pago
    if (paymentFilter !== 'all') {
      filters.paymentMethod = paymentFilter;
    }
    
    if (term.trim()) {
      await searchSalesHistory(term);
    } else {
      await loadSalesHistory(filters);
    }
  };

  /**
   * Aplicar filtros
   */
  const applyFilters = () => {
    handleSearch();
  };

  /**
   * Limpiar filtros
   */
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPaymentFilter('all');
    setSearchTerm('');
    loadSalesHistory({ limit: 50 });
  };

  /**
   * Formatear fecha
   */
  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Obtener color del método de pago
   */
  const getPaymentMethodColor = (method) => {
    const colors = {
      'Efectivo': 'bg-green-100 text-green-800',
      'Transferencia': 'bg-blue-100 text-blue-800',
      'Débito': 'bg-purple-100 text-purple-800',
      'Crédito': 'bg-orange-100 text-orange-800',
      'QR': 'bg-gray-100 text-gray-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Eliminar venta
   */
  const handleDeleteSale = async (saleId) => {
    try {
      await deleteSaleFromHistory(saleId);
      setShowDeleteConfirm(null);
      alert('Venta eliminada exitosamente');
    } catch (error) {
      alert(`Error al eliminar venta: ${error.message}`);
    }
  };

  /**
   * Manejar impresión de recibo
   */
  const handlePrintReceipt = (sale) => {
    // Preparar datos para el recibo con número de venta
    const receiptData = {
      saleNumber: sale.id.slice(-8).toUpperCase(), // Últimos 8 caracteres del ID como número de venta
      items: sale.items?.map(item => ({
        name: item.name,
        code: item.code,
        quantity: item.quantity,
        price: item.price
      })) || [],
      customerName: sale.customerName,
      paymentMethod: sale.paymentMethod,
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      cashReceived: sale.cashReceived,
      change: sale.change,
      saleDate: sale.saleDate
    };

    setSaleForPrint(receiptData);
    setShowPrintModal(true);
  };

  /**
   * Cerrar modal
   */
  const handleClose = () => {
    setSearchTerm('');
    setSelectedSale(null);
    setShowDeleteConfirm(null);
    setShowPrintModal(false);
    setSaleForPrint(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historial de Ventas
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Búsqueda */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full input-rosema pl-10"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Lista de ventas */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Cargando historial...</span>
            </div>
          ) : salesHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No hay ventas registradas</p>
              <p className="text-sm">Las ventas aparecerán aquí una vez que proceses la primera venta</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {salesHistory.map((sale) => (
                <div key={sale.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Información principal */}
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {sale.customerName || 'Cliente sin nombre'}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodColor(sale.paymentMethod)}`}>
                          {sale.paymentMethod}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(sale.saleDate)}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          {sale.items?.length || 0} artículo(s):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sale.items?.slice(0, 3).map((item, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                          {sale.items?.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{sale.items.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Totales */}
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="text-gray-600">
                          Subtotal: ${sale.subtotal?.toLocaleString() || '0'}
                        </span>
                        {sale.discount > 0 && (
                          <span className="text-orange-600">
                            Descuento: -${sale.discount?.toLocaleString()}
                          </span>
                        )}
                        <span className="font-semibold text-green-600">
                          Total: ${sale.total?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handlePrintReceipt(sale)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>Imprimir</span>
                      </button>
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(sale.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {salesHistory.length} venta(s) encontrada(s)
            </span>
            <button
              onClick={handleClose}
              className="btn-secondary"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de detalle de venta */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900">
                  Detalle de Venta
                </h4>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Información de la venta */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cliente</label>
                    <p className="text-gray-900">{selectedSale.customerName || 'Sin nombre'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha</label>
                    <p className="text-gray-900">{formatDate(selectedSale.saleDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Método de Pago</label>
                    <p className="text-gray-900">{selectedSale.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total</label>
                    <p className="text-green-600 font-semibold">${selectedSale.total?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Artículos</label>
                  <div className="space-y-2">
                    {selectedSale.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.code && (
                            <p className="text-sm text-gray-500">Código: {item.code}</p>
                          )}
                          {(item.size || item.color) && (
                            <p className="text-sm text-gray-500">
                              {item.size && `Talla: ${item.size}`}
                              {item.size && item.color && ' | '}
                              {item.color && `Color: ${item.color}`}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {item.quantity} x ${item.price?.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${(item.price * item.quantity)?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">${selectedSale.subtotal?.toLocaleString()}</span>
                    </div>
                    {selectedSale.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Descuento:</span>
                        <span className="text-orange-600">-${selectedSale.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-green-600">${selectedSale.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h4 className="text-lg font-semibold text-gray-900">
                  Confirmar Eliminación
                </h4>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteSale(showDeleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de impresión de recibo */}
      {showPrintModal && saleForPrint && (
        <PrintReceiptModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          saleData={saleForPrint}
        />
      )}
    </div>
  );
};

export default SalesHistoryModal;
