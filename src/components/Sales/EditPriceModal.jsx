import React, { useState, useEffect } from "react";

const EditPriceModal = ({ isOpen, onClose, item, onSave }) => {
    const [newPrice, setNewPrice] = useState("");

    useEffect(() => {
        if (item) {
            setNewPrice(
                (item.customPrice ?? item.precioVenta ?? 0).toString()
            );
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const costo = item.precioCosto ?? 0;
    const ganancia =
        costo > 0 ? (((parseFloat(newPrice) - costo) / costo) * 100).toFixed(1) : 0;

    const handleSave = () => {
        onSave(item.id, parseFloat(newPrice) || 0); // convierte aquí
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Editar precio</h2>

                <div className="mb-3">
                    <label className="block text-sm text-gray-700">Costo</label>
                    <input
                        type="number"
                        value={costo}
                        disabled
                        className="w-full border rounded p-2 bg-gray-100"
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-sm text-gray-700">Precio de venta</label>
                    <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full border rounded p-2"
                    />
                </div>

                <div className="mb-4 text-sm">
                    Ganancia:{" "}
                    <span
                        className={`font-semibold ${ganancia < 0 ? "text-red-600" : "text-green-600"
                            }`}
                    >
                        {ganancia}%
                    </span>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPriceModal;
