// src/components/GoalModal.jsx
import React, { useState, useEffect } from 'react';

const GoalModal = ({ isOpen, onClose, currentGoals = {}, onSave }) => {
    const [formGoals, setFormGoals] = useState({
        monthly: '',
        weekly: '',
        daily: '',
    });

    const [autoFilled, setAutoFilled] = useState(false);

    useEffect(() => {
        setFormGoals({
            monthly: currentGoals.monthly ?? '',
            weekly: currentGoals.weekly ?? '',
            daily: currentGoals.daily ?? '',
        });
        setAutoFilled(false);
    }, [currentGoals, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numeric = value === '' ? '' : Number(value);

        setFormGoals((prev) => {
            const next = { ...prev, [name]: numeric };

            // Cuando cambia la meta mensual => recalcular
            if (name === 'monthly') {
                if (numeric === '' || numeric <= 0) {
                    setAutoFilled(false);
                    return next;
                }

                // 🔹 Cálculo considerando que no se trabaja el domingo
                const workingDaysPerWeek = 6;            // lunes a sábado
                const approxWeeksPerMonth = 4;           // 4 semanas aprox.
                const workingDaysPerMonth = workingDaysPerWeek * approxWeeksPerMonth; // 24 días

                const suggestedWeekly = Math.round(numeric / approxWeeksPerMonth);
                const suggestedDaily = Math.round(numeric / workingDaysPerMonth);

                next.weekly = suggestedWeekly;
                next.daily = suggestedDaily;
                setAutoFilled(true);
            } else {
                if (name === 'weekly' || name === 'daily') {
                    setAutoFilled(false);
                }
            }

            return next;
        });
    };

    const handleSave = () => {
        const out = {
            monthly: Number(formGoals.monthly) || 0,
            weekly: Number(formGoals.weekly) || 0,
            daily: Number(formGoals.daily) || 0,
        };
        onSave(out);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    ⚙️ Configurar Metas
                </h2>

                <p className="text-sm text-gray-600 mb-4 text-center">
                    Al modificar la <strong>Meta Mensual</strong> se completan automáticamente la Meta Semanal y Diaria considerando que no se trabaja los domingos.
                </p>

                <div className="space-y-5">
                    {/* Mensual */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Mensual</label>
                        <input
                            type="number"
                            min={0}
                            step={1}
                            name="monthly"
                            value={formGoals.monthly === '' ? '' : formGoals.monthly}
                            onChange={handleChange}
                            placeholder="Ej: 2000000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-rose-500 focus:border-rose-500 text-right"
                        />
                    </div>

                    {/* Semanal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Semanal</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                min={0}
                                step={1}
                                name="weekly"
                                value={formGoals.weekly === '' ? '' : formGoals.weekly}
                                onChange={handleChange}
                                placeholder="Ej: 500000"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-rose-500 focus:border-rose-500 text-right"
                            />
                            {autoFilled && (
                                <span className="px-2 py-1 text-xs bg-rose-50 text-rose-600 rounded-md whitespace-nowrap">
                                    Autocompletado
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Diaria */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Diaria</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                min={0}
                                step={1}
                                name="daily"
                                value={formGoals.daily === '' ? '' : formGoals.daily}
                                onChange={handleChange}
                                placeholder="Ej: 50000"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-rose-500 focus:border-rose-500 text-right"
                            />
                            {autoFilled && (
                                <span className="px-2 py-1 text-xs bg-rose-50 text-rose-600 rounded-md whitespace-nowrap">
                                    Autocompletado
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn-rosema"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalModal;
