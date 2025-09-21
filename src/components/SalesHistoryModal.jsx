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
      const today = new Date();
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);

      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);

      loadSalesHistory({ startDate: start, endDate: end, limit: 50 });
    }
  }, [isOpen, loadSalesHistory]);


  /**
   * Manejar búsqueda y filtros
   */
  const handleSearch = async (term = searchTerm) => {
    setSearchTerm(term);

    if (term.trim()) {
      await searchSalesHistory(term);
    } else {
      // Si no hay término de búsqueda, aplicar filtros
      applyFilters();
    }
  };

  /**
   * Aplicar filtros
   */
  const applyFilters = async () => {
    const filters = { limit: 50 };

    if (startDate) {
      const parts = startDate.split("-"); // "YYYY-MM-DD"
      const start = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
      filters.startDate = start;
    }

    if (endDate) {
      const parts = endDate.split("-");
      const end = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
      filters.endDate = end;
    }

    if (paymentFilter !== "all") {
      filters.paymentMethod = paymentFilter;
    }

    await loadSalesHistory(filters);
  };


  /**
   * Aplicar filtros rapidos
   */
  const applyQuickFilter = (type) => {
    const today = new Date();
    let start, end;

    if (type === "today") {
      start = new Date(today);
      start.setHours(0, 0, 0, 0);
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
    }

    if (type === "yesterday") {
      start = new Date(today);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);

      end = new Date(today);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    }

    if (type === "week") {
      const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes...
      start = new Date(today);
      start.setDate(today.getDate() - dayOfWeek + 1); // lunes
      start.setHours(0, 0, 0, 0);

      end = new Date(today);
      end.setHours(23, 59, 59, 999);
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);

    loadSalesHistory({ startDate: start, endDate: end, limit: 50 });
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
   * Calcular dinero realmente recibido (considerando comisiones)
   */
  const calculateNetReceived = (sale) => {
    if (sale.paymentMethod === 'Efectivo') {
      return sale.cashReceived || sale.total;
    }
    if (['Crédito', 'Débito', 'QR'].includes(sale.paymentMethod) && sale.commission) {
      return sale.total - (sale.total * sale.commission / 100);
    }
    return sale.total;
  };

  /**
   * Manejar impresión de recibo
   * ✅ MEJORADO: Mapeo completo de detalles del producto incluyendo talle y color
   */
  const handlePrintReceipt = (sale) => {
    // Preparar datos para el recibo con número de venta
    const receiptData = {
      saleNumber: sale.saleNumber || sale.id.slice(-8).toUpperCase(), // Usar saleNumber si existe
      items: sale.items?.map(item => ({
        name: item.productName || item.articulo || item.name || 'Producto sin nombre',
        quantity: item.quantity,
        price: item.price,
        // ✅ AGREGADO: Incluir detalles de variante
        size: item.talle || item.size || null,
        color: item.color || null,
        code: item.code || item.productId || null
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

    console.log('📄 Datos del recibo preparados con detalles completos:', receiptData);
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

        {/* Búsqueda y Filtros */}
        <div className="p-6 border-b border-gray-200">
          {/* Filtros por fecha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  applyFilters();
                }}
                className="w-full input-rosema"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  applyFilters();
                }}
                className="w-full input-rosema"
              />
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => applyQuickFilter("today")}
                className="btn-rosema text-lm"
              >
                Hoy
              </button>
              <button
                onClick={() => applyQuickFilter("yesterday")}
                className="btn-rosema text-lm"
              >
                Ayer
              </button>
              <button
                onClick={() => applyQuickFilter("week")}
                className="btn-rosema text-xs"
              >
                Esta semana
              </button>
            </div>



          </div>



          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por cliente o N° Venta..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full input-rosema pl-10"
            />

          </div>
        </div>

        {/* Lista de ventas */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Venta</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Método</th>

                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>


                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesHistory.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-xs text-gray-500">
                    {sale.saleNumber || sale.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodColor(sale.paymentMethod)}`}>
                      {sale.paymentMethod}
                    </span>
                  </td>

                  <td className="px-4 py-2 text-sm text-gray-700">
                    {sale.customerName || '__'}
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-semibold text-green-600">
                    ${sale.total?.toLocaleString() || '0'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {formatDate(sale.saleDate)}
                  </td>


                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handlePrintReceipt(sale)}
                      className="text-green-600 hover:text-green-700 text-sm "
                    >
                      Imprimir
                    </button>

                    <button
                      onClick={() => setShowDeleteConfirm(sale.id)}
                      className="text-bold text-red-600 hover:text-red-700 text-lm"
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      {
        selectedSale && (
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
                      <label className="text-sm font-medium text-gray-500">N° Venta</label>
                      <p className="text-gray-900 font-mono">
                        {selectedSale.saleNumber || selectedSale.id.slice(-8).toUpperCase()}
                      </p>
                    </div>

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
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dinero Recibido</label>
                      <p className="text-blue-600 font-semibold">${calculateNetReceived(selectedSale)?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Artículos</label>
                    <div className="space-y-2">
                      {selectedSale.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.productName || item.articulo || item.name || 'Producto sin nombre'}
                            </p>
                            {(item.code || item.productId) && (
                              <p className="text-sm text-gray-500">
                                Código: {item.code || item.productId}
                              </p>
                            )}
                            {/* ✅ MEJORADO: Mostrar talle y color con fallbacks */}
                            {(item.talle || item.size || item.color) && (
                              <p className="text-sm text-gray-500">
                                {(item.talle || item.size) && `Talle: ${item.talle || item.size}`}
                                {(item.talle || item.size) && item.color && ' | '}
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
        )
      }

      {/* Confirmación de eliminación */}
      {
        showDeleteConfirm && (
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
        )
      }

      {/* Modal de impresión de recibo */}
      {
        showPrintModal && saleForPrint && (
          <PrintReceiptModal
            isOpen={showPrintModal}
            onClose={() => setShowPrintModal(false)}
            saleData={saleForPrint}
          />
        )
      }
    </div >
  );
};

export default SalesHistoryModal;
