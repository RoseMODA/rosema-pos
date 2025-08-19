import React, { useState } from 'react';

/**
 * Modal para seleccionar talla y color al agregar un producto al carrito
 */
const ProductSelectionModal = ({ 
  product, 
  show, 
  onClose, 
  onAddToCart 
}) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  /**
   * Manejar confirmación de selección
   */
  const handleConfirm = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Por favor seleccione una talla');
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Por favor seleccione un color');
      return;
    }

    onAddToCart(product, quantity, selectedSize, selectedColor);
    handleClose();
  };

  /**
   * Cerrar modal y limpiar selecciones
   */
  const handleClose = () => {
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
    onClose();
  };

  if (!show || !product) return null;

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
            <h4 className="font-medium text-gray-900">{product.name}</h4>
            <p className="text-sm text-gray-600">Código: {product.code}</p>
            <p className="text-lg font-semibold text-green-600 mt-1">
              ${product.salePrice?.toLocaleString()}
            </p>
          </div>

          {/* Selección de cantidad */}
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
                onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Stock disponible: {product.stock}
            </p>
          </div>

          {/* Selección de talla */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Talla *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                      selectedSize === size
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de color */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color *
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-red-600 ring-2 ring-red-200'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {selectedColor === color && (
                      <svg className="w-6 h-6 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {selectedColor && (
                <p className="text-sm text-gray-600 mt-2">
                  Color seleccionado: {selectedColor}
                </p>
              )}
            </div>
          )}

          {/* Total */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total:</span>
              <span className="text-xl font-bold text-green-600">
                ${(product.salePrice * quantity).toLocaleString()}
              </span>
            </div>
          </div>
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
            className="flex-1 btn-rosema"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
