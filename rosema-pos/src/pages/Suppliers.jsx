import React from 'react';

/**
 * Página de Proveedores del sistema POS Rosema
 * Sistema completo de gestión de proveedores (Etapa 6)
 */
const Suppliers = () => {
  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🏪 Proveedores</h1>
        <p className="text-gray-600 mt-2">Gestión completa de proveedores</p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button className="btn-rosema">
          <span className="mr-2">➕</span>
          Agregar Proveedor
        </button>
        <button className="btn-secondary">
          <span className="mr-2">🔍</span>
          Buscar por Área
        </button>
        <button className="btn-secondary">
          <span className="mr-2">🏷️</span>
          Filtrar por Tags
        </button>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campos de proveedor */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Información del Proveedor (Etapa 6)
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Nombre del proveedor
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              WhatsApp de contacto
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Sitio web (opcional)
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Área/zona de la ciudad
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Dirección completa
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Galería y número de local
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Tags descriptivos
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Redes sociales (Instagram, TikTok)
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Datos Comerciales
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <span className="text-blue-500 mr-2">📄</span>
              CUIL (opcional)
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-blue-500 mr-2">⭐</span>
              Ranking de calidad de prendas
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-blue-500 mr-2">📝</span>
              Notas adicionales
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-blue-500 mr-2">📊</span>
              Productos comprados del proveedor
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-blue-500 mr-2">💰</span>
              Productos vendidos del proveedor
            </div>
          </div>
        </div>
      </div>

      {/* Tags comunes */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Tags Descriptivos Comunes
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            'jeans', 'mujer', 'hombre', 'niños', 'talles especiales', 
            'fiesta', 'casual', 'deportivo', 'invierno', 'verano',
            'sastrero', 'mayorista', 'minorista', 'importado', 'nacional'
          ].map((tag) => (
            <span 
              key={tag}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Estadísticas de proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">0</div>
          <div className="text-gray-600">Total Proveedores</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
          <div className="text-gray-600">Proveedores Activos</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">$0</div>
          <div className="text-gray-600">Compras Totales</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
          <div className="text-gray-600">Áreas Cubiertas</div>
        </div>
      </div>

      {/* Lista de proveedores */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Directorio de Proveedores
        </h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🏪</div>
          <p className="text-gray-600">
            El directorio de proveedores se mostrará aquí una vez implementado
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Incluirá fichas detalladas, filtros por área y tags
          </p>
        </div>
      </div>

      {/* Filtros de búsqueda */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Filtros de Búsqueda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">📍</div>
            <div className="font-medium text-gray-900">Por Área</div>
            <div className="text-sm text-gray-600">Zona geográfica</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">🏷️</div>
            <div className="font-medium text-gray-900">Por Tags</div>
            <div className="text-sm text-gray-600">Tipo de productos</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium text-gray-900">Por Nombre</div>
            <div className="text-sm text-gray-600">Búsqueda directa</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
