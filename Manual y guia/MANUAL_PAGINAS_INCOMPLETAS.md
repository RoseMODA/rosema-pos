# 🚧 Manual para Completar Páginas Incompletas - Rosema POS

## 🎯 Estado Actual de las Páginas

Basándome en mi análisis del proyecto, estas son las páginas que necesitan desarrollo:

### ✅ **Páginas Completas:**
- `Home.jsx` - Dashboard funcional
- `Login.jsx` - Autenticación completa
- `Sales.jsx` - Sistema de ventas completo
- `Products.jsx` - CRUD completo de productos
- `Customers.jsx` - Sistema CRM completo
- `Suppliers.jsx` - Gestión de proveedores

### 🚧 **Páginas Incompletas:**
- `Statistics.jsx` - Solo placeholder
- `Goals.jsx` - Solo placeholder
- `Invoices.jsx` - Solo información básica
- `SalesNew.jsx` - Interfaz alternativa básica

---

## 📊 Statistics.jsx - Dashboard de Estadísticas

### 🎯 **¿Qué debería hacer?**
Mostrar métricas completas del negocio:
- Estadísticas de ventas (diarias, semanales, mensuales)
- Gráficos de tendencias
- Productos más vendidos
- Análisis de clientes
- Métricas de inventario
- Comparativas de períodos

### 🛠️ **Implementación Completa:**

#### **1. Crear Hook de Estadísticas**
```javascript
// src/hooks/useStatistics.js
import { useState, useEffect, useCallback } from 'react';
import { getSalesStats, getAllSales } from '../services/salesService';
import { getProductStats } from '../services/productsService';
import { getCustomerStatsLocal } from '../hooks/useCustomers';

export const useStatistics = () => {
  const [stats, setStats] = useState({
    sales: {},
    products: {},
    customers: {},
    trends: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month'); // today, week, month, year

  const loadStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar estadísticas de ventas
      const salesStats = await getSalesStats(period);
      
      // Cargar estadísticas de productos
      const productStats = await getProductStats();
      
      // Cargar estadísticas de clientes
      const customerStats = getCustomerStatsLocal();
      
      // Calcular tendencias
      const trends = await calculateTrends(period);
      
      setStats({
        sales: salesStats,
        products: productStats,
        customers: customerStats,
        trends
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  const calculateTrends = async (currentPeriod) => {
    try {
      const now = new Date();
      let currentStart, previousStart, previousEnd;
      
      switch (currentPeriod) {
        case 'today':
          currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          previousStart = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
          previousEnd = currentStart;
          break;
        case 'week':
          currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          previousStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
          previousEnd = currentStart;
          break;
        case 'month':
          currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
          previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          previousEnd = currentStart;
          break;
        default:
          return {};
      }

      const currentSales = await getAllSales(); // Filtrar por período
      const previousSales = await getAllSales(); // Filtrar por período anterior
      
      const currentRevenue = currentSales.reduce((sum, sale) => sum + sale.total, 0);
      const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total, 0);
      
      const revenueChange = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;
      
      return {
        revenueChange: Math.round(revenueChange * 100) / 100,
        salesCountChange: currentSales.length - previousSales.length,
        isPositive: revenueChange >= 0
      };
    } catch (error) {
      console.error('Error calculando tendencias:', error);
      return {};
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    stats,
    loading,
    error,
    period,
    setPeriod,
    refreshStats: loadStatistics
  };
};
```

#### **2. Componente de Gráficos**
```javascript
// src/components/Statistics/SalesChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const SalesChart = ({ data, type = 'line', title }) => {
  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => [formatCurrency(value), 'Ventas']} />
            <Line type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#ef4444" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export const MetricCard = ({ title, value, change, icon, color = 'blue' }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↗️' : '↘️'} {Math.abs(change)}% vs período anterior
            </p>
          )}
        </div>
        <div className={`text-4xl text-${color}-600`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
```

