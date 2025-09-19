/**
 * Componente del carrito de compras para ventas
 */

import React, { useState } from 'react';
import { formatPrice } from '../../utils/formatters.js';

const SalesCart = ({
  cart,
  customerName,
  onCustomerNameChange,
  onUpdateQuantity,
  onRemoveItem,
  onEditPrice
}) => {
  // Estado local para controlar qué items tienen oferta marcada
  const [offers, setOffers] = useState({});

  const toggleOffer = (itemId) => {
    setOffers((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Encabezado */}
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

      {/* Tabla de productos */}
      <div className="overflow-x-auto mb-6">
        {cart.length > 0 ? (
          <table className="min-w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-800 text-white">
              <tr className="divide-x divide-gray-300">
                <th className="px-3 py-2 text-left">Código</th>
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-center">Talle</th>
                <th className="px-3 py-2 text-center">Color</th>
                <th className="px-3 py-2 text-right">Precio</th>
                <th className="px-3 py-2 text-center">Cantidad</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
                <th className="px-3 py-2 text-center">Acciones</th>
                <th className="px-3 py-2 text-center">Oferta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-500">
              {cart.map((item) => {
                const itemId = item.lineId || item.id;
                const quantity = item.qty || item.quantity || 1;
                const unitPrice = item.customPrice ?? item.price;
                const totalPrice = unitPrice * quantity;
                const isOffer = offers[itemId] || false;

                return (
                  <tr
                    key={itemId}
                    className={`transition-colors ${isOffer ? "bg-pink-100" : "hover:bg-gray-50 divide-x divide-gray-300"
                      }`}
                  >
                    <td className="px-3 py-2 font-medium text-gray-500">
                      {item.productId}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {item.nombre || item.name}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {item.variant?.talle || "N/A"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {item.variant?.color || "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatPrice(unitPrice)}{" "}
                      <button
                        onClick={() => onEditPrice?.(item)}
                        className="text-xs text-blue-600 underline hover:text-blue-800 ml-1"
                      >
                        Editar
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() =>
                            onUpdateQuantity(itemId, quantity - 1)
                          }
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{quantity}</span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(itemId, quantity + 1)
                          }
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-bold">
                      {formatPrice(totalPrice)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => onRemoveItem(itemId)}
                        className="w-8 h-8 bg-red-200 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={isOffer}
                        onChange={() => toggleOffer(itemId)}
                        className="w-5 h-5 accent-pink-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  );
};

const EmptyCartMessage = () => (
  <div className="text-center py-8 text-gray-500">
    <div className="text-6xl mb-4">🛒</div>
    <p>El carrito está vacío</p>
    <p className="text-sm">Busca productos para agregar a la venta</p>
  </div>
);

export default SalesCart;
