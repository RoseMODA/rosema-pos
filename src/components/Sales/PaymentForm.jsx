/**
 * Componente de formulario de pago para ventas (versión mejorada)
 */

import React, { useEffect } from 'react';
import { PAYMENT_METHODS, DISCOUNT_OPTIONS } from '../../utils/constants.js';
import { formatPrice } from '../../utils/formatters.js';
import { calculateCommissionInfo } from '../../utils/salesHelpers.js';



const PaymentForm = ({
  paymentMethod,
  discountPercent,
  cashReceived,
  cardName,
  installments,
  commission,
  netAmount,
  totals,
  cart, // ✅ AGREGADO: Necesario para calcular saldo de devoluciones
  dni,
  onPaymentMethodChange,
  onDiscountChange,
  onCashReceivedChange,
  onCardNameChange,
  onInstallmentsChange,
  onCommissionChange,
  onNetAmountChange,
  onDniChange          // ✅ nuevo
}) => {
  const commissionInfo = calculateCommissionInfo(totals.total, commission);

  useEffect(() => {
    if (netAmount != null && totals.total > 0) {
      const timeout = setTimeout(() => {
        const calcPercent = ((totals.total - netAmount) / totals.total) * 100;
        if (!isNaN(calcPercent) && isFinite(calcPercent)) {
          onCommissionChange(Number(calcPercent.toFixed(2)));
        }
      }, 300); // espera 300ms antes de recalcular

      return () => clearTimeout(timeout);
    }
  }, [netAmount, totals.total]);



  // ✅ NUEVO: Calcular información de devoluciones
  const returnInfo = React.useMemo(() => {
    if (!cart || cart.length === 0) return null;

    const returnItems = cart.filter(item => item.isReturn);
    const regularItems = cart.filter(item => !item.isReturn);

    if (returnItems.length === 0) return null;

    const totalReturns = returnItems.reduce((sum, item) => sum + Math.abs(item.price * item.qty), 0);
    const totalPurchases = regularItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const balance = totalReturns - totalPurchases;

    return {
      hasReturns: true,
      totalReturns,
      totalPurchases,
      balance,
      isInFavor: balance > 0
    };
  }, [cart]);

  return (
    <div className="space-y-6">
      {/* Método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago
        </label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.value}
              type="button"
              onClick={() => onPaymentMethodChange(method.value)}
              className={`px-4 py-2 rounded border text-sm font-bold transition 
                ${paymentMethod === method.value
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de descuento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descuento
        </label>
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onDiscountChange(Number(option.value))}
              className={`px-3 py-1 rounded border text-sm font-bold transition
                ${discountPercent === option.value
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtotal y descuento aplicado */}
      {totals.subtotal > 0 && (
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="grid grid-cols-2 text-lm">
            <span>Subtotal (incluye ofertas):</span>
            <span className="text-right text-2xl">{formatPrice(totals.subtotal)}</span>
          </div>

          {totals.discountValue > 0 && (
            <div className="grid grid-cols-2 text-lm text-red-600">
              <span>Descuento aplicado a productos NO oferta ({discountPercent}%):</span>
              <span className="text-right">-{formatPrice(totals.discountValue)}</span>
            </div>
          )}
        </div>
      )}


      {/* Campos específicos por método de pago */}
      {paymentMethod === 'Efectivo' && (
        <CashPaymentFields
          cashReceived={cashReceived}
          totals={totals}
          onCashReceivedChange={onCashReceivedChange}
        />
      )}

      {paymentMethod === 'Crédito' && (
        <CreditPaymentFields
          cardName={cardName}
          installments={installments}
          commission={commission}
          netAmount={netAmount}
          totals={totals}
          commissionInfo={commissionInfo}
          dni={dni}                           // ✅
          onCardNameChange={onCardNameChange}
          onInstallmentsChange={onInstallmentsChange}
          onCommissionChange={onCommissionChange}
          onNetAmountChange={onNetAmountChange}
          onDniChange={onDniChange}
        />
      )}

      {paymentMethod === 'Débito' && (
        <CommissionFields
          commission={commission}
          netAmount={netAmount}
          totals={totals}
          dni={dni}                           // ✅
          onCommissionChange={onCommissionChange}
          onNetAmountChange={onNetAmountChange}
          onDniChange={onDniChange}           // ✅
        />
      )}


      {paymentMethod === 'QR' && (
        <CommissionFields
          commission={commission}
          netAmount={netAmount}
          totals={totals}
          commissionInfo={commissionInfo}
          onCommissionChange={onCommissionChange}
          onNetAmountChange={onNetAmountChange}
          paymentMethod={paymentMethod}
        />
      )}

      {/* ✅ NUEVO: Información de devoluciones */}
      {returnInfo?.hasReturns && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-sm text-orange-800">
            <p className="font-medium mb-2 flex items-center">
              <span className="mr-2">🔄</span>
              Información de Cambio de Prenda
            </p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Valor devuelto:</span>
                <span className="font-medium">${returnInfo.totalReturns.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Nuevas compras:</span>
                <span className="font-medium">${returnInfo.totalPurchases.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-orange-300 pt-1 mt-2">
                <span className="font-medium">
                  {returnInfo.isInFavor ? 'Saldo a favor:' : 'Debe abonar:'}
                </span>
                <span className={`font-bold text-2xl ${returnInfo.isInFavor ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(returnInfo.balance).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="border-t border-gray-200 pt-4 ">
        <div className="flex justify-between items-center font-bold">
          <span className="text-2xl">Total:</span>

          <span className="text-7xl text-white bg-green-900 px-4 py-2 rounded-lg">
            <span className="mr-4">$</span>
            <span>{Number(totals.total).toLocaleString("es-AR")}</span>
          </span>

        </div>
      </div>
    </div>
  );
};

const CashPaymentFields = ({ cashReceived, totals, onCashReceivedChange }) => {
  let change = 0
  let isNegative = false

  if (cashReceived > 0) {
    change = cashReceived - totals.total
    isNegative = change < 0
  }

  const displayValue = isNegative
    ? `- ${formatPrice(Math.abs(change))}`
    : formatPrice(change)

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recibido en Efectivo
        </label>
        <input
          type="number"
          value={cashReceived || ''}
          onChange={(e) => onCashReceivedChange(Number(e.target.value) || 0)}
          className="w-full input-rosema text-2xl"
          placeholder="$ Ingrese monto"
        />
      </div>

      <div className="flex flex-col justify-center">
        <div className="text-lg font-semibold flex items-center">
          <span className="mr-2">Vuelto:</span>
          <span className={isNegative ? 'text-red-600' : 'text-blue-600'}>
            <span className="text-3xl">{displayValue}</span>
          </span>
        </div>
      </div>
    </div>
  )
}




const CreditPaymentFields = ({
  cardName,
  installments,
  commission,
  netAmount,
  totals,
  commissionInfo,
  dni,
  onCardNameChange,
  onInstallmentsChange,
  onCommissionChange,
  onNetAmountChange,
  onDniChange
}) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Tarjeta
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => onCardNameChange(e.target.value)}
          className="w-full input-rosema"
          placeholder="Nombre de la tarjeta"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cuotas sin Interés
        </label>
        <input
          type="number"
          value={installments || ''}
          onChange={(e) => onInstallmentsChange(Number(e.target.value) || 0)}
          className="w-full input-rosema"
          placeholder="Número de cuotas"
          min="0"
        />
      </div>

    </div>

    <div className="grid grid-cols-2 gap-4">
      {/* ✅ Nuevo campo Neto recibido */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Neto recibido ($)
        </label>
        <input
          type="number"
          className="w-full input-rosema"
          value={netAmount ?? ''}   // ✅ usa nullish coalescing
          onChange={(e) => onNetAmountChange(Number(e.target.value) || 0)}
          placeholder="Monto neto recibido"
        />

      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comisión (%)
        </label>
        <input
          type="number"
          value={commission || ''}
          onChange={(e) => onCommissionChange(Number(e.target.value) || 0)}
          className="w-full input-rosema"
          placeholder="% de comisión"
          min="0"
          max="100"
          step="0.1"
        />
      </div>

    </div>


    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        DNI del Cliente
      </label>
      <input
        type="text"
        value={dni || ''}
        onChange={(e) => onDniChange(e.target.value)}
        className="w-full input-rosema"
        placeholder="Ingrese DNI"
        required
      />
    </div>

    {(commission > 0 || netAmount > 0) && (
      <CommissionInfo commissionInfo={commissionInfo} />
    )}
  </>
);


const CommissionFields = ({
  commission,
  netAmount,
  totals,
  dni,
  onCommissionChange,
  onNetAmountChange,
  onDniChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Neto recibido ($)
        </label>
        <input
          type="number"
          value={netAmount || ''}
          onChange={(e) => onNetAmountChange(Number(e.target.value) || 0)}
          className="w-full input-rosema"
          placeholder="Monto real recibido"
          min="0"
        />
      </div>


      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comisión (%)
        </label>
        <input
          type="number"
          value={commission || ''}
          onChange={(e) => onCommissionChange(Number(e.target.value) || 0)}
          className="w-full input-rosema"
          placeholder="% de comisión"
          min="0"
          max="100"
          step="0.1"
        />
      </div>



      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DNI del Cliente
        </label>
        <input
          type="text"
          value={dni || ''}
          onChange={(e) => onDniChange(e.target.value)}
          className="w-full input-rosema"
          placeholder="Ingrese DNI"
          required
        />
      </div>
    </div>

  );
};


const CommissionInfo = ({ commissionInfo }) => (
  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div className="text-sm text-yellow-800">
      <p className="font-medium">Información de Comisión:</p>
      <p>Comisión: {formatPrice(commissionInfo.commissionAmount)}</p>
      <p>Neto a recibir: {formatPrice(commissionInfo.netAmount)}</p>
    </div>
  </div>
);

export default PaymentForm;
