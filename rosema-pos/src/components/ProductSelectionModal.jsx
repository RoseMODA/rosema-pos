import React, { useState } from 'react';

/**
 * Modal para seleccionar variante (talla y color) al agregar un producto al carrito
 * Actualizado para trabajar con la estructura de variantes de Firebase
 */
const ProductSelectionModal = ({ 
  product, 
  show, 
  onClose, 
  onAddToCart 
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  /**
   * Manejar confirmación de selección
   */
  const handleConfirm = () => {
    if (!selectedVariant) {
      alert('Por favor seleccione una variante');
      return;
    }

    if (quantity > selectedVariant.stock) {
      alert(`Stock insuficiente. Disponible: ${selectedVariant.stock}`);
      return;
    }

    if (quantity <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    onAddToCart(product, quantity, selectedVariant);
    handleClose();
  };

  /**
   * Cerrar modal y limpiar selecciones
   */
  const handleClose = () => {
    setSelectedVariant(null);
    setQuantity(1);
    onClose();
  };

  if (!show || !product) return null;

  // Filtrar variantes con stock disponible
  const availableVariants = product.variantes?.filter(v => v.stock > 0) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Seleccionar Opciones
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Información del producto */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">{product.articulo || product.name}</h4>
            <p className="text-sm text-gray-600">Código: {product.id}</p>
            {availableVariants.length === 0 && (
              <p className="text-sm text-red-600 mt-1">Sin variantes disponibles</p>
            )}
          </div>

          {/* Lista de variantes disponibles */}
          {availableVariants.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variantes Disponibles *
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableVariants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      selectedVariant === variant
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          Talla: {variant.talla}
                          {variant.color && ` • Color: ${variant.color}`}
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          ${variant.precioVenta?.toLocaleString()}
                        </div>
                      </div>
                      <div className={`text-sm ${variant.stock <= 5 ? 'text-red-600' : 'text-gray-600'}`}>
                        Stock: {variant.stock}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de cantidad */}
          {selectedVariant && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Stock disponible: {selectedVariant.stock}
              </p>
            </div>
          )}

          {/* Total */}
          {selectedVariant && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="text-xl font-bold text-green-600">
                  ${(selectedVariant.precioVenta * quantity).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Mensaje si no hay variantes */}
          {availableVariants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>No hay variantes disponibles</p>
              <p className="text-sm">Todas las variantes están sin stock</p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedVariant || availableVariants.length === 0}
            className="flex-1 btn-rosema disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
