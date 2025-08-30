import React from 'react';

/**
 * Página de Estadísticas del sistema POS Rosema
 * Muestra reportes y análisis de ventas (Etapa 7)
 */
const Statistics = () => {
  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📊 Estadísticas</h1>
        <p className="text-gray-600 mt-2">Reportes y análisis de ventas</p>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de información */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Próximamente en Etapa 7
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Gráficos con Chart.js o Recharts
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Ventas diarias, semanales y mensuales
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Total en $ de activos
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Total en $ invertido en productos
            </div>
          </div>
        </div>

        {/* Card de vista previa */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Vista Previa
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-gray-600">
              Aquí se mostrarán gráficos interactivos con las estadísticas de ventas
            </p>
          </div>
        </div>
      </div>

      {/* Cards de estadísticas mock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">$0</div>
          <div className="text-gray-600">Ventas Hoy</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">$0</div>
          <div className="text-gray-600">Ventas Mes</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">0</div>
          <div className="text-gray-600">Productos Vendidos</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
