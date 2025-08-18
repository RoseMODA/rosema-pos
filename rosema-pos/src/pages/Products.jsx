import React from 'react';

/**
 * Página de Productos del sistema POS Rosema
 * Sistema CRUD completo para gestión de inventario (Etapa 4)
 */
const Products = () => {
  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">👕 Productos</h1>
        <p className="text-gray-600 mt-2">Gestión de inventario y catálogo</p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button className="btn-rosema">
          <span className="mr-2">➕</span>
          Agregar Producto
        </button>
        <button className="btn-secondary">
          <span className="mr-2">🏷️</span>
          Imprimir Códigos
        </button>
        <button className="btn-secondary">
          <span className="mr-2">📊</span>
          Estadísticas
        </button>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campos de producto */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Campos de Producto (Etapa 4)
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Nombre del producto
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Precio de compra y venta
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              % ganancia editable
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Categorías: mujer, hombre, niños, otros
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Tags: invierno, fiesta, jeans, etc.
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Stock con tallas y colores
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Múltiples fotos con previsualización
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-green-500 mr-2">✅</span>
              Proveedor asociado
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Categorías de Productos
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-pink-50 border border-pink-200 p-3 rounded-lg text-center">
              <div className="text-2xl mb-2">👩</div>
              <div className="text-sm font-medium text-pink-800">Mujer</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
              <div className="text-2xl mb-2">👨</div>
              <div className="text-sm font-medium text-blue-800">Hombre</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-center">
              <div className="text-2xl mb-2">👶</div>
              <div className="text-sm font-medium text-yellow-800">Niños</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center">
              <div className="text-2xl mb-2">👔</div>
              <div className="text-sm font-medium text-gray-800">Otros</div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de productos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">0</div>
          <div className="text-gray-600">Total Productos</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">$0</div>
          <div className="text-gray-600">Valor Inventario</div>
        </div>
        <div className="card-rosema text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">0</div>
          <div className="text-gray-600">Productos Activos</div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Catálogo de Productos
        </h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-gray-600">
            El catálogo de productos se mostrará aquí una vez implementado
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Incluirá búsqueda, filtros y gestión completa CRUD
          </p>
        </div>
      </div>

      {/* Funcionalidades adicionales */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Funcionalidades Adicionales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📊 Top Productos</h3>
            <p className="text-sm text-gray-600">Productos más vendidos con estadísticas</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📏 Tallas Populares</h3>
            <p className="text-sm text-gray-600">Tallas más vendidas por categoría</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
