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
  onEditPrice,
  onToggleOffer,
}) => {
  // Estado local para controlar qué items tienen oferta marcada
  const [offers, setOffers] = useState({});



  const toggleOffer = (itemId) => {
    const updatedCart = cart.map((item) =>
      (item.lineId || item.id) === itemId
        ? { ...item, isOffer: !item.isOffer }
        : item
    );
    // acá llamás a una función que venga desde el hook para actualizar carrito
    onUpdateCart(updatedCart);
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-6">

      {/* Campo de cliente */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Nombre del Cliente (Opcional)"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="w-full input-rosema"
        />
      </div>

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-xl mr-2">🛒</span>
          Carrito de Compra
        </h3>

        <div className="w-8 h-8 bg-gray-500 hover:bg-gray-500 text-white rounded-lg flex items-center justify-center transition-colors">
          <span className="text-sm font-bold">{cart.length}</span>
        </div>
      </div>



      {/* Tabla de productos en carrito – con bordes redondeados */}
      <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
        {cart.length > 0 ? (
          <table className="min-w-full  rounded-lg text-sm">
            <thead className="bg-gray-200 text-gray-700 rounded-t-lg">
              <tr>
                <th className="px-4 py-3 text-left rounded-tl-lg">Código</th>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-center">Talle</th>
                <th className="px-4 py-3 text-center">Color</th>
                <th className="px-4 py-3 text-left">Precio</th>
                <th className="px-4 py-3 text-center">Cantidad</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-center">Quitar</th>
                <th className="px-4 py-3 text-center rounded-tr-lg">Oferta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cart.map((item) => {
                const itemId = item.lineId || item.id;
                const quantity = item.qty || item.quantity || 1;
                const unitPrice = item.customPrice ?? item.price;
                const totalPrice = unitPrice * quantity;

                return (
                  <tr
                    key={itemId}
                    className={`transition-colors ${item.isOffer ? "bg-pink-100" : "hover:bg-gray-50"
                      }`}
                  >
                    <td className="px-4 py-3 text-gray-600">{item.productId}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.nombre || item.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.variant?.talle || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.variant?.color || "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-green-700">
                      {formatPrice(unitPrice)}
                      <button
                        onClick={() => onEditPrice?.(item)}
                        className="text-xs text-blue-600 underline hover:text-blue-800 ml-2"
                      >
                        Editar
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onUpdateQuantity(itemId, quantity - 1)}
                          className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold"
                        >
                          −
                        </button>
                        <span
                          className={`w-6 text-center font-bold text-lg ${quantity > 1 ? "text-red-600" : "text-black"
                            }`}
                        >
                          {quantity}
                        </span>

                        <button
                          onClick={() => onUpdateQuantity(itemId, quantity + 1)}
                          className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">
                      {formatPrice(totalPrice)}
                    </td>
                    <td className="px-8 py-3 text-center">
                      <button
                        onClick={() => onRemoveItem(itemId)}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                        title="Eliminar producto"
                      >
                        ×
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!item.isOffer}
                        onChange={(e) =>
                          onToggleOffer(item.lineId || item.id, e.target.checked)
                        }
                        className="w-5 h-5 accent-pink-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={9} className="rounded-b-lg"></td>
              </tr>
            </tfoot>
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
