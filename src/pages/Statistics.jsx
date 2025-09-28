// src/pages/Statistics.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getStockByCategoryAndSize } from '../utils/productHelpers';
import { sortSizes } from '../utils/sizeOrder';
import { useProducts } from '../hooks/useProducts';
import { useCustomers } from '../hooks/useCustomers';
import { getSalesHistory } from '../services/salesService';

import { ResponsiveBar } from '@nivo/bar';

// dayjs + plugins
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import { DateRangePicker } from 'react-date-range';
import { es } from 'date-fns/locale';

// configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');
dayjs.tz.setDefault('America/Argentina/Buenos_Aires');

/* Convierte sale.saleDate (puede ser Date o Firestore Timestamp) -> Date usable por dayjs */
function normalizeSaleDate(sale) {
  if (!sale) return null;
  const raw = sale.saleDate ?? sale.date ?? sale.createdAt;
  if (!raw) return null;

  // Firestore Timestamp tiene .toDate()
  if (raw.toDate) return raw.toDate();
  // Si ya es Date
  if (raw instanceof Date) return raw;
  // Fallback: intentar crear Date
  return new Date(raw);
}

/* Agrupa ventas por periodo (day|week|month|year) usando timezone Argentina */
function groupSales(sales, period = 'day') {
  const groups = {};

  sales.forEach(s => {
    const dt = normalizeSaleDate(s);
    if (!dt) return;

    // convertir a timezone de Argentina
    const d = dayjs(dt).tz('America/Argentina/Buenos_Aires');

    let key;
    switch (period) {
      case 'day':
        key = d.format('YYYY-MM-DD'); // día local
        break;
      case 'week':
        // usamos la fecha de inicio de la semana en zona AR (p. ej. domingo o lunes según configuración).
        // Si preferís que la semana empiece el Lunes, podemos usar startOf('isoWeek') con plugin adicional.
        key = d.startOf('week').format('YYYY-MM-DD'); // etiqueta: fecha inicio de semana
        break;
      case 'month':
        key = d.format('YYYY-MM'); // mes local
        break;
      case 'year':
        key = d.format('YYYY'); // año
        break;
      default:
        key = d.format('YYYY-MM-DD');
    }

    groups[key] = (groups[key] || 0) + (s.netAmount ?? s.total ?? 0);

  });

  // convertir a array ordenado cronológicamente (usando dayjs en TZ AR)
  return Object.entries(groups)
    .map(([k, v]) => ({ period: k, ventas: v }))
    .sort((a, b) =>
      dayjs(a.period).tz('America/Argentina/Buenos_Aires').valueOf() -
      dayjs(b.period).tz('America/Argentina/Buenos_Aires').valueOf()
    );
}

function groupItemsBySupplier(sales) {
  const groups = {};
  sales.forEach(sale => {
    sale.items?.forEach(it => {
      const supplier = it.supplier || 'Sin proveedor';
      groups[supplier] = (groups[supplier] || 0) + (it.quantity || it.qty || 0);
    });
  });

  return Object.entries(groups).map(([proveedor, cantidad]) => ({
    proveedor,
    cantidad
  }));
}


