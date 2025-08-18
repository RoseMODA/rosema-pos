import React from 'react';

/**
 * Página de Clientes del sistema POS Rosema
 * Sistema CRM básico para gestión de clientes (Etapa 5)
 */
const Customers = () => {
  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">👥 Clientes</h1>
        <p className="text-gray-600 mt-2">Sistema CRM y base de clientes</p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button className="btn-rosema">
          <span className="mr-2">➕</span>
          Registrar Cliente
        </button>
        <button className="btn-secondary">
          <span className="mr-2">🔍</span>
          Buscar Cliente
        </button>
        <button className="btn-secondary">
          <span className="mr-2">⭐</span>
          Top Clientes
        </button>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funcionalidades CRUD */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Gestión de Clientes (Etapa 5)
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Ver lista completa de clientes
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Registrar nuevos clientes
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Editar información de clientes
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Eliminar clientes
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Top clientes más frecuentes
            </div>
          </div>
        </div>

        {/* Perfil de cliente */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Perfil de Cliente
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <span className="text-blue-500 mr-2">📊</span>
              Cantidad de compras realizadas
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-blue-500 mr-2">📏</span>
              Tallas más compradas
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-blue-500 mr-2">❤️</span>
              Categorías favoritas
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-blue-500 mr-2">🛍️</span>
              Historial de compras completo
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">0</div>
          <div className="text-gray-600">Total Clientes</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
          <div className="text-gray-600">Clientes Activos</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">0</div>
          <div className="text-gray-600">Nuevos Este Mes</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">$0</div>
          <div className="text-gray-600">Promedio Compra</div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Base de Clientes
        </h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-gray-600">
            La base de clientes se mostrará aquí una vez implementada
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Incluirá búsqueda, filtros y perfiles detallados
          </p>
        </div>
      </div>

      {/* Top clientes */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Top Clientes Más Frecuentes
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                  <span className="text-gray-600 font-medium">#{index}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Cliente {index}</div>
                  <div className="text-sm text-gray-500">Datos del cliente aparecerán aquí</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">0 compras</div>
                <div className="text-sm text-gray-500">$0 total</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Customers;
