import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';

/**
 * Modal para realizar cambios de prenda (devoluciones)
 */
const ReturnModal = ({ isOpen, onClose, onAddReturn }) => {
  const { 
    products, 
    loading: productsLoading, 
    searchProductsByTerm 
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [returnData, setReturnData] = useState({
    productId: '',
    name: '',
    code: '',
    price: '',
    quantity: 1,
    size: '',
    color: '',
    reason: ''
  });

  const [errors, setErrors] = useState({});

  /**
   * Manejar búsqueda de productos
   */
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchProductsByTerm(term);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  /**
   * Seleccionar producto para devolución
   */
  const handleProductSelect = (product) => {
    setReturnData({
      productId: product.id,
      name: product.name,
      code: product.code || '',
      price: product.salePrice || product.price || 0,
      quantity: 1,
      size: '',
      color: '',
      reason: ''
    });
    setSearchTerm('');
    setShowResults(false);
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!returnData.name.trim()) {
      newErrors.name = 'Debe seleccionar un producto';
    }

    if (!returnData.price || returnData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!returnData.quantity || returnData.quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    if (!returnData.reason.trim()) {
      newErrors.reason = 'Debe especificar el motivo del cambio';
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

    const returnItem = {
      productId: returnData.productId,
      name: returnData.name,
      code: returnData.code,
      price: parseFloat(returnData.price),
      quantity: parseInt(returnData.quantity),
      size: returnData.size || null,
      color: returnData.color || null,
      reason: returnData.reason.trim()
    };

    onAddReturn(returnItem);
    handleClose();
  };

  /**
   * Cerrar modal y limpiar formulario
   */
  const handleClose = () => {
    setReturnData({
      productId: '',
      name: '',
      code: '',
      price: '',
      quantity: 1,
      size: '',
      color: '',
      reason: ''
    });
    setSearchTerm('');
    setShowResults(false);
    setErrors({});
    onClose();
  };

  /**
   * Manejar cambios en los inputs
   */
  const handleInputChange = (field, value) => {
    setReturnData(prev => ({
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
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

        <form onSubmit={handleSubmit} className="p-6">
          {/* Búsqueda de producto */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Producto a Devolver
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por código o nombre del producto..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full input-rosema pl-10"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* Resultados de búsqueda */}
              {showResults && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {productsLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Buscando productos...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No se encontraron productos</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {product.name}
                              </h4>
                              {product.code && (
                                <p className="text-sm text-gray-500">
                                  Código: {product.code}
                                </p>
                              )}
                              <span className="text-lg font-semibold text-green-600">
                                ${product.salePrice?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Información del producto seleccionado */}
          {returnData.name && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Producto Seleccionado</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Nombre:</span>
                  <p className="text-blue-900">{returnData.name}</p>
                </div>
                {returnData.code && (
                  <div>
                    <span className="text-blue-700 font-medium">Código:</span>
                    <p className="text-blue-900">{returnData.code}</p>
                  </div>
                )}
                <div>
                  <span className="text-blue-700 font-medium">Precio:</span>
                  <p className="text-blue-900">${returnData.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad a Devolver *
              </label>
              <input
                type="number"
                value={returnData.quantity}
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

            {/* Precio unitario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={returnData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`w-full input-rosema pl-8 ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Talla */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Talla (Opcional)
              </label>
              <input
                type="text"
                value={returnData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="w-full input-rosema"
                placeholder="Ej: M, L, XL, 38, 40"
                maxLength={10}
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color (Opcional)
              </label>
              <input
                type="text"
                value={returnData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full input-rosema"
                placeholder="Ej: Rojo, Azul, Negro"
                maxLength={20}
              />
            </div>
          </div>

          {/* Motivo del cambio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo del Cambio *
            </label>
            <textarea
              value={returnData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className={`w-full input-rosema ${errors.reason ? 'border-red-500' : ''}`}
              placeholder="Ej: Talla incorrecta, defecto de fábrica, no le gustó al cliente..."
              rows={3}
              maxLength={200}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {returnData.reason.length}/200 caracteres
            </p>
          </div>

          {/* Información importante */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-orange-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm text-orange-800 font-medium">Política de Cambios</p>
                <p className="text-xs text-orange-700 mt-1">
                  • Los cambios se aceptan dentro de los 3 días hábiles<br/>
                  • El producto se agregará como devolución (precio negativo)<br/>
                  • El stock del producto se incrementará automáticamente
                </p>
              </div>
            </div>
          </div>

          {/* Resumen */}
          {returnData.name && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Resumen de Devolución</h4>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {returnData.quantity}x {returnData.name}
                </span>
                <span className="font-semibold text-red-600">
                  -${(returnData.price * returnData.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!returnData.name}
              className="flex-1 btn-rosema disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar Devolución
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnModal;
