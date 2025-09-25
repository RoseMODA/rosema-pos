import React, { useState, useRef, useEffect } from 'react';

const QuickItemModal = ({ isOpen, onClose, onAddItem }) => {
  const [itemData, setItemData] = useState({
    name: '',
    price: '',
    quantity: 1,
    size: ''
  });

  const [errors, setErrors] = useState({});

  // 👉 Ref para el input del nombre
  const nameInputRef = useRef(null);

  // 👉 Cuando el modal se abre, enfocar el input
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      // pequeño delay evita problemas si el modal se monta con animación
      setTimeout(() => {
        nameInputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);
  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!itemData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!itemData.price || itemData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!itemData.quantity || itemData.quantity <= 0) {
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
      name: itemData.name.trim(),
      price: parseFloat(itemData.price),
      quantity: parseInt(itemData.quantity),
      size: itemData.size.trim() || null
    };

    onAddItem(quickItem);
    handleClose();
  };

  /**
   * Cerrar modal y limpiar formulario
   */
  const handleClose = () => {
    setItemData({
      name: '',
      price: '',
      quantity: 1,
      size: ''
    });
    setErrors({});
    onClose();
  };

  /**
   * Manejar cambios en los inputs
   */
  const handleInputChange = (field, value) => {
    setItemData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Artículo Rápido
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Nombre del artículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Artículo *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={itemData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full input-rosema ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Ej: Remera básica"
                maxLength={100}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Venta *
              </label>
              <div className="flex items-center border rounded input-rosema">
                <span className="px-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={itemData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`flex-1 py-2 pl-2 focus:outline-none ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                value={itemData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className={`w-full input-rosema ${errors.quantity ? 'border-red-500' : ''}`}
                placeholder="1"
                min="1"
                max="999"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            {/* Talla (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Talla (Opcional)
              </label>
              <input
                type="text"
                value={itemData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="w-full input-rosema"
                placeholder="Ej: M, L, XL, 38, 40"
                maxLength={10}
              />
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">Artículo Rápido</p>
                <p className="text-xs text-blue-600 mt-1">
                  Este artículo no se registrará en el inventario. Es ideal para productos únicos o servicios.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
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
  );
};

export default QuickItemModal;