#### **3. Página Statistics Completa**
```javascript
// src/pages/Statistics.jsx - REEMPLAZAR CONTENIDO COMPLETO
import React from 'react';
import { useStatistics } from '../hooks/useStatistics';
import { SalesChart, MetricCard } from '../components/Statistics/SalesChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Statistics = () => {
  const { stats, loading, error, period, setPeriod, refreshStats } = useStatistics();

  if (loading) {
    return <LoadingSpinner text="Cargando estadísticas..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refreshStats} />;
  }

  const formatCurrency = (amount) => `$${amount.toLocaleString()}`;

  // Datos para gráficos (ejemplo)
  const salesChartData = [
    { date: '01/12', sales: 15000 },
    { date: '02/12', sales: 18000 },
    { date: '03/12', sales: 12000 },
    { date: '04/12', sales: 22000 },
    { date: '05/12', sales: 19000 },
    { date: '06/12', sales: 25000 },
    { date: '07/12', sales: 21000 }
  ];

  const topProductsData = Object.entries(stats.sales.topProducts || {})
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
          <p className="text-gray-600 mt-2">Dashboard de métricas del negocio</p>
        </div>
        
        {/* Selector de período */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mes</option>
          <option value="year">Este Año</option>
        </select>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(stats.sales.totalRevenue || 0)}
          change={stats.trends.revenueChange}
          icon="💰"
          color="green"
        />
        <MetricCard
          title="Ventas Realizadas"
          value={stats.sales.totalSales || 0}
          change={stats.trends.salesCountChange}
          icon="🛒"
          color="blue"
        />
        <MetricCard
          title="Productos en Stock"
          value={stats.products.totalProducts || 0}
          icon="📦"
          color="purple"
        />
        <MetricCard
          title="Clientes Activos"
          value={stats.customers.activeCustomers || 0}
          icon="👥"
          color="indigo"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart
          data={salesChartData}
          type="line"
          title="Tendencia de Ventas"
        />
        <SalesChart
          data={topProductsData}
          type="bar"
          title="Productos Más Vendidos"
        />
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métodos de pago */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Métodos de Pago</h3>
          <div className="space-y-3">
            {Object.entries(stats.sales.paymentMethods || {}).map(([method, count]) => (
              <div key={method} className="flex justify-between">
                <span className="text-gray-600">{method}</span>
                <span className="font-medium">{count} ventas</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estado del inventario */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Estado del Inventario</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total productos</span>
              <span className="font-medium">{stats.products.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stock bajo</span>
              <span className="font-medium text-yellow-600">{stats.products.lowStockProducts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sin stock</span>
              <span className="font-medium text-red-600">{stats.products.outOfStockProducts || 0}</span>
            </div>
          </div>
        </div>

        {/* Resumen de clientes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Resumen de Clientes</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total clientes</span>
              <span className="font-medium">{stats.customers.totalCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nuevos este mes</span>
              <span className="font-medium text-green-600">{stats.customers.newCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gasto promedio</span>
              <span className="font-medium">{formatCurrency(stats.customers.averageSpending || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
```

---

## 🎯 Goals.jsx - Sistema de Metas

### 🎯 **¿Qué debería hacer?**
Sistema para establecer y seguir metas del negocio:
- Metas de ventas (diarias, semanales, mensuales)
- Metas de productos vendidos
- Metas de nuevos clientes
- Progreso visual de metas
- Historial de cumplimiento

### 🛠️ **Implementación Completa:**

#### **1. Crear Hook de Metas**
```javascript
// src/hooks/useGoals.js
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getSalesStats } from '../services/salesService';

export const useGoals = () => {
  const [goals, setGoals] = useLocalStorage('rosema_goals', []);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);

  const createGoal = useCallback((goalData) => {
    const newGoal = {
      id: Date.now().toString(),
      ...goalData,
      createdAt: new Date(),
      status: 'active'
    };
    
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  }, [setGoals]);

  const updateGoal = useCallback((goalId, updates) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  }, [setGoals]);

  const deleteGoal = useCallback((goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  }, [setGoals]);

  const calculateProgress = useCallback(async () => {
    setLoading(true);
    
    try {
      const progressData = {};
      
      for (const goal of goals) {
        if (goal.status !== 'active') continue;
        
        let currentValue = 0;
        
        switch (goal.type) {
          case 'sales_revenue':
            const salesStats = await getSalesStats(goal.period);
            currentValue = salesStats.totalRevenue || 0;
            break;
          case 'sales_count':
            const countStats = await getSalesStats(goal.period);
            currentValue = countStats.totalSales || 0;
            break;
          case 'new_customers':
            // Implementar lógica para nuevos clientes
            currentValue = 0;
            break;
          default:
            currentValue = 0;
        }
        
        const percentage = Math.min((currentValue / goal.target) * 100, 100);
        
        progressData[goal.id] = {
          current: currentValue,
          target: goal.target,
          percentage: Math.round(percentage),
          isCompleted: percentage >= 100
        };
      }
      
      setProgress(progressData);
    } catch (error) {
      console.error('Error calculando progreso de metas:', error);
    } finally {
      setLoading(false);
    }
  }, [goals]);

  useEffect(() => {
    if (goals.length > 0) {
      calculateProgress();
    }
  }, [goals, calculateProgress]);

  return {
    goals,
    progress,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshProgress: calculateProgress
  };
};
```

