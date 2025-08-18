import React from 'react';

/**
 * Página de Metas del sistema POS Rosema
 * Sistema de análisis financiero y establecimiento de objetivos (Etapa 7)
 */
const Goals = () => {
  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🎯 Metas</h1>
        <p className="text-gray-600 mt-2">Objetivos comerciales y control de gastos</p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button className="btn-rosema">
          <span className="mr-2">🎯</span>
          Configurar Meta
        </button>
        <button className="btn-secondary">
          <span className="mr-2">💰</span>
          Registrar Gasto
        </button>
        <button className="btn-secondary">
          <span className="mr-2">📊</span>
          Ver Análisis
        </button>
      </div>

      {/* Metas actuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card-rosema text-center">
          <div className="text-lg font-semibold text-gray-900 mb-2">Meta Diaria</div>
          <div className="text-3xl font-bold text-red-600 mb-2">$0</div>
          <div className="text-sm text-gray-500">Objetivo configurado</div>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">0% completado</div>
        </div>

        <div className="card-rosema text-center">
          <div className="text-lg font-semibold text-gray-900 mb-2">Meta Semanal</div>
          <div className="text-3xl font-bold text-blue-600 mb-2">$0</div>
          <div className="text-sm text-gray-500">Objetivo configurado</div>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">0% completado</div>
        </div>

        <div className="card-rosema text-center">
          <div className="text-lg font-semibold text-gray-900 mb-2">Meta Mensual</div>
          <div className="text-3xl font-bold text-green-600 mb-2">$0</div>
          <div className="text-sm text-gray-500">Objetivo configurado</div>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">0% completado</div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos fijos */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Gastos Fijos Mensuales (Etapa 7)
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">🏠</span>
                <span className="text-gray-700">Alquiler</span>
              </div>
              <span className="font-medium text-gray-900">$0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2">💡</span>
                <span className="text-gray-700">Servicios (luz, agua, etc.)</span>
              </div>
              <span className="font-medium text-gray-900">$0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-blue-500 mr-2">👥</span>
                <span className="text-gray-700">Empleados</span>
              </div>
              <span className="font-medium text-gray-900">$0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-purple-500 mr-2">📱</span>
                <span className="text-gray-700">Membresías</span>
              </div>
              <span className="font-medium text-gray-900">$0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">📋</span>
                <span className="text-gray-700">Otros gastos operativos</span>
              </div>
              <span className="font-medium text-gray-900">$0</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total Gastos Fijos:</span>
              <span className="font-bold text-red-600 text-lg">$0</span>
            </div>
          </div>
        </div>

        {/* Análisis financiero */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Análisis Financiero
          </h2>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-800 font-medium">Ganancias Reales</span>
                <span className="text-green-600 font-bold">$0</span>
              </div>
              <div className="text-sm text-green-700">
                Ventas - Costos - Gastos Fijos
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 font-medium">Excedente Disponible</span>
                <span className="text-blue-600 font-bold">$0</span>
              </div>
              <div className="text-sm text-blue-700">
                Para nuevas inversiones
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-800 font-medium">Meta Excedente</span>
                <span className="text-yellow-600 font-bold">$2.000.000</span>
              </div>
              <div className="text-sm text-yellow-700">
                Mínimo recomendado (configurable)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de inversión */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Indicador de Inversión
        </h2>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-2">
            <strong>Excedente insuficiente para nuevas compras</strong>
          </p>
          <p className="text-sm text-gray-500">
            Se requiere un excedente mínimo de $2.000.000 antes de realizar nuevas inversiones
          </p>
          <div className="mt-4 bg-red-100 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">
              🚫 <strong>Recomendación:</strong> Enfocarse en ventas antes de comprar más inventario
            </p>
          </div>
        </div>
      </div>

      {/* Configuración de metas */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Configuración de Metas
        </h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-gray-600">
            La configuración de metas se implementará en la Etapa 7
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Incluirá formularios para establecer objetivos y registrar gastos
          </p>
        </div>
      </div>
    </div>
  );
};

export default Goals;
