import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import { getSalesHistory } from '../services/salesService';
import { Link } from 'react-router-dom';
import FirestoreDebug from '../components/FirestoreDebug';

const Home = () => {
  const { user } = useAuth();
  const { customers, loadCustomers } = useCustomers();
  const { products } = useProducts();

  const [todayStats, setTodayStats] = useState({ total: 0, count: 0 });
  const [monthStats, setMonthStats] = useState({ total: 0, count: 0 });

  // 👉 Obtener la fecha actual formateada
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 👉 Cargar clientes al montar
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // 👉 Cargar ventas de HOY
  useEffect(() => {
    const loadTodaySales = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      try {
        const sales = await getSalesHistory({
          startDate: startOfDay,
          endDate: endOfDay
        });

        let total = 0;
        sales.forEach(sale => {
          total += sale.total || 0;
        });

        setTodayStats({ total, count: sales.length });
      } catch (err) {
        console.error('❌ Error cargando ventas de hoy:', err);
        setTodayStats({ total: 0, count: 0 });
      }
    };

    loadTodaySales();
  }, []);

  // 👉 Cargar ventas del MES
  useEffect(() => {
    const loadMonthSales = async () => {
      // Primer día del mes
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Último día hasta ahora (mañana)
      const endOfMonth = new Date();
      endOfMonth.setDate(endOfMonth.getDate() + 1);
      endOfMonth.setHours(0, 0, 0, 0);

      try {
        const sales = await getSalesHistory({
          startDate: startOfMonth,
          endDate: endOfMonth
        });

        let total = 0;
        sales.forEach(sale => {
          total += sale.total || 0;
        });

        setMonthStats({ total, count: sales.length });
      } catch (err) {
        console.error('❌ Error cargando ventas del mes:', err);
        setMonthStats({ total: 0, count: 0 });
      }
    };

    loadMonthSales();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🏠 Dashboard Principal</h1>
        <p className="text-gray-600 mt-2 font-bold">{getCurrentDate()}</p>
        <p className="text-sm text-gray-500">Bienvenido, {user?.email}</p>
      </div>


      {/* Mensaje de bienvenida */}
      <div className="card-rosema mt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido al Sistema POS de Rosema!
          </h2>

        </div>
      </div>

      {/* Botones de acción rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Link to="/sales" className="btn-rosema text-center p-6 h-auto block hover:no-underline">
          <div className="flex items-center justify-center">
            <span className="text-3xl mr-4">💰</span>
            <div>
              <div className="text-xl font-bold">Realizar Venta</div>
              <div className="text-sm opacity-90">Iniciar nueva transacción</div>
            </div>
          </div>
        </Link>
        <Link to="/products" className="btn-secondary text-center p-6 h-auto block hover:no-underline">
          <div className="flex items-center justify-center">
            <span className="text-3xl mr-4">👕</span>
            <div>
              <div className="text-xl font-bold">Agregar Producto</div>
              <div className="text-sm opacity-75">Gestionar inventario</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Ventas Hoy */}
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            ${todayStats.total.toLocaleString('es-AR')}
          </div>
          <div className="text-gray-600">Ventas Hoy</div>
          <div className="text-xs text-gray-500 mt-1">
            {todayStats.count} transacciones
          </div>
        </div>

        {/* Ventas Mes */}
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ${monthStats.total.toLocaleString('es-AR')}
          </div>
          <div className="text-gray-600">Ventas Mes</div>
          <div className="text-xs text-gray-500 mt-1">
            {monthStats.count} transacciones
          </div>
        </div>

        {/* Productos */}
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {products.length}
          </div>
          <div className="text-gray-600">Productos</div>
          <div className="text-xs text-gray-500 mt-1">En inventario</div>
        </div>

        {/* Clientes */}
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {customers.length}
          </div>
          <div className="text-gray-600">Clientes</div>
          <div className="text-xs text-gray-500 mt-1">Registrados</div>
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">


        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Información de la Tienda
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-red-600 mr-3">🏪</span>
              <div>
                <div className="font-medium text-gray-900">Rosema</div>
                <div className="text-sm text-gray-500">Tienda de Ropa</div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-blue-600 mr-3">📍</span>
              <div>
                <div className="font-medium text-gray-900">Salto de las Rosas</div>
                <div className="text-sm text-gray-500">Ubicación</div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-3">📱</span>
              <div>
                <div className="font-medium text-gray-900">260 438-1502</div>
                <div className="text-sm text-gray-500">WhatsApp</div>
              </div>
            </div>
          </div>
        </div>
        {/* Accesos rápidos */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Acceso Rápido a Secciones
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/statistics" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900">Estadísticas</div>
            </Link>
            <Link to="/customers" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium text-gray-900">Clientes</div>
            </Link>
            <Link to="/suppliers" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors">
              <div className="text-2xl mb-2">🏪</div>
              <div className="text-sm font-medium text-gray-900">Proveedores</div>
            </Link>
            <Link to="/goals" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium text-gray-900">Metas</div>
            </Link>
            <Link to="/invoices" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors">
              <div className="text-2xl mb-2">📄</div>
              <div className="text-sm font-medium text-gray-900">Facturas ARCA</div>
            </Link>
          </div>
        </div>


      </div>






    </div>
  );
};

export default Home;
