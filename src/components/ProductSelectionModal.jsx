import React, { useState, useEffect } from "react";

const ProductSelectionModal = ({ product, show, onClose, onAddToCart }) => {
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Toggle selección de una variante
  const toggleVariant = (variant) => {
    setSelectedVariants((prev) => {
      const exists = prev.find(
        (v) => v.talle === variant.talle && v.color === variant.color
      );
      if (exists) {
        // Si ya estaba seleccionada → quitarla
        return prev.filter(
          (v) => !(v.talle === variant.talle && v.color === variant.color)
        );
      } else {
        // Si no estaba seleccionada → agregarla
        return [...prev, variant];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedVariants.length === 0) {
      alert("Por favor seleccione al menos una variante");
      return;
    }

    // Validar stocks y cantidades
    for (let variant of selectedVariants) {
      if (quantity > variant.stock) {
        alert(
          `Stock insuficiente en ${variant.talle}. Disponible: ${variant.stock}`
        );
        return;
      }
    }

    // 🚀 Mandar TODAS las variantes al carrito
    onAddToCart(product, quantity, selectedVariants);
    handleClose();
  };

  const handleClose = () => {
    setSelectedVariants([]);
    setQuantity(1);
    onClose();
  };

  // Capturar Enter
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, selectedVariants, quantity]);

  if (!show || !product) return null;

  const availableVariants = product.variantes || [];

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
            ✖
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Info producto */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">
              {product.articulo || product.name}
            </h4>
            <p className="text-sm text-gray-600">Código: {product.id}</p>
          </div>

          {/* Variantes */}
          {availableVariants.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Talles Disponibles *
              </label>
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-2">Talle</th>
                      <th className="px-4 py-2">Color</th>
                      <th className="px-4 py-2">Precio</th>
                      <th className="px-4 py-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableVariants.map((variant, index) => {
                      const isSelected = selectedVariants.some(
                        (v) =>
                          v.talle === variant.talle && v.color === variant.color
                      );
                      const disabled = variant.stock === 0;

                      return (
                        <tr
                          key={index}
                          onClick={() => !disabled && toggleVariant(variant)}
                          className={`cursor-pointer transition-colors ${disabled
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : isSelected
                                ? "bg-red-600 text-white"
                                : "hover:bg-red-50"
                            }`}
                        >
                          <td className="px-4 py-2 font-medium">
                            {variant.talle}
                          </td>
                          <td className="px-4 py-2">
                            {variant.color || "-"}
                          </td>
                          <td className="px-4 py-2 font-semibold text-green-600">
                            ${variant.precioVenta?.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {variant.stock}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-600 mt-1">
              Sin variantes disponibles
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button onClick={handleClose} className="flex-1 btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedVariants.length === 0}
            className="flex-1 btn-rosema disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
