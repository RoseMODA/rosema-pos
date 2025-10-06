// src/pages/Goals.jsx
import React, { useState, useEffect } from 'react';
import { getSalesHistory } from '../services/salesService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import GoalModal from '../components/GoalModal';
import ExpenseModal from '../components/ExpenseModal';


dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Argentina/Buenos_Aires');

const Goals = () => {
  // --- Metas configurables (luego se pueden guardar en Firestore) ---
  const [goals, setGoals] = useState({
    daily: 50000,
    weekly: 300000,
    monthly: 5500000,
  });

  // --- control modal ---
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  // --- control modal de gastos ---
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' });


  // --- Ventas actuales ---
  const [progress, setProgress] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });

  // --- Gastos fijos (simulado) ---
  const [expenses, setExpenses] = useState({});

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);

  // --- Resultados financieros ---
  const [realProfit, setRealProfit] = useState(0);
  const [surplus, setSurplus] = useState(0);
  const surplusTarget = 2000000; // meta mínima

  // -------------------------------
  // 📊 Cargar ventas reales
  // -------------------------------
  useEffect(() => {
    const loadSales = async () => {
      try {
        const now = dayjs().tz();

        // rango día
        const startDay = now.startOf('day').toDate();
        const endDay = now.endOf('day').toDate();
        const todaySales = await getSalesHistory({ startDate: startDay, endDate: endDay });
        const totalToday = todaySales.reduce((sum, s) => sum + (s.netAmount ?? s.total ?? 0), 0);

        // rango semana
        const startWeek = now.startOf('week').toDate();
        const endWeek = now.endOf('week').toDate();
        const weekSales = await getSalesHistory({ startDate: startWeek, endDate: endWeek });
        const totalWeek = weekSales.reduce((sum, s) => sum + (s.netAmount ?? s.total ?? 0), 0);

        // rango mes
        const startMonth = now.startOf('month').toDate();
        const endMonth = now.endOf('month').toDate();
        const monthSales = await getSalesHistory({ startDate: startMonth, endDate: endMonth });
        const totalMonth = monthSales.reduce((sum, s) => sum + (s.netAmount ?? s.total ?? 0), 0);

        setProgress({
          daily: totalToday,
          weekly: totalWeek,
          monthly: totalMonth,
        });

        // ganancias = ventas mensuales - gastos
        const profit = totalMonth - totalExpenses;
        setRealProfit(profit);
        setSurplus(profit > 0 ? profit : 0);
      } catch (err) {
        console.error('Error cargando ventas en Metas:', err);
      }
    };

    loadSales();
  }, [totalExpenses]);

  // -------------------------------
  // 🔧 Helpers
  // -------------------------------
  const formatCurrency = (value) =>
    `$${value.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;

  const calcProgress = (actual, goal) =>
    goal > 0 ? Math.min((actual / goal) * 100, 100) : 0;

  // -------------------------------
  // 🟢 Render
  // -------------------------------
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🎯 Metas</h1>
        <p className="text-gray-600 mt-2">
          Objetivos comerciales y control de gastos
        </p>
      </div>

      {/* Botones */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setIsGoalModalOpen(true)}
          className="btn-rosema">
          <span className="mr-2">🎯</span> Configurar Meta
        </button>
        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="btn-secondary">
          <span className="mr-2">💰</span> Registrar Gasto
        </button>

        <button className="btn-secondary">
          <span className="mr-2">📊</span> Ver Análisis
        </button>
      </div>

      {/* Metas actuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Meta Diaria', color: 'red', key: 'daily' },
          { label: 'Meta Semanal', color: 'blue', key: 'weekly' },
          { label: 'Meta Mensual', color: 'green', key: 'monthly' },
        ].map(({ label, color, key }) => {
          const percentage = calcProgress(progress[key], goals[key]);
          return (
            <div key={key} className="card-rosema text-center">
              <div className="text-lg font-semibold text-gray-900 mb-2">{label}</div>
              <div className={`text-3xl font-bold text-${color}-600 mb-2`}>
                {formatCurrency(progress[key])}
              </div>
              <div className="text-lm font-medium text-gray-500">
                Meta: {formatCurrency(goals[key])}
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${color}-600 h-2 rounded-full`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="text-lm font-bold text-gray-800 mt-1">
                {percentage.toFixed(1)}% completado
              </div>
            </div>
          );
        })}
      </div>

      {/* Gastos fijos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Gastos Fijos Mensuales
          </h2>
          <div className="space-y-3">
            {Object.entries(expenses).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center text-gray-700 capitalize">
                  {key}
                </div>
                <span className="font-medium text-gray-900">
                  {formatCurrency(value)}
                </span>
              </div>
            ))}

          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
            <span className="font-semibold text-gray-900">
              Total Gastos Fijos:
            </span>
            <span className="font-bold text-red-600 text-lg">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>

        {/* Análisis financiero */}
        <div className="card-rosema">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Análisis Financiero
          </h2>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-800 font-medium">Ganancias Reales</span>
                <span className="text-green-600 font-bold">
                  {formatCurrency(realProfit)}
                </span>
              </div>
              <div className="text-sm text-green-700">
                Ventas mensuales - Gastos fijos
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 font-medium">Excedente Disponible</span>
                <span className="text-blue-600 font-bold">
                  {formatCurrency(surplus)}
                </span>
              </div>
              <div className="text-sm text-blue-700">
                Para nuevas inversiones
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-800 font-medium">Meta Excedente</span>
                <span className="text-yellow-600 font-bold">
                  {formatCurrency(surplusTarget)}
                </span>
              </div>
              <div className="text-sm text-yellow-700">
                Mínimo recomendado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de inversión */}
      <div className="card-rosema mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Indicador de Inversión
        </h2>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">
            {surplus >= surplusTarget ? '✅' : '⚠️'}
          </div>
          <p className="text-gray-600 mb-2 font-medium">
            {surplus >= surplusTarget
              ? 'Excedente suficiente para invertir'
              : 'Excedente insuficiente para nuevas compras'}
          </p>
          <p className="text-sm text-gray-500">
            Se requiere un excedente mínimo de {formatCurrency(surplusTarget)} antes de realizar nuevas inversiones
          </p>
          {surplus < surplusTarget && (
            <div className="mt-4 bg-red-100 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">
                🚫 <strong>Recomendación:</strong> Enfocarse en ventas antes de comprar más inventario
              </p>
            </div>
          )}
        </div>
      </div>
      {/* MODAL CONFIGURAR META */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoals={goals}
        onSave={(updatedGoals) => setGoals(updatedGoals)}  // 👈 actualiza metas
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenses={expenses}                             // 👈 le damos la lista actual
        onSave={(name, amount) => {
          setExpenses(prev => ({
            ...prev,
            [name.toLowerCase()]: amount
          }));
        }}
        onDelete={(name) => {                           // 👈 para borrar
          setExpenses(prev => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
          });
        }}
      />


    </div>
  );
};

export default Goals;
