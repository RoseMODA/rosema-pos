import React, { useState, useEffect, useRef } from 'react';
import { searchProductsForSale, getProductByBarcode, processSale, validateVariantStock } from '../services/salesService';
import { useProviders } from '../hooks/useProviders';

/**
 * Interfaz principal de ventas con búsqueda de productos y gestión de carrito
 */
const SalesInterface = ({ onSaleComplete }) => {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  
  // Estados de pago
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [discount, setDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [customerName, setCustomerName] = useState('');
  
  // Estados de validación
  const [errors, setErrors] = useState({});
  const [stockWarnings, setStockWarnings] = useState({});

  const { providers } = useProviders();
  const searchInputRef = useRef(null);

  // Enfocar input de búsqueda al montar
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  /**
   * Buscar productos
   */
  const handleSearch = async (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      
      // Primero buscar por código exacto
      const exactProduct = await getProductByBarcode(term.trim());
      if (exactProduct) {
        setSelectedProduct(exactProduct);
        setShowVariants(true);
        setSearchResults([]);
        setSearchTerm('');
        return;
      }

      // Si no encuentra exacto, buscar por término
      const results = await searchProductsForSale(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setErrors({ search: error.message });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Seleccionar producto de los resultados
   */
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setShowVariants(true);
    setSearchResults([]);
    setSearchTerm('');
  };

  /**
   * Agregar variante al carrito
   */
  const handleAddVariantToCart = async (variante, quantity = 1) => {
    try {
      // Validar stock
      const stockValidation = await validateVariantStock(
        selectedProduct.id,
        variante.talla,
        variante.color,
        quantity
      );

      if (!stockValidation.available) {
        setStockWarnings({
          [variante.talla + variante.color]: 'Stock insuficiente'
        });
        return;
      }

      // Buscar proveedor
      const provider = providers.find(p => p.id === selectedProduct.proveedorId);

      // Crear item del carrito
      const cartItem = {
        id: `${selectedProduct.id}-${variante.talla}-${variante.color}`,
        productId: selectedProduct.id,
        productName: selectedProduct.articulo,
        articulo: selectedProduct.articulo,
        talla: variante.talla,
        color: variante.color,
        price: variante.precioVenta || selectedProduct.precioCosto || 0,
        quantity: quantity,
        subtotal: (variante.precioVenta || selectedProduct.precioCosto || 0) * quantity,
        currentStock: variante.stock,
        proveedorId: selectedProduct.proveedorId,
        providerName: provider?.proveedor || 'Sin proveedor',
        isQuickItem: false
      };

      // Verificar si ya existe en el carrito
      const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad
        const updatedCart = [...cart];
        const newQuantity = updatedCart[existingItemIndex].quantity + quantity;
        
        // Validar stock total
        if (newQuantity > variante.stock) {
          setStockWarnings({
            [variante.talla + variante.color]: `Solo hay ${variante.stock} unidades disponibles`
          });
          return;
        }
        
        updatedCart[existingItemIndex].quantity = newQuantity;
        updatedCart[existingItemIndex].subtotal = updatedCart[existingItemIndex].price * newQuantity;
        setCart(updatedCart);
      } else {
        // Agregar nuevo item
        setCart([...cart, cartItem]);
      }

      // Limpiar warnings
      setStockWarnings({});
      setSelectedProduct(null);
      setShowVariants(false);
      
      // Enfocar búsqueda para siguiente producto
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      setStockWarnings({
        [variante.talla + variante.color]: error.message
      });
    }
  };

  /**
   * Remover item del carrito
   */
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  /**
   * Actualizar cantidad en carrito
   */
  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        // Validar stock
        if (newQuantity > item.currentStock) {
          setStockWarnings({
            [itemId]: `Solo hay ${item.currentStock} unidades disponibles`
          });
          return item;
        }
        
        return {
          ...item,
          quantity: newQuantity,
          subtotal: item.price * newQuantity
        };
      }
      return item;
    });
    
    setCart(updatedCart);
    setStockWarnings({});
  };

  /**
   * Calcular totales
   */
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;
    
    return { subtotal, discountAmount, total };
  };

  /**
   * Procesar venta
   */
  const handleProcessSale = async () => {
    try {
      if (cart.length === 0) {
        setErrors({ cart: 'El carrito está vacío' });
        return;
      }

      const { total } = calculateTotals();
      
      if (paymentMethod === 'Efectivo' && (!cashReceived || parseFloat(cashReceived) < total)) {
        setErrors({ payment: 'El monto recibido debe ser mayor o igual al total' });
        return;
      }

      setLoading(true);
      setErrors({});

      const saleData = {
        items: cart,
        paymentMethod,
        discount,
        total,
        cashReceived: paymentMethod === 'Efectivo' ? parseFloat(cashReceived) : total,
        change: paymentMethod === 'Efectivo' ? parseFloat(cashReceived) - total : 0,
        customerName: customerName.trim()
      };

      const result = await processSale(saleData);
      
      // Limpiar formulario
      setCart([]);
      setDiscount(0);
      setCashReceived('');
      setCustomerName('');
      setSearchTerm('');
      setSelectedProduct(null);
      setShowVariants(false);
      
      // Notificar venta completada
      if (onSaleComplete) {
        onSaleComplete(result);
      }

      alert('Venta procesada exitosamente');
      
      // Enfocar búsqueda
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error procesando venta:', error);
      setErrors({ sale: error.message });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, discountAmount, total } = calculateTotals();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Panel izquierdo - Búsqueda y productos */}
      <div className="space-y-6">
        {/* Búsqueda de productos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Buscar Productos
          </h3>
          
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Escanear código o buscar por nombre..."
              className="w-full input-rosema pl-10"
              autoFocus
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {errors.search && (
            <p className="text-red-500 text-sm mt-2">{errors.search}</p>
          )}

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
            </div>
          )}
        </div>

        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Resultados ({searchResults.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{product.articulo}</div>
                  <div className="text-sm text-gray-500">Código: {product.id}</div>
                  <div className="text-sm text-gray-500">
                    Variantes: {product.variantes?.length || 0}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal de variantes */}
        {showVariants && selectedProduct && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">
                Seleccionar Variante - {selectedProduct.articulo}
              </h4>
              <button
                onClick={() => {
                  setShowVariants(false);
                  setSelectedProduct(null);
                  setStockWarnings({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedProduct.variantes?.map((variante, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {variante.talla} - {variante.color}
                      </div>
                      <div className="text-sm text-gray-500">
                        Stock: {variante.stock} | Precio: ${(variante.precioVenta || 0).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddVariantToCart(variante, 1)}
                      disabled={variante.stock === 0}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        variante.stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {variante.stock === 0 ? 'Sin Stock' : 'Agregar'}
                    </button>
                  </div>
                  
                  {stockWarnings[variante.talla + variante.color] && (
                    <p className="text-red-500 text-xs mt-1">
                      {stockWarnings[variante.talla + variante.color]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel derecho - Carrito y pago */}
      <div className="space-y-6">
        {/* Carrito */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Carrito ({cart.length} items)
          </h3>

          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01" />
              </svg>
              <p>El carrito está vacío</p>
              <p className="text-sm">Busca productos para agregar</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-500">
                        {item.talla} - {item.color} | ${item.price.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm font-medium mt-2">
                    Subtotal: ${item.subtotal.toLocaleString()}
                  </div>
                  
                  {stockWarnings[item.id] && (
                    <p className="text-red-500 text-xs mt-1">{stockWarnings[item.id]}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {errors.cart && (
            <p className="text-red-500 text-sm mt-2">{errors.cart}</p>
          )}
        </div>

        {/* Totales y pago */}
        {cart.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pago
            </h3>

            {/* Cliente */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente (opcional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full input-rosema"
                placeholder="Nombre del cliente"
              />
            </div>

            {/* Descuento */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descuento (%)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                className="w-full input-rosema"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            {/* Método de pago */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full input-rosema"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            {/* Monto recibido (solo efectivo) */}
            {paymentMethod === 'Efectivo' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Recibido
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full input-rosema"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.payment && (
                  <p className="text-red-500 text-sm mt-1">{errors.payment}</p>
                )}
              </div>
            )}

            {/* Totales */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({discount}%):</span>
                  <span>-${discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toLocaleString()}</span>
              </div>
              {paymentMethod === 'Efectivo' && cashReceived && parseFloat(cashReceived) >= total && (
                <div className="flex justify-between text-blue-600">
                  <span>Cambio:</span>
                  <span>${(parseFloat(cashReceived) - total).toLocaleString()}</span>
                </div>
              )}
            </div>

            {errors.sale && (
              <p className="text-red-500 text-sm mt-4">{errors.sale}</p>
            )}

            {/* Botón procesar venta */}
            <button
              onClick={handleProcessSale}
              disabled={loading || cart.length === 0}
              className="w-full btn-rosema mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : `Procesar Venta - $${total.toLocaleString()}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesInterface;
