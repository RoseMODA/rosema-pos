import React, { useState, useEffect } from 'react';
import { getSalesHistory } from '../../services/salesService';

/**
 * Componente para mostrar estadísticas diarias de ventas
 * Muestra el dinero neto recibido (considerando comisiones de tarjetas)
 * MEJORADO: Incluye opciones para ver ayer y seleccionar fecha
 */
const DailyStats = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalNet: 0,
    totalGross: 0,
    salesCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  /**
   * Calcular dinero neto recibido considerando comisiones
   */
  const calculateNetReceived = (sale) => {
    if (sale.paymentMethod === 'Efectivo') {
      return sale.cashReceived || sale.total;
    }

    // Para tarjetas de crédito, débito y QR, descontar comisión si existe
    if (['Crédito', 'Débito', 'QR'].includes(sale.paymentMethod) && sale.commission) {
      return sale.total - (sale.total * sale.commission / 100);
    }

    // Para transferencias y otros métodos sin comisión
    return sale.total;
  };

  /**
   * Cargar estadísticas para una fecha específica
   */
  const loadStatsForDate = async (dateType = 'today', customDateValue = null) => {
    setLoading(true);
    setError(null);

    try {
      let targetDate;
      let dateLabel;

      switch (dateType) {
        case 'today':
          targetDate = new Date();
          dateLabel = 'Hoy';
          break;
        case 'yesterday':
          targetDate = new Date();
          targetDate.setDate(targetDate.getDate() - 1);
          dateLabel = 'Ayer';
          break;
        case 'custom':
          if (!customDateValue) return;
          targetDate = new Date(customDateValue);
          dateLabel = targetDate.toLocaleDateString('es-AR');
          break;
        default:
          targetDate = new Date();
          dateLabel = 'Hoy';
      }

      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

      const sales = await getSalesHistory({
        startDate: startOfDay,
        endDate: endOfDay,
        limit: 1000 // Obtener todas las ventas del día
      });

      let totalNet = 0;
      let totalGross = 0;

      sales.forEach(sale => {
        const netAmount = calculateNetReceived(sale);
        totalNet += netAmount;
        totalGross += sale.total || 0;
      });

      setStats({
        totalSales: sales.length,
        totalNet,
        totalGross,
        salesCount: sales.length,
        dateLabel // Agregar etiqueta de fecha
      });

    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar selección de fecha
   */
  const handleDateSelection = (dateType) => {
    setSelectedDate(dateType);
    if (dateType === 'calendar') {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
      loadStatsForDate(dateType);
    }
  };

  /**
   * Manejar fecha personalizada
   */
  const handleCustomDate = () => {
    if (customDate) {
      loadStatsForDate('custom', customDate);
      setShowCalendar(false);
    }
  };

  /**
   * Cargar estadísticas al montar el componente y cuando se hace visible
   */
  useEffect(() => {
    if (isVisible) {
      loadStatsForDate(selectedDate);
    }
  }, [isVisible]);

  /**
   * Recargar estadísticas cada 5 minutos si está visible (solo para "hoy")
   */
  useEffect(() => {
    if (!isVisible || selectedDate !== 'today') return;

    const interval = setInterval(() => {
      loadStatsForDate('today');
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isVisible, selectedDate]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Header con botón para mostrar/ocultar */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-xl mr-2">📊</span>
          Estadísticas del Día
        </h3>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${isVisible
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
        >
          {isVisible ? '👁️ Ocultar' : '👁️ Mostrar'}
        </button>
      </div>

      {/* Contenido de estadísticas */}
      {isVisible && (
        <div className="space-y-4">
          {/* Botones de selección de fecha */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleDateSelection('today')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDate === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              📅 Hoy
            </button>
            <button
              onClick={() => handleDateSelection('yesterday')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDate === 'yesterday'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              📆 Ayer
            </button>
            <button
              onClick={() => handleDateSelection('calendar')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showCalendar
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              🗓️ Calendario
            </button>
          </div>

          {/* Selector de fecha personalizada */}
          {showCalendar && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">
                  Seleccionar fecha:
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleCustomDate}
                  disabled={!customDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ver Estadísticas
                </button>
              </div>
            </div>
          )}

          {/* Mostrar fecha seleccionada */}


          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={() => loadStatsForDate(selectedDate)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Neto Recibido */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Dinero Neto Recibido</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${stats.totalNet.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      (Descontando comisiones)
                    </p>
                  </div>
                  <div className="text-3xl text-green-500">💰</div>
                </div>
              </div>

              {/* Total Bruto */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Bruto</p>
                    <p className="text-2xl font-bold text-blue-700">
                      ${stats.totalGross.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      (Antes de comisiones)
                    </p>
                  </div>
                  <div className="text-3xl text-blue-500">📈</div>
                </div>
              </div>

              {/* Número de Ventas */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Ventas Realizadas</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {stats.salesCount}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Transacciones hoy
                    </p>
                  </div>
                  <div className="text-3xl text-purple-500">🛒</div>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          {!loading && !error && isVisible && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  💡 <strong>Diferencia por comisiones:</strong>
                  ${(stats.totalGross - stats.totalNet).toLocaleString()}
                </span>
                <button
                  onClick={() => loadStatsForDate(selectedDate, customDate)}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Actualizar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyStats;
