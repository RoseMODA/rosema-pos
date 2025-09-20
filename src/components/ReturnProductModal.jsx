import React, { useState, useEffect } from 'react';
/**
 * Modal para seleccionar variante en cambios de prenda
 * Permite seleccionar variantes con stock 0 (para devoluciones)
 */
const ReturnProductModal = ({
  product,
  show,
  onClose,
  onAddReturn
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [discountApplied, setDiscountApplied] = useState(0);

  /**
   * Manejar confirmación de devolución
   */
  const handleConfirm = () => {
    if (!selectedVariant) {
      alert('Por favor seleccione la variante devuelta');
      return;
    }

    if (discountApplied < 0 || discountApplied > 100) {
      alert('El descuento debe estar entre 0% y 100%');
      return;
    }

    // Calcular el valor real pagado
    const originalPrice = selectedVariant.precioVenta;
    const discountAmount = (originalPrice * discountApplied) / 100;
    const actualPricePaid = originalPrice - discountAmount;

    const returnData = {
      productId: product.id,
      nombre: product.articulo,
      code: product.id,
      price: actualPricePaid, // Precio real pagado (con descuento aplicado)
      originalPrice: originalPrice, // Precio original de lista
      discountApplied: discountApplied,
      quantity: 1,
      variant: {
        talle: selectedVariant.talle,
        color: selectedVariant.color
      },
      isReturn: true
    };

    onAddReturn(returnData);
    handleClose();
  };

  /**
   * Cerrar modal y limpiar selecciones
   */
  const handleClose = () => {
    setSelectedVariant(null);
    setDiscountApplied(0);
    onClose();
  };

  // Detectar tecla Enter
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && selectedVariant) {
        e.preventDefault(); // evita submit de formularios
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, selectedVariant]); // depende de show y variant


  if (!show || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Cambio de Prenda
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
            <h4 className="font-medium text-gray-900">{product.articulo}</h4>
            <p className="text-sm text-gray-600">Código: {product.id}</p>

          </div>

          {/* Lista de todas las variantes (máximo 12 visibles sin scroll) */}
          {product.variantes && product.variantes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Talle Devuelto *
              </label>

              <div className="border rounded-lg">
                <table className="w-full text-sm text-left borders-collapse">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 font-medium">Talle</th>
                      <th className="px-3 py-2 font-medium">Color</th>
                      <th className="px-3 py-2 font-medium">Precio</th>
                      <th className="px-3 py-2 font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variantes.slice(0, 12).map((variant, index) => {
                      const isSelected = selectedVariant === variant
                      return (
                        <tr
                          key={index}
                          onClick={() => setSelectedVariant(variant)}
                          className={`cursor-pointer transition-colors ${isSelected
                            ? 'bg-red-600 text-white'
                            : 'hover:bg-gray-50'
                            }`}
                        >
                          <td className="px-3 py-2">{variant.talle}</td>
                          <td className="px-3 py-2">{variant.color || '-'}</td>
                          <td className="px-3 py-2 font-semibold">
                            ${variant.precioVenta?.toLocaleString()}
                          </td>
                          <td
                            className={`px-3 py-2 ${variant.stock <= 0 ? 'text-red-600' : ''
                              }`}
                          >
                            {variant.stock > 0 ? variant.stock : 'Sin stock'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* Campo de descuento aplicado */}
          {selectedVariant && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descuento Aplicado (opcional)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={discountApplied}
                  onChange={(e) => setDiscountApplied(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                  className="flex-1 input-rosema"
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Si el producto fue vendido con descuento, ingrese el porcentaje aplicado
              </p>
            </div>
          )}

          {/* Cálculo del valor de devolución */}
          {selectedVariant && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-yellow-800 space-y-1">
                <div className="flex justify-between">
                  <span>Precio de lista:</span>
                  <span>${selectedVariant.precioVenta?.toLocaleString()}</span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento ({discountApplied}%):</span>
                    <span>-${((selectedVariant.precioVenta * discountApplied) / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t border-yellow-300 pt-1">
                  <span>Valor de devolución:</span>
                  <span>${(selectedVariant.precioVenta - ((selectedVariant.precioVenta * discountApplied) / 100)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje si no hay variantes */}
          {(!product.variantes || product.variantes.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>No hay talles disponibles</p>
              <p className="text-sm">Este producto no tiene talles configurados</p>
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
            disabled={!selectedVariant}
            className="flex-1 btn-rosema disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Procesar Devolución
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnProductModal;
