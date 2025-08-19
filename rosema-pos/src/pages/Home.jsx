import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

/**
 * Componente de página principal (Dashboard) del sistema POS Rosema
 * Dashboard principal con resumen de estadísticas y acciones rápidas
 */
const Home = () => {
  const { user } = useAuth();

  /**
   * Obtiene la fecha actual formateada en español
   */
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      {/* Header del dashboard */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🏠 Dashboard Principal</h1>
        <p className="text-gray-600 mt-2">{getCurrentDate()}</p>
        <p className="text-sm text-gray-500">Bienvenido, {user?.email}</p>
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
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">$0</div>
          <div className="text-gray-600">Ventas Hoy</div>
          <div className="text-xs text-gray-500 mt-1">0 transacciones</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">$0</div>
          <div className="text-gray-600">Ventas Mes</div>
          <div className="text-xs text-gray-500 mt-1">0 transacciones</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">0</div>
          <div className="text-gray-600">Productos</div>
          <div className="text-xs text-gray-500 mt-1">En inventario</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
          <div className="text-gray-600">Clientes</div>
          <div className="text-xs text-gray-500 mt-1">Registrados</div>
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Estado del Sistema
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">✅ Etapa 1: Configuración Base</span>
              <span className="text-green-600 font-medium">Completada</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">🔄 Etapa 2: Dashboard y Navegación</span>
              <span className="text-blue-600 font-medium">En Progreso</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">⏳ Etapa 3: Sistema de Ventas</span>
              <span className="text-gray-500 font-medium">Pendiente</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">⏳ Etapa 4: Gestión de Productos</span>
              <span className="text-gray-500 font-medium">Pendiente</span>
            </div>
          </div>
        </div>

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
      </div>

      {/* Accesos rápidos a secciones */}
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
        </div>
      </div>

      {/* Mensaje de bienvenida */}
      <div className="card-rosema mt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido al Sistema POS de Rosema!
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              🎉 Etapa 2 Implementada: Dashboard y Navegación
            </p>
            <p className="text-green-600 text-sm mt-1">
              Sistema con menú lateral funcional y páginas organizadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