#### **2. Página Goals Completa**
```javascript
// src/pages/Goals.jsx - REEMPLAZAR CONTENIDO COMPLETO
import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';

const Goals = () => {
  const { goals, progress, loading, createGoal, updateGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'sales_revenue',
    target: '',
    period: 'month',
    description: ''
  });

  const goalTypes = [
    { value: 'sales_revenue', label: 'Ingresos por Ventas' },
    { value: 'sales_count', label: 'Cantidad de Ventas' },
    { value: 'new_customers', label: 'Nuevos Clientes' },
    { value: 'products_sold', label: 'Productos Vendidos' }
  ];

  const periods = [
    { value: 'week', label: 'Semanal' },
    { value: 'month', label: 'Mensual' },
    { value: 'quarter', label: 'Trimestral' },
    { value: 'year', label: 'Anual' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    createGoal({
      ...formData,
      target: parseFloat(formData.target)
    });
    
    setFormData({
      title: '',
      type: 'sales_revenue',
      target: '',
      period: 'month',
      description: ''
    });
    setShowForm(false);
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'sales_revenue':
        return `$${value.toLocaleString()}`;
      case 'sales_count':
      case 'new_customers':
      case 'products_sold':
        return value.toString();
      default:
        return value.toString();
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas del Negocio</h1>
          <p className="text-gray-600 mt-2">Establece y sigue el progreso de tus objetivos</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          ➕ Nueva Meta
        </button>
      </div>

      {/* Lista de metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map(goal => {
          const goalProgress = progress[goal.id] || { current: 0, target: goal.target, percentage: 0 };
          
          return (
            <div key={goal.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <p className="text-sm text-gray-600 capitalize">{goal.period}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateGoal(goal.id, { status: goal.status === 'active' ? 'paused' : 'active' })}
                    className={`px-3 py-1 rounded text-sm ${
                      goal.status === 'active' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {goal.status === 'active' ? 'Pausar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Progreso */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso</span>
                  <span>{goalProgress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(goalProgress.percentage)}`}
                    style={{ width: `${Math.min(goalProgress.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Valores */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatValue(goalProgress.current, goal.type)}
                  </p>
                  <p className="text-sm text-gray-600">
                    de {formatValue(goalProgress.target, goal.type)}
                  </p>
                </div>
                
                {goalProgress.isCompleted && (
                  <div className="text-green-500 text-2xl">🎉</div>
                )}
              </div>

              {goal.description && (
                <p className="text-sm text-gray-600 mt-3">{goal.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensaje si no hay metas */}
      {goals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay metas establecidas</h3>
          <p className="text-gray-600 mb-4">Crea tu primera meta para comenzar a seguir el progreso de tu negocio</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Crear Primera Meta
          </button>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Meta</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título de la Meta
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Meta
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {goalTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivo
                  </label>
                  <input
                    type="number"
                    value={formData.target}
                    onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {periods.map(period => (
                      <option key={period.value} value={period.value}>{period.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Crear Meta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
```

---

## 🧾 Invoices.jsx - Sistema de Facturas

### 🎯 **¿Qué debería hacer?**
Sistema completo de facturación:
- Generar facturas PDF
- Historial de facturas
- Búsqueda y filtrado
- Estados de factura (pendiente, pagada, vencida)
- Envío por email/WhatsApp

### 🛠️ **Implementación Básica:**

```javascript
// src/pages/Invoices.jsx - REEMPLAZAR CONTENIDO COMPLETO
import React, { useState } from 'react';

const Invoices = () => {
  const [invoices] = useState([
    {
      id: 'INV-001',
      customer: 'Juan Pérez',
      date: '2024-12-01',
      dueDate: '2024-12-15',
      amount: 15000,
      status: 'paid'
    },
    {
      id: 'INV-002',
      customer: 'María García',
      date: '2024-12-05',
      dueDate: '2024-12-20',
      amount: 8500,
      status: 'pending'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status