const Statistics = () => {
  const { products } = useProducts();
  const { loadCustomers } = useCustomers();

  // stock por categoria
  const stockData = useMemo(() => getStockByCategoryAndSize(products), [products]);

  const categories = Object.keys(stockData).sort((a, b) => {
    const order = ['mujer', 'hombre', 'niños-bebes', 'otros'];
    const indexA = order.indexOf(a.toLowerCase());
    const indexB = order.indexOf(b.toLowerCase());
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  // estado para rango
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([{
    startDate: dayjs().tz('America/Argentina/Buenos_Aires').startOf('month').toDate(),
    endDate: dayjs().tz('America/Argentina/Buenos_Aires').endOf('month').toDate(),
    key: 'selection'
  }]);

  // resumen
  const [todayStats, setTodayStats] = useState({ total: 0, count: 0 });
  const [monthStats, setMonthStats] = useState({ total: 0, count: 0 });
  const [productsSold, setProductsSold] = useState(0);



  // gráfico
  const [period, setPeriod] = useState('day'); // day | week | month | year
  const [chartData, setChartData] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);

  // cargar clientes (solo para contar si lo necesitás)
  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  // cargar resumen ventas hoy/mes
  useEffect(() => {
    const loadStats = async () => {
      try {
        // --- Hoy (rango local) ---
        const startOfDay = dayjs().tz('America/Argentina/Buenos_Aires').startOf('day').toDate();
        const endOfDay = dayjs().tz('America/Argentina/Buenos_Aires').add(1, 'day').startOf('day').toDate();

        const todaySales = await getSalesHistory({ startDate: startOfDay, endDate: endOfDay });
        const totalToday = todaySales.reduce((s, it) => s + (it.netAmount ?? it.total ?? 0), 0);

        setTodayStats({ total: totalToday, count: todaySales.length });

        // --- Mes actual (inicio mes local -> ahora) ---
        const startOfMonth = dayjs().tz('America/Argentina/Buenos_Aires').startOf('month').toDate();
        const now = new Date();
        const monthSales = await getSalesHistory({ startDate: startOfMonth, endDate: now });

        let monthTotal = 0, monthItems = 0;
        monthSales.forEach(sale => {
          monthTotal += sale.netAmount ?? sale.total ?? 0;
          sale.items?.forEach(it => { monthItems += it.quantity || it.qty || 0; });
        });

        setMonthStats({ total: monthTotal, count: monthSales.length });
        setProductsSold(monthItems);
      } catch (err) {
        console.error('Error cargando resumen de ventas:', err);
      }
    };

    loadStats();
  }, []);

  // cargar datos del gráfico según periodo y rango seleccionado
  useEffect(() => {
    const loadChart = async () => {
      try {
        const start = dateRange[0].startDate;
        const end = dayjs(dateRange[0].endDate).endOf('day').toDate();

        const sales = await getSalesHistory({ startDate: start, endDate: end });

        // ventas por periodo
        const grouped = groupSales(sales, period);
        setChartData(grouped);

        // artículos por proveedor
        const groupedSuppliers = groupItemsBySupplier(sales);
        setSuppliersData(groupedSuppliers);
      } catch (err) {
        console.error('Error cargando datos del gráfico:', err);
      }
    };

    loadChart();
  }, [period, dateRange]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📊 Estadísticas</h1>
        <p className="text-gray-600 mt-2">Reportes y análisis de ventas (hora local: Argentina)</p>
      </div>

      {/* resumen cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">${todayStats.total.toLocaleString('es-AR')}</div>
          <div className="text-gray-600">Ventas Hoy</div>
          <div className="text-xs text-gray-500">{todayStats.count} transacciones</div>
        </div>

        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">${monthStats.total.toLocaleString('es-AR')}</div>
          <div className="text-gray-600">Ventas Mes</div>
          <div className="text-xs text-gray-500">{monthStats.count} transacciones</div>
        </div>

        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{products.length}</div>
          <div className="text-gray-600">Productos en Inventario</div>
        </div>

        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{productsSold}</div>
          <div className="text-gray-600">Productos Vendidos (Mes)</div>
        </div>
      </div>

      {/* gráfico dinámico */}
      <div className="card-rosema p-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            📈 Ventas por {period === 'day' ? 'Día' : period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
          </h2>

          <div className="flex items-center gap-3">
            <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded p-1 text-sm">
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
            </select>

            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              {showCalendar ? 'Ocultar calendario' : 'Cambiar rango'}
            </button>
          </div>
        </div>

        {showCalendar && (
          <div className="border rounded-lg p-3 shadow-sm mb-4">
            <DateRangePicker
              ranges={dateRange}
              onChange={(item) => setDateRange([item.selection])}
              locale={es}
              rangeColors={["#dc2626"]}
            />
          </div>
        )}

        <div style={{ height: 500 }}>
          <ResponsiveBar
            data={chartData.map(d => ({ period: d.period, ventas: d.ventas }))}
            keys={['ventas']}
            indexBy="period"
            margin={{ top: 30, right: 30, bottom: 50, left: 70 }}
            padding={0.25}                  // más delgadas y con espacio entre barras
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#797bf0ff']}            // azul vibrante (indigo-600)
            borderRadius={4}                // esquinas redondeadas
            borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
            enableGridY={true}              // líneas horizontales de referencia
            gridYValues={5}
            axisBottom={{
              tickRotation: -30,
              legend: 'Periodo',
              legendOffset: 40,
              legendPosition: 'middle'
            }}
            axisLeft={{
              legend: 'Ventas ($)',
              legendOffset: -55,
              legendPosition: 'middle'
            }}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fontSize: 12,
                    fill: '#374151'          // gris oscuro para texto
                  }
                },
                legend: {
                  text: {
                    fontSize: 13,
                    fill: '#111827'          // más fuerte para leyendas
                  }
                }
              },
              grid: {
                line: {
                  stroke: '#8ca4d4ff',         // líneas suaves
                  strokeWidth: 1
                }
              },
              tooltip: {
                container: {
                  fontSize: 13,
                  background: 'white',
                  color: '#111827',
                  padding: '6px 10px',
                  borderRadius: 6,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }
              }
            }}
            tooltip={({ value, indexValue }) => (
              <div className="bg-white p-2 rounded shadow text-sm">
                <strong>{indexValue}</strong>: ${value.toLocaleString('es-AR')}
              </div>
            )}
            labelSkipHeight={18}             // no mostrar etiqueta si barra es muy baja
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
            animate={true}                   // animaciones suaves
            motionConfig="gentle"            // tipo de animación
          />


        </div>

        {/*  <div className="card-rosema p-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-900">📦 Artículos vendidos por Proveedor</h2>
          <div style={{ height: 400 }}>
            <ResponsiveBar
              data={suppliersData}
              keys={['cantidad']}
              indexBy="proveedor"
              margin={{ top: 30, right: 30, bottom: 70, left: 70 }}
              padding={0.3}
              colors={['#16a34a']}
              axisBottom={{ tickRotation: -30 }}
              axisLeft={{ legend: 'Unidades vendidas', legendOffset: -55, legendPosition: 'middle' }}
            />
          </div>
        </div>
      */}




      </div>

      {/* stock tables */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">📦 Stock por Categoría y Talle</h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {categories.map(cat => {
          const sizes = Object.keys(stockData[cat]).sort(sortSizes);
          return (
            <div key={cat} className="bg-white shadow rounded-lg p-3 border border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-2 text-center">{cat}</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 border text-center">Talle</th>
                      <th className="px-2 py-1 border text-center bg-blue-200">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map(size => (
                      <tr key={size}>
                        <td className="px-2 py-1 border text-center font-medium">{size}</td>
                        <td className={`px-2 py-1 border text-center bg-blue-50 font-bold ${stockData[cat][size] <= 5 ? 'text-red-600' : ''}`}>
                          {stockData[cat][size]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;
