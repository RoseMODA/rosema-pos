/**
 * Componente del carrito de compras para ventas
 */

import React from 'react';
import { formatPrice } from '../../utils/formatters.js';

const SalesCart = ({
  cart,
  customerName,
  onCustomerNameChange,
  onUpdateQuantity,
  onRemoveItem,
  onEditPrice
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-xl mr-2">🛒</span>
          Carrito de Compra
        </h3>

        <div className="w-8 h-8 bg-gray-800 hover:bg-gray-900 text-white rounded-lg flex items-center justify-center transition-colors">
          <span className="text-sm font-bold">{cart.length}</span>
        </div>
      </div>

      {/* Campo de cliente */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cliente (Opcional)"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="w-full input-rosema"
        />
      </div>

      {/* Lista de productos en el carrito */}
      <div className="space-y-4 mb-6">
        {cart.map((item) => (
          <CartItem
            key={item.lineId || item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
            onEditPrice={onEditPrice}
          />
        ))}
      </div>

      {/* Mensaje si el carrito está vacío */}
      {cart.length === 0 && (
        <EmptyCartMessage />
      )}
    </div>
  );
};

const CartItem = ({ item, onUpdateQuantity, onRemove, onEditPrice }) => {
  const itemId = item.lineId || item.id;
  const quantity = item.qty || item.quantity || 1;
  const totalPrice = item.price * quantity;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">
          {item.nombre || item.name}
        </h4>

        <div className="text-sm text-gray-600 space-y-1">
          <p>Código: {item.productId}</p>
          <p>
            <span className="font-medium">Talle:</span> {item.variant?.talle || "N/A"}
            {item.variant?.color && (
              <span className="ml-2">
                <span className="font-medium">Color:</span> {item.variant.color}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-lg font-semibold text-green-600">
            {formatPrice(item.customPrice ?? item.price)} x {quantity}
          </p>
          <button
            onClick={() => onEditPrice?.(item)}
            className="text-xs text-blue-600 underline hover:text-blue-800 mt-1"
          >
            ✏️ Editar Precio
          </button>
          <p className="text-lg font-bold text-gray-900">
            = {formatPrice(totalPrice)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 ml-4">
        {/* Controles de cantidad */}
        <QuantityControls
          quantity={quantity}
          onDecrease={() => onUpdateQuantity(itemId, quantity - 1)}
          onIncrease={() => onUpdateQuantity(itemId, quantity + 1)}
        />

        {/* Botón eliminar */}
        <button
          onClick={() => onRemove(itemId)}
          className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
          title="Eliminar producto"
        >
          <span className="text-sm">🗑️</span>
        </button>
      </div>
    </div>
  );
};

const QuantityControls = ({ quantity, onDecrease, onIncrease }) => (
  <>
    <button
      onClick={onDecrease}
      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
      title="Disminuir cantidad"
    >
      <span className="text-lg">−</span>
    </button>

    <span className="w-8 text-center font-medium">{quantity}</span>

    <button
      onClick={onIncrease}
      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
      title="Aumentar cantidad"
    >
      <span className="text-lg">+</span>
    </button>
  </>
);

const EmptyCartMessage = () => (
  <div className="text-center py-8 text-gray-500">
    <div className="text-6xl mb-4">🛒</div>
    <p>El carrito está vacío</p>
    <p className="text-sm">Busca productos para agregar a la venta</p>
  </div>
);

export default SalesCart;
