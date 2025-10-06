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
import { DateRangePicker, defaultStaticRanges } from 'react-date-range';
import { es } from 'date-fns/locale';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);


// configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');
dayjs.tz.setDefault('America/Argentina/Buenos_Aires');






const monthColors = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
  '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
  '#a082f5ff', '#17becf', '#ff9896', '#c5b0d5'
];
// tus rangos personalizados
const customRanges = [
  {
    label: '📆 Esta semana',
    range: () => ({
      startDate: dayjs().tz().startOf('week').toDate(),
      endDate: dayjs().tz().endOf('week').toDate(),
    }),
    isSelected: (range) => {
      const start = dayjs(range.startDate);
      const end = dayjs(range.endDate);
      return (
        start.isSame(dayjs().startOf('week'), 'day') &&
        end.isSame(dayjs().endOf('week'), 'day')
      );
    },
  },
  {
    label: '📅 Este año',
    range: () => ({
      startDate: dayjs().tz().startOf('year').toDate(),
      endDate: dayjs().tz().endOf('year').toDate(),
    }),
    isSelected: (range) => {
      const start = dayjs(range.startDate);
      const end = dayjs(range.endDate);
      return (
        start.isSame(dayjs().startOf('year'), 'day') &&
        end.isSame(dayjs().endOf('year'), 'day')
      );
    },
  },
  {
    label: '📆 Últimos 2 meses',
    range: () => ({
      startDate: dayjs().tz().subtract(1, 'month').startOf('month').toDate(), // mes pasado inicio
      endDate: dayjs().tz().endOf('month').toDate(),                          // fin mes actual
    }),
    isSelected: (range) => {
      const start = dayjs(range.startDate);
      const end = dayjs(range.endDate);
      return (
        start.isSame(dayjs().subtract(1, 'month').startOf('month'), 'day') &&
        end.isSame(dayjs().endOf('month'), 'day')
      );
    },
  },
  {
    label: '📆 Este mes',
    range: () => ({
      startDate: dayjs().tz().startOf('month').toDate(),
      endDate: dayjs().tz().endOf('month').toDate(),
    }),
    isSelected: (range) => {
      const start = dayjs(range.startDate);
      const end = dayjs(range.endDate);
      return (
        start.isSame(dayjs().startOf('month'), 'day') &&
        end.isSame(dayjs().endOf('month'), 'day')
      );
    },
  },

];

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
  const topSellingSizes = ['M', 'L']; // demo, deberías calcularlo en base a ventas
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');


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
    startDate: dayjs().tz('America/Argentina/Buenos_Aires')
      .startOf('month')
      .toDate(), // inicio del mes actual
    endDate: dayjs().tz('America/Argentina/Buenos_Aires')
      .endOf('month')
      .toDate(), // fin del mes actual
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
        <p className="text-gray-600 mt-2">Reportes y análisis de ventas </p>
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
              rangeColors={['#dc2626']}
              staticRanges={customRanges}      // 👈 aquí tus rangos
              inputRanges={[]}                 // 👈 desactiva los rangos tipo “últimos X días”
            />

          </div>
        )}

        <div style={{ height: 500 }}>
          <ResponsiveBar
            data={chartData.map(d => ({ period: d.period, ventas: d.ventas }))}
            keys={['ventas']}
            indexBy="period"
            layout="vertical"
            margin={{ top: 30, right: 30, bottom: 50, left: 70 }}
            padding={0.25}                  // más delgadas y con espacio entre barras
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}

            colors={({ indexValue }) => {
              if (period === 'year') {
                // asignar color por año
                const year = parseInt(indexValue, 10);
                const yearColors = {
                  2027: '#feb2b2ff', // rojo
                  2026: '#9aebf4ff', // azul
                  2025: '#d6baf8ff', // verde
                };
                return yearColors[year] || '#6b7280'; // gris por defecto
              }

              // meses como antes
              const monthIndex = parseInt(indexValue.split('-')[1], 10) - 1;
              return monthColors[monthIndex % monthColors.length];
            }}

            borderRadius={4}                // esquinas redondeadas
            borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
            enableGridY={true}              // líneas horizontales de referencia
            gridYValues={5}

            // 👇 aquí personalizamos el label
            label={(d) => `$${d.value.toLocaleString('es-AR')}`}


            labelTextColor="#111"
            axisBottom={{
              tickRotation: -30,
              legend: 'Periodo',
              legendOffset: 40,
              legendPosition: 'middle',
              format: (value) => {
                const d = dayjs(value).tz('America/Argentina/Buenos_Aires');
                if (period === 'month') return d.format('MMM');
                if (period === 'day') return d.format('DD MMM');
                if (period === 'week') return `Sem ${d.week()}`;
                if (period === 'year') return d.format('YYYY');
                return value;
              }
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
              },
              labels: {
                text: {
                  fontSize: 14,      // un poquito más grande
                  fontWeight: 700,   // negrita
                }
              }
            }}
            tooltip={({ value, indexValue }) => (
              <div className="bg-white p-2 rounded shadow text-sm">
                <strong>{indexValue}</strong>: ${value.toLocaleString('es-AR')}
              </div>
            )}
            // no mostrar etiqueta si barra es muy baja
            labelSkipHeight={18}

            animate={true}
            motionConfig="slow"
            motionStagger={15}
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



      {/* --- Gráficos por categoría --- */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">📊 Gráficos de Stock</h2>
      <div className="grid grid-cols-1  gap-6 mt-8">
        {categories.map(cat => {
          const sizes = Object.keys(stockData[cat]).sort(sortSizes);
          return (
            <div key={cat} className="bg-white shadow rounded-lg p-4 border border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4 text-center">{cat}</h3>
              <div style={{ height: 450 }}>
                <ResponsiveBar
                  data={sizes.map(size => ({
                    talle: size,
                    stock: stockData[cat][size] || 0
                  }))}

                  keys={['stock']}
                  indexBy="talle"
                  layout="vertical"
                  margin={{ top: 20, right: 30, bottom: 30, left: 60 }}
                  padding={0.3}

                  // 🎨 Colores personalizados
                  colors={({ data }) => {
                    // Prioridades:
                    if (data.stock <= 5) return '#dc2626';                  // rojo stock bajo
                    if (topSellingSizes.includes(data.talle)) return '#16a34a'; // verde talles top

                    // Color base según categoría
                    if (cat.toLowerCase() === 'mujer') return '#f472b6';          // rosa
                    if (cat.toLowerCase() === 'hombre') return '#3b82f6';         // azul
                    if (cat.toLowerCase() === 'niños-bebes' || cat.toLowerCase() === 'ninos-bebes') return '#93c5fd'; // celeste pastel
                    return '#c4b5fd'; // violeta pastel (para "otros" u otras categorías)
                  }}

                  borderRadius={4}
                  label={d => d.value}
                  labelSkipWidth={12}
                  labelTextColor="#111"
                  enableGridX={true}
                  animate={true}
                  motionStagger={15}
                />

              </div>
            </div>
          );
        })}
      </div>


      {/* --- Tablas por categoría --- */}
      <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">📦 Tablas de Stock</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {categories.map(cat => {
          const sizes = Object.keys(stockData[cat]).sort(sortSizes);
          return (
            <div key={cat} className="bg-white shadow rounded-lg p-4 border border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4 text-center">{cat}</h3>
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
                        <td
                          className={`
                      px-2 py-1 border text-center font-bold
                      ${stockData[cat][size] <= 5 ? 'text-red-600' : ''}
                      ${topSellingSizes.includes(size) ? 'bg-green-100 text-green-800' : ''}
                    `}
                        >
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
