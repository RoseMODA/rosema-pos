/**
 * Componente de tabla de productos - Completamente Responsivo
 */

import React from 'react';
import { formatPrice, formatDateTime } from '../../utils/formatters.js';
import { calculateTotalStock, calculateAveragePrice } from '../../utils/calculations.js';
import { getStockStatus } from '../../utils/productHelpers.js';

const ProductsTable = ({
  products,
  providers,
  onView,
  onEdit,
  onDelete,
  onPrintBarcode
}) => {
  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.proveedor : 'Proveedor no encontrado';
  };

  return (
    <>
      {/* Vista de tabla para desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Costo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Venta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const totalStock = calculateTotalStock(product);
              const averagePrice = calculateAveragePrice(product);
              const stockStatus = getStockStatus(product);
              const dateTime = formatDateTime(product.createdAt);

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.articulo || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Código: {product.id}
                      </div>
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                          {product.tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{product.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.categoria || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getProviderName(product.proveedorId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(product.precioCosto || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(averagePrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bgColor} ${stockStatus.textColor}`}>
                      {totalStock} unidades
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.createdAt ? (
                      <div>
                        <div className="font-medium">
                          {dateTime.date}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dateTime.time}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin fecha</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onView(product)}
                        className="text-green-600 hover:text-green-900 transition-colors px-2 py-1 text-sm touch-target"
                        title="Ver detalles"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className="text-blue-600 hover:text-blue-900 transition-colors px-2 py-1 text-sm touch-target"
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onPrintBarcode(product)}
                        className="text-purple-600 hover:text-purple-900 transition-colors px-2 py-1 text-sm touch-target"
                        title="Imprimir código"
                      >
                        Imprimir
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-red-600 hover:text-red-900 transition-colors px-2 py-1 text-sm touch-target"
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista de cards para móvil */}
      <div className="lg:hidden space-y-4">
        {products.map((product) => {
          const totalStock = calculateTotalStock(product);
          const averagePrice = calculateAveragePrice(product);
          const stockStatus = getStockStatus(product);
          const dateTime = formatDateTime(product.createdAt);

          return (
            <div key={product.id} className="card-mobile">
              <div className="card-mobile-header">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {product.articulo || 'Sin nombre'}
                  </h3>
                  <p className="text-sm text-gray-500">Código: {product.id}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bgColor} ${stockStatus.textColor}`}>
                  {totalStock} unidades
                </span>
              </div>

              <div className="card-mobile-content">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Categoría:</span>
                    <p className="font-medium">{product.categoria || 'Sin categoría'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Proveedor:</span>
                    <p className="font-medium">{getProviderName(product.proveedorId)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Precio Costo:</span>
                    <p className="font-medium">{formatPrice(product.precioCosto || 0)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Precio Venta:</span>
                    <p className="font-medium">{formatPrice(averagePrice)}</p>
                  </div>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{product.tags.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {product.createdAt && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Creado:</span>
                    <p className="text-sm">{dateTime.date} - {dateTime.time}</p>
                  </div>
                )}
              </div>

              <div className="card-mobile-actions">
                <button
                  onClick={() => onView(product)}
                  className="flex-1 btn-secondary text-sm touch-target"
                >
                  Ver
                </button>
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm touch-target"
                >
                  Editar
                </button>
                <button
                  onClick={() => onPrintBarcode(product)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm touch-target"
                >
                  Código
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm touch-target"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductsTable;
