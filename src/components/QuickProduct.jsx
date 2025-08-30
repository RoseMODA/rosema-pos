import React, { useState } from 'react';

/**
 * Componente para agregar artículos rápidos (productos no registrados)
 * Permite agregar productos temporales al carrito sin registrarlos en la base de datos
 */
const QuickProduct = ({ onAddQuickItem, disabled = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: 1,
    size: ''
  });
  const [errors, setErrors] = useState({});

  /**
   * Manejar cambios en el formulario
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const quickItem = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      size: formData.size.trim() || null
    };

    onAddQuickItem(quickItem);
    
    // Limpiar formulario y cerrar modal
    setFormData({
      name: '',
      price: '',
      quantity: 1,
      size: ''
    });
    setErrors({});
    setShowModal(false);
  };

  /**
   * Cerrar modal y limpiar formulario
   */
  const handleCloseModal = () => {
    setFormData({
      name: '',
      price: '',
      quantity: 1,
      size: ''
    });
    setErrors({});
    setShowModal(false);
  };

  /**
   * Formatear precio mientras se escribe
   */
  const formatPriceInput = (value) => {
    // Remover caracteres no numéricos excepto punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Asegurar solo un punto decimal
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numericValue;
  };

  return (
    <>
      {/* Botón para abrir modal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Artículo Rápido
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Agregue productos no registrados directamente al carrito
          </p>
          
          <button
            onClick={() => setShowModal(true)}
            disabled={disabled}
            className="btn-rosema w-full disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Artículo Rápido
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>• No se registra en inventario</p>
          <p>• Ideal para servicios o productos únicos</p>
        </div>
      </div>

      {/* Modal del formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Nuevo Artículo Rápido
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombre del producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Servicio de costura, Producto especial..."
                  className={`input-rosema ${errors.name ? 'border-red-500' : ''}`}
                  maxLength={100}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', formatPriceInput(e.target.value))}
                    placeholder="0.00"
                    className={`input-rosema pl-8 ${errors.price ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  min="1"
                  max="999"
                  className={`input-rosema ${errors.quantity ? 'border-red-500' : ''}`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>

              {/* Talla (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Talla (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  placeholder="Ej: S, M, L, XL, 38, 40..."
                  className="input-rosema"
                  maxLength={10}
                />
              </div>

              {/* Vista previa */}
              {formData.name && formData.price && (
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Vista Previa:</h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>Producto:</strong> {formData.name}</p>
                    <p><strong>Precio:</strong> ${parseFloat(formData.price || 0).toLocaleString()}</p>
                    <p><strong>Cantidad:</strong> {formData.quantity}</p>
                    {formData.size && <p><strong>Talla:</strong> {formData.size}</p>}
                    <p className="font-medium text-green-600 mt-2">
                      <strong>Total:</strong> ${(parseFloat(formData.price || 0) * parseInt(formData.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-rosema"
                >
                  Agregar al Carrito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickProduct;
