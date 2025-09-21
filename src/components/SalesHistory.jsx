import React, { useState, useEffect } from 'react';
import { getAllSales, searchSales, getSalesStats } from '../services/salesService';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

/**
 * Componente para mostrar el historial de ventas con filtros
 */
const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  // Estados de filtros
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    productName: '',
    providerName: '',
    paymentMethod: '',
    customerName: ''
  });

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar ventas al montar
  useEffect(() => {
    loadSales();
    loadStats();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [sales, filters]);

  /**
   * Cargar todas las ventas
   */
  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const salesData = await getAllSales();
      setSales(salesData);
    } catch (err) {
      console.error('Error cargando ventas:', err);
      setError('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas
   */
  const loadStats = async () => {
    try {
      const todayStats = await getSalesStats('today');
      const weekStats = await getSalesStats('week');
      const monthStats = await getSalesStats('month');

      setStats({
        today: todayStats,
        week: weekStats,
        month: monthStats
      });
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  /**
   * Aplicar filtros a las ventas
   */
  const applyFilters = () => {
    let filtered = [...sales];

    // Filtro por fecha de inicio
    if (filters.startDate) {
      const startDate = dayjs(filters.startDate).startOf("day");
      filtered = filtered.filter(sale =>
        dayjs(sale.createdAt).isAfter(startDate) || dayjs(sale.createdAt).isSame(startDate)
      );
    }

    // Filtro por fecha de fin
    if (filters.endDate) {
      const endDate = dayjs(filters.endDate).endOf("day");
      filtered = filtered.filter(sale =>
        dayjs(sale.createdAt).isBefore(endDate) || dayjs(sale.createdAt).isSame(endDate)
      );
    }


    // Filtro por nombre de producto
    if (filters.productName) {
      const productTerm = filters.productName.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.items?.some(item =>
          item.productName?.toLowerCase().includes(productTerm) ||
          item.articulo?.toLowerCase().includes(productTerm)
        )
      );
    }

    // Filtro por proveedor
    if (filters.providerName) {
      const providerTerm = filters.providerName.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.items?.some(item =>
          item.providerName?.toLowerCase().includes(providerTerm)
        )
      );
    }

    // Filtro por método de pago
    if (filters.paymentMethod) {
      filtered = filtered.filter(sale =>
        sale.paymentMethod === filters.paymentMethod
      );
    }

    // Filtro por cliente
    if (filters.customerName) {
      const customerTerm = filters.customerName.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.customerName?.toLowerCase().includes(customerTerm)
      );
    }

    setFilteredSales(filtered);
    setCurrentPage(1); // Reset a primera página
  };

  /**
   * Manejar cambio de filtros
   */
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Limpiar filtros
   */
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      productName: '',
      providerName: '',
      paymentMethod: '',
      customerName: ''
    });
  };

  /**
   * Formatear fecha
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Obtener ventas paginadas
   */
  const getPaginatedSales = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSales.slice(startIndex, endIndex);
  };

  /**
   * Calcular número total de páginas
   */
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const paginatedSales = getPaginatedSales();

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            ${stats.today?.totalRevenue?.toLocaleString() || 0}
          </div>
          <div className="text-gray-600">Ventas Hoy</div>
          <div className="text-sm text-gray-500">
            {stats.today?.totalSales || 0} transacciones
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ${stats.week?.totalRevenue?.toLocaleString() || 0}
          </div>
          <div className="text-gray-600">Esta Semana</div>
          <div className="text-sm text-gray-500">
            {stats.week?.totalSales || 0} transacciones
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            ${stats.month?.totalRevenue?.toLocaleString() || 0}
          </div>
          <div className="text-gray-600">Este Mes</div>
          <div className="text-sm text-gray-500">
            {stats.month?.totalSales || 0} transacciones
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Filtros de Búsqueda
          </h3>
          <button
            onClick={clearFilters}
            className="btn-secondary text-sm"
          >
            Limpiar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Fecha inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full input-rosema"
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full input-rosema"
            />
          </div>

          {/* Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto
            </label>
            <input
              type="text"
              value={filters.productName}
              onChange={(e) => handleFilterChange('productName', e.target.value)}
              placeholder="Nombre del producto"
              className="w-full input-rosema"
            />
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <input
              type="text"
              value={filters.providerName}
              onChange={(e) => handleFilterChange('providerName', e.target.value)}
              placeholder="Nombre del proveedor"
              className="w-full input-rosema"
            />
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="w-full input-rosema"
            >
              <option value="">Todos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <input
              type="text"
              value={filters.customerName}
              onChange={(e) => handleFilterChange('customerName', e.target.value)}
              placeholder="Nombre del cliente"
              className="w-full input-rosema"
            />
          </div>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Ventas ({filteredSales.length})
            </h3>
            <button
              onClick={loadSales}
              className="btn-secondary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando ventas...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadSales} className="btn-rosema">
              Reintentar
            </button>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600 mb-4">No se encontraron ventas</p>
            <p className="text-sm text-gray-500">
              {sales.length === 0 ? 'No hay ventas registradas' : 'Intenta ajustar los filtros de búsqueda'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sale.saleNumber || sale.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.customerName || 'Cliente general'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          {sale.items?.slice(0, 2).map((item, index) => (
                            <div key={index} className="truncate">
                              {item.quantity}x {item.productName || item.articulo}
                              {item.talle && item.color && (
                                <span className="text-gray-500"> ({item.talle}/{item.color})</span>
                              )}
                            </div>
                          ))}
                          {sale.items?.length > 2 && (
                            <div className="text-gray-500 text-xs">
                              +{sale.items.length - 2} más...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${sale.paymentMethod === 'Efectivo'
                          ? 'bg-green-100 text-green-800'
                          : sale.paymentMethod === 'Tarjeta'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                          }`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${(sale.total || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredSales.length)} de {filteredSales.length} ventas
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${currentPage === page
                          ? 'bg-red-600 text-white border-red-600'
                          : 'border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
