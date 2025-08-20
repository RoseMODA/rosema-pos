import React, { useState } from 'react';

/**
 * Componente del carrito de ventas
 * Muestra los productos agregados, permite modificar cantidades y calcular totales
 */
const SalesCart = ({ 
  cart, 
  discount, 
  paymentMethod,
  subtotal,
  discountAmount,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onSetDiscount,
  onSetPaymentMethod,
  onCompleteSale,
  onCreatePendingSale,
  loading = false
}) => {
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPendingSaleModal, setShowPendingSaleModal] = useState(false);
  const [pendingSaleLabel, setPendingSaleLabel] = useState('');
  const [discountTypeInput, setDiscountTypeInput] = useState(discount.type);
  const [discountValueInput, setDiscountValueInput] = useState(discount.value);

  /**
   * Manejar aplicación de descuento
   */
  const handleApplyDiscount = (type, value) => {
    onSetDiscount({ type, value: parseFloat(value) || 0 });
    setShowDiscountModal(false);
  };

  /**
   * Abrir modal de descuento con valores actuales
   */
  const openDiscountModal = () => {
    setDiscountTypeInput(discount.type);
    setDiscountValueInput(discount.value);
    setShowDiscountModal(true);
  };

  /**
   * Manejar creación de venta en espera
   */
  const handleCreatePendingSale = () => {
    if (!pendingSaleLabel.trim()) {
      alert('Ingrese una etiqueta para la venta en espera');
      return;
    }
    
    onCreatePendingSale(pendingSaleLabel.trim());
    setPendingSaleLabel('');
    setShowPendingSaleModal(false);
  };

  /**
   * Formatear precio
   */
  const formatPrice = (price) => {
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Carrito de Ventas
        </h3>
        <span className="text-sm text-gray-600">
          {cart.length} {cart.length === 1 ? 'artículo' : 'artículos'}
        </span>
      </div>

      {/* Items del carrito */}
      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M7 13h10m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6z" />
            </svg>
            <p>El carrito está vacío</p>
            <p className="text-sm">Busque productos para agregar</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {item.code && <span>Código: {item.code}</span>}
                  {item.size && <span>Talla: {item.size}</span>}
                  {item.color && (
                    <div className="flex items-center space-x-1">
                      <span>Color:</span>
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.color }}
                      ></div>
                    </div>
                  )}
                  {item.isQuickItem && (
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                      Artículo Rápido
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="font-semibold text-green-600">
                    {formatPrice(item.price)}
                  </span>
                  {item.stock !== null && (
                    <span className="text-xs text-gray-500">
                      Stock: {item.stock}
                    </span>
                  )}
                </div>
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={loading}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={loading || (item.stock !== null && item.quantity >= item.stock)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                
                <button
                  onClick={() => onRemoveItem(item.id)}
                  disabled={loading}
                  className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumen de totales */}
      {cart.length > 0 && (
        <>
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            {discount.value > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>
                  Descuento ({discount.type === 'percentage' ? `${discount.value}%` : formatPrice(discount.value)}):
                </span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span className="text-green-600">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => onSetPaymentMethod(e.target.value)}
              disabled={loading}
              className="input-rosema"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="debito">Tarjeta de Débito</option>
              <option value="credito">Tarjeta de Crédito</option>
              <option value="qr">Código QR</option>
            </select>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 space-y-3">
            {/* Botón de descuento */}
            <button
              onClick={openDiscountModal}
              disabled={loading}
              className="w-full btn-secondary"
            >
              {discount.value > 0 ? 'Modificar Descuento' : 'Aplicar Descuento'}
            </button>

            {/* Botones principales */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowPendingSaleModal(true)}
                disabled={loading}
                className="btn-secondary"
              >
                Venta en Espera
              </button>
              
              <button
                onClick={onCompleteSale}
                disabled={loading}
                className="btn-rosema"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  'Completar Venta'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de descuento */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Aplicar Descuento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Descuento
                </label>
                <select
                  id="discountType"
                  className="input-rosema"
                  value={discountTypeInput}
                  onChange={(e) => setDiscountTypeInput(e.target.value)}
                >
                                    <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($)</option>
                </select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <input
                  type="text"
                  id="discountValue"
                  placeholder="Ingrese el valor"
                  value={discountValueInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Solo permitir números, punto decimal y borrar
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setDiscountValueInput(value);
                    }
                  }}
                  className="input-rosema"
                  inputMode="decimal"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const value = parseFloat(discountValueInput) || 0;
                  if (value < 0) {
                    alert('El valor del descuento no puede ser negativo');
                    return;
                  }
                  handleApplyDiscount(discountTypeInput, value);
                }}
                className="flex-1 btn-rosema"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de venta en espera */}
      {showPendingSaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Crear Venta en Espera</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiqueta del Cliente
                </label>
                <input
                  type="text"
                  value={pendingSaleLabel}
                  onChange={(e) => setPendingSaleLabel(e.target.value)}
                  placeholder="Ej: Cliente 1, Mesa 5, etc."
                  className="input-rosema"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Esta venta se guardará temporalmente y podrá ser completada más tarde.</p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPendingSaleModal(false);
                  setPendingSaleLabel('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePendingSale}
                disabled={!pendingSaleLabel.trim()}
                className="flex-1 btn-rosema disabled:opacity-50"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCart;
