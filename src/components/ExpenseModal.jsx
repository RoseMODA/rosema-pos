import React, { useState, useEffect } from 'react';

const ExpenseModal = ({ isOpen, onClose, expenses, onSave, onDelete }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [editing, setEditing] = useState(null); // 👈 gasto que estamos editando

    useEffect(() => {
        if (isOpen) {
            setName('');
            setAmount('');
            setEditing(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name || !amount) return;
        onSave(name, parseFloat(amount));
        setName('');
        setAmount('');
        setEditing(null);
    };

    const handleEdit = (key, value) => {
        setEditing(key);
        setName(key);
        setAmount(value);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
                <h2 className="text-xl font-bold mb-4">
                    {editing ? '✏️ Editar Gasto' : '💰 Registrar Gasto'}
                </h2>

                {/* Inputs para agregar/editar */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del gasto
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: Mascotas, Seguros..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto
                    </label>
                    <input
                        type="number"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                </div>

                <div className="flex justify-end gap-2 mb-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
                    >
                        {editing ? 'Guardar cambios' : 'Agregar'}
                    </button>
                </div>

                {/* Lista de gastos actuales */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">📋 Gastos Actuales</h3>
                    {Object.keys(expenses).length === 0 && (
                        <p className="text-gray-500 text-sm">No hay gastos registrados</p>
                    )}
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {Object.entries(expenses).map(([key, value]) => (
                            <li
                                key={key}
                                className="flex justify-between items-center bg-gray-100 p-2 rounded"
                            >
                                <div>
                                    <span className="font-medium capitalize">{key}</span>
                                    <span className="text-gray-700 ml-2">
                                        ${value.toLocaleString('es-AR')}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(key, value)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete(key)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ExpenseModal;
