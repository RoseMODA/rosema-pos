import React, { useState, useEffect } from 'react';
import { useSales } from '../hooks/useSales';
import PrintReceiptModal from './PrintReceiptModal';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");
import { Timestamp } from "firebase/firestore"; // 👈 importar
import { DateRangePicker } from "react-date-range";
import { es } from "date-fns/locale";
import "react-date-range/dist/styles.css"; // estilos básicos
import "react-date-range/dist/theme/default.css"; // tema por defecto


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
  const [filteredSales, setFilteredSales] = useState([]);


  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);


  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    if (isOpen && dateRange.length > 0) {
      applyFilters();
    }
  }, [dateRange, paymentFilter]);




  /**
   * Cargar historial al abrir el modal
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSales(salesHistory);
    } else {
      const term = searchTerm.toLowerCase();

      const filtered = salesHistory.filter(sale => {
        const saleNumber = (sale.saleNumber || sale.id || "").toLowerCase();
        const customer = (sale.customerName || "").toLowerCase();
        const items = sale.items?.some(item =>
          (item.code || item.productId || "").toLowerCase().includes(term)
        );

        return (
          saleNumber.includes(term) ||
          customer.includes(term) ||
          items
        );
      });

      setFilteredSales(filtered);
    }
  }, [searchTerm, salesHistory]);





  /**
   * Manejar búsqueda y filtros
   */
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handlePrintSummary = () => {
    if (!filteredSales.length) {
      alert("No hay ventas para este rango.");
      return;
    }

    // Agrupar ventas por día
    const grouped = groupSalesByDay(filteredSales);

    // Abrir ventana de impresión
    const summaryWindow = window.open("", "_blank");

    let html = `
    <html>
    <head>
      <title>Resumen de Ventas</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h2 { color: #dc2626; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f4f4f4; }
        .day-header { background: #eee; font-weight: bold; }
        .total { font-weight: bold; color: green; }
        .items { font-size: 11px; color: #555; margin-left: 20px; }
        .item-row { border-top: 1px dashed #ccc; }
      </style>
    </head>
    <body>
      <h2>Resumen de Ventas</h2>
  `;

    Object.entries(grouped).forEach(([day, sales]) => {
      const totalDay = sales.reduce((sum, s) => sum + calculateNetReceived(s), 0);

      html += `
      <h3>${day} - TOTAL: $${totalDay.toLocaleString()}</h3>
      <table>
        <thead>
          <tr>
            <th>N° Venta</th>
            <th>Cliente</th>
            <th>Método</th>
            <th>Total</th>
            <th>Neto</th>
          </tr>
        </thead>
        <tbody>
    `;

      sales.forEach(s => {
        html += `
        <tr>
          <td>${s.saleNumber || s.id}</td>
          <td>${s.customerName || "__"}</td>
          <td>${s.paymentMethod}</td>
          <td>$${s.total.toLocaleString()}</td>
          <td class="total">$${calculateNetReceived(s).toLocaleString()}</td>
        </tr>
      `;

        // 👇 Detalle de artículos vendidos
        if (s.items && s.items.length > 0) {
          html += `
          <tr class="item-row">
            <td colspan="5">
              <div class="items">
                <ul>
        `;
          s.items.forEach(item => {
            html += `
            <li>
              ${item.productName || item.articulo || item.name || "Producto"} 
              ${item.size ? `(${item.size})` : ""} 
              x${item.quantity} - 
              $${item.price?.toLocaleString() || "0"} 
              ${item.code ? ` [${item.code}]` : ""}
            </li>
          `;
          });
          html += `
                </ul>
              </div>
            </td>
          </tr>
        `;
        }
      });

      html += `</tbody></table>`;
    });

    html += `
    </body></html>
  `;

    summaryWindow.document.write(html);
    summaryWindow.document.close();
    summaryWindow.print();
  };



  /**
   * Aplicar filtros
   */
  const applyFilters = async () => {
    const filters = { limit: 50 };

    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;

    filters.startDate = Timestamp.fromDate(new Date(start.setHours(0, 0, 0, 0)));
    filters.endDate = Timestamp.fromDate(new Date(end.setHours(23, 59, 59, 999)));

    if (paymentFilter !== "all") {
      filters.paymentMethod = paymentFilter;
    }

    await loadSalesHistory(filters);
  };


  /**
  * Aplicar filtros rápidos
  */
  const applyQuickFilter = (type) => {
    let start, end;

    if (type === "today") {
      start = dayjs().startOf("day").toDate();
      end = dayjs().endOf("day").toDate();
    }

    if (type === "yesterday") {
      start = dayjs().subtract(1, "day").startOf("day").toDate();
      end = dayjs().subtract(1, "day").endOf("day").toDate();
    }

    if (type === "week") {
      start = dayjs().startOf("week").toDate();
      end = dayjs().endOf("day").toDate();
    }

    setDateRange([{ startDate: start, endDate: end, key: "selection" }]);

    loadSalesHistory({
      startDate: Timestamp.fromDate(start),
      endDate: Timestamp.fromDate(end),
      limit: 50,
    });
  };





  /**
   * Formatear fecha
   */
  const formatDate = (date) => {
    if (!date) return "Fecha no disponible";
    return dayjs(date).format("DD/MM/YYYY HH:mm");
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

  // Agrupar ventas por día
  const groupSalesByDay = (sales) => {
    return sales.reduce((groups, sale) => {
      // Ej: "domingo 21 de septiembre 2025"
      const dateKey = dayjs(sale.saleDate).format("dddd D [de] MMMM YYYY");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(sale);
      return groups;
    }, {});
  };



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
          <div className="mb-4">
            {/* Fila de botones */}
            <div className="flex justify-end space-x-2 mb-3">
              <button
                onClick={() => applyQuickFilter("today")}
                className="btn-rosema text-sm"
              >
                Hoy
              </button>
              <button
                onClick={() => applyQuickFilter("yesterday")}
                className="btn-rosema text-sm"
              >
                Ayer
              </button>
              <button
                onClick={() => applyQuickFilter("week")}
                className="btn-rosema text-sm"
              >
                Esta semana
              </button>

              {/* Botón para desplegar calendario */}
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="btn-secondary text-sm"
              >
                {showCalendar ? "Ocultar calendario" : "📅 Elegir rango"}
              </button>
              <button
                onClick={handlePrintSummary}
                className="btn-rosema text-sm ml-2"
              >
                📄 Resumen
              </button>



            </div>

            {/* Calendario plegable */}
            {showCalendar && (
              <div className="border rounded-lg p-3 shadow-sm">
                <DateRangePicker
                  ranges={dateRange}
                  onChange={(item) => setDateRange([item.selection])}
                  locale={es}
                  rangeColors={["#dc2626"]}
                />
              </div>
            )}
          </div>




          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por Codigo, Cliente o N° Venta..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full input-rosema pl-10"
            />

          </div>
        </div>

        {/* Lista de ventas */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">N° Venta</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Método</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Cliente</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-white uppercase">Total</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-white uppercase">Neto</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-white uppercase">%OFF</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Fecha</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-blue-50 divide-y divide-blue-800">
              {Object.entries(groupSalesByDay(filteredSales)).map(([day, sales]) => (

                <React.Fragment key={day}>
                  {/* Encabezado del día */}
                  <tr className="bg-gray-800">
                    <td colSpan={8} className="px-4 py-2 text-lm font-bold text-white uppercase">
                      <div className="flex items-center w-full">
                        <span>{day}</span>
                        <span className="ml-auto text-white">
                          TOTAL: ${sales.reduce((sum, sale) => sum + calculateNetReceived(sale), 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>




                  {/* Ventas de ese día */}
                  {sales.map((sale) => (
                    <React.Fragment key={sale.id}>
                      {/* Fila principal */}
                      <tr className="hover:bg-blue-50">
                        <td className="px-4 py-2 font-medium text-xs text-gray-500">
                          {sale.saleNumber || sale.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodColor(
                              sale.paymentMethod
                            )}`}
                          >
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 font-bold">
                          {sale.customerName || "__"}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-semibold text-green-600">
                          ${sale.total?.toLocaleString() || "0"}
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-blue-600 font-semibold">
                          ${calculateNetReceived(sale)?.toLocaleString() || "0"}
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-orange-600">
                          {sale.discount > 0
                            ? `${((sale.discount / (sale.subtotal || sale.total)) * 100).toFixed(0)}%`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {formatDate(sale.saleDate)}
                        </td>
                        <td className="px-4 py-2 text-center space-x-2">
                          <button
                            onClick={() => handlePrintReceipt(sale)}
                            className="text-green-600 hover:text-green-700 text-sm"
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

                      {/* Items de la venta */}
                      {sale.items?.length > 0 && (
                        <tr className="bg-white">
                          <td colSpan={8} className="px-6 py-2">
                            <ul className="space-y-1">
                              {sale.items.map((item, idx) => (
                                <li
                                  key={`${sale.id}-item-${idx}`}
                                  className="flex items-center text-sm text-gray-700"
                                >
                                  <span className="ml-6 mr-2 text-gray-400">|→</span>

                                  {/* Contenedor controlado */}
                                  <div className="flex-1 max-w-sm flex">
                                    {/* Nombre */}
                                    <span className="flex-1 font-semibold">
                                      {item.productName || item.articulo || item.name || "Producto"}{" "}
                                      {item.size && (
                                        <span className="text-xs text-gray-500 font-normal">
                                          ({item.size})
                                        </span>
                                      )}
                                      {item.quantity && (
                                        <span className="ml-1 text-xs text-gray-500 font-normal">
                                          (x{item.quantity})
                                        </span>
                                      )}
                                    </span>
                                    {/* Precio */}
                                    <span
                                      className={`w-20 text-right text-xs ${item.price < 0 ? "text-red-600 font-semibold" : "text-gray-500"
                                        }`}
                                    >
                                      ${item.price?.toLocaleString() || "0"}
                                    </span>
                                    {/* Código de barras */}
                                    <span className="w-28 text-right text-xs font-normal text-gray-400">
                                      {item.code || item.productId || ""}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </React.Fragment>
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
