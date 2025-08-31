/**
 * Modal para mostrar detalles completos del producto
 */

import React from 'react';
import Modal from '../common/Modal.jsx';
import { formatPrice, formatDateTime } from '../../utils/formatters.js';
import { calculateTotalStock, calculateAveragePrice } from '../../utils/calculations.js';
import { getStockStatus } from '../../utils/productHelpers.js';

const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  providers,
  onEdit,
  onPrintBarcode
}) => {
  if (!product) return null;

  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.proveedor : 'Proveedor no encontrado';
  };

  const totalStock = calculateTotalStock(product);
  const averagePrice = calculateAveragePrice(product);
  const stockStatus = getStockStatus(product);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Producto"
      size="lg"
    >
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Código de Barras</label>
            <p className="text-gray-900 font-mono text-lg">{product.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nombre del Artículo</label>
            <p className="text-gray-900 text-lg">{product.articulo}</p>
          </div>
        </div>

        {product.descripcion && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Descripción</label>
            <p className="text-gray-900">{product.descripcion}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Categoría</label>
            <p className="text-gray-900">{product.categoria}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Temporada</label>
            <p className="text-gray-900">{product.temporada || 'No especificada'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Proveedor</label>
            <p className="text-gray-900">{getProviderName(product.proveedorId)}</p>
          </div>
        </div>

        {/* Subcategorías */}
        {product.subcategorias && product.subcategorias.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Subcategorías</label>
            <div className="flex flex-wrap gap-2">
              {product.subcategorias.map(sub => (
                <span key={sub} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {sub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Imágenes del producto */}
        {product.imagenes && product.imagenes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-3">Imágenes del Producto</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.imagenes.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`${product.articulo} - Imagen ${index + 1}`}
                    className="w-full object-contain rounded-lg border border-gray-200 max-h-64 cursor-pointer"
                    onClick={() => window.open(url, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                      Ver imagen
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Precios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Precio de Costo</label>
            <p className="text-gray-900 text-lg font-semibold">{formatPrice(product.precioCosto || product.precio_costo || 0)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Precio de Venta Promedio</label>
            <p className="text-green-600 text-lg font-semibold">{formatPrice(averagePrice)}</p>
          </div>
        </div>

        {/* Stock total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Stock Total</label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 text-lg font-semibold">{totalStock} unidades</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bgColor} ${stockStatus.textColor}`}>
                {stockStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Variantes */}
        {product.variantes && product.variantes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-3">Variantes</label>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Talla</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Color</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Stock</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Precio Venta</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variantes.map((variante, index) => {
                    const variantStockStatus = getStockStatus({ variantes: [variante] });
                    return (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-2">{variante.talle || 'N/A'}</td>
                        <td className="px-4 py-2">{variante.color || 'N/A'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${variantStockStatus.bgColor} ${variantStockStatus.textColor}`}>
                            {variante.stock || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2">{formatPrice(variante.precioVenta || 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fechas */}
        {product.createdAt && (
          <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p>Creado: {formatDateTime(product.createdAt).date} a las {formatDateTime(product.createdAt).time}</p>
            {product.updatedAt && (
              <p>Última actualización: {formatDateTime(product.updatedAt).date} a las {formatDateTime(product.updatedAt).time}</p>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={() => onPrintBarcode(product)}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>📄</span>
            <span>Imprimir Código</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="btn-rosema flex items-center space-x-2"
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailsModal;
