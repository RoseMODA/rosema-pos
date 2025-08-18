import React from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente de página principal (Dashboard) del sistema POS Rosema
 * Muestra la bienvenida y información básica del sistema
 */
const Home = () => {
  const { user, logout } = useAuth();

  /**
   * Maneja el cierre de sesión del usuario
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold">R</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Rosema POS</h1>
                <p className="text-sm text-gray-500">Sistema de Punto de Venta</p>
              </div>
            </div>

            {/* Usuario y logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Bienvenida */}
          <div className="card-rosema mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Bienvenido al Sistema POS de Rosema!
              </h2>
              <p className="text-gray-600 mb-4">
                {getCurrentDate()}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">
                  Sistema configurado correctamente
                </p>
                <p className="text-red-600 text-sm mt-1">
                  Firebase conectado - Autenticación activa
                </p>
              </div>
            </div>
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Card de estado del sistema */}
            <div className="card-rosema">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Estado del Sistema
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Firebase</span>
                  <span className="text-sm text-green-600 font-medium">Conectado</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Autenticación</span>
                  <span className="text-sm text-green-600 font-medium">Activa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Base de Datos</span>
                  <span className="text-sm text-green-600 font-medium">Lista</span>
                </div>
              </div>
            </div>

            {/* Card de información de la tienda */}
            <div className="card-rosema">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Información de la Tienda
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Nombre:</span> Rosema
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Ubicación:</span> Salto de las Rosas
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">WhatsApp:</span> 260 438-1502
                </p>
              </div>
            </div>

            {/* Card de próximas funcionalidades */}
            <div className="card-rosema">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Próximas Funcionalidades
              </h3>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  ✅ Autenticación
                </div>
                <div className="text-sm text-gray-500">
                  🔄 Dashboard y Navegación
                </div>
                <div className="text-sm text-gray-500">
                  ⏳ Sistema de Ventas
                </div>
                <div className="text-sm text-gray-500">
                  ⏳ Gestión de Productos
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción rápida (preparación para etapa 2) */}
          <div className="card-rosema">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                className="btn-rosema text-center py-4"
                disabled
              >
                <div className="text-lg font-medium">Realizar Venta</div>
                <div className="text-sm opacity-75">Próximamente en Etapa 3</div>
              </button>
              <button 
                className="btn-secondary text-center py-4"
                disabled
              >
                <div className="text-lg font-medium">Agregar Producto</div>
                <div className="text-sm opacity-75">Próximamente en Etapa 4</div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>Rosema POS - Etapa 1 Completada</p>
            <p>Sistema de Punto de Venta © 2024</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
