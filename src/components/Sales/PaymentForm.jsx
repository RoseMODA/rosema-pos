/**
 * Componente de formulario de pago para ventas
 */

import React from 'react';
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
  totals,
  onPaymentMethodChange,
  onDiscountChange,
  onCashReceivedChange,
  onCardNameChange,
  onInstallmentsChange,
  onCommissionChange
}) => {
  const commissionInfo = calculateCommissionInfo(totals.total, commission);

  return (
    <div className="space-y-4">
      {/* Método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
          className="w-full input-rosema"
        >
          {PAYMENT_METHODS.map(method => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de descuento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descuento
        </label>
        <select
          value={discountPercent}
          onChange={(e) => onDiscountChange(Number(e.target.value))}
          className="w-full input-rosema"
        >
          {DISCOUNT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mostrar subtotal y descuento aplicado */}
      {totals.subtotal > 0 && (
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>

          {totals.discountValue > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento ({discountPercent}%):</span>
              <span>-{formatPrice(totals.discountValue)}</span>
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
          totals={totals}
          commissionInfo={commissionInfo}
          onCardNameChange={onCardNameChange}
          onInstallmentsChange={onInstallmentsChange}
          onCommissionChange={onCommissionChange}
        />
      )}

      {(paymentMethod === 'Débito' || paymentMethod === 'QR') && (
        <CommissionFields
          commission={commission}
          totals={totals}
          commissionInfo={commissionInfo}
          onCommissionChange={onCommissionChange}
        />
      )}

      {/* Total */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center text-2xl font-bold">
          <span>Total:</span>
          <span className="text-green-600">{formatPrice(totals.total)}</span>
        </div>
      </div>
    </div>
  );
};

const CashPaymentFields = ({ cashReceived, totals, onCashReceivedChange }) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Recibido en Efectivo
      </label>
      <input
        type="number"
        value={cashReceived || ''}
        onChange={(e) => onCashReceivedChange(Number(e.target.value) || 0)}
        className="w-full input-rosema"
        placeholder="Ingrese monto recibido"
      />
    </div>

    <div>
      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Vuelto:</span>
        <span className={totals.change >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatPrice(totals.change)}
        </span>
      </div>
    </div>
  </>
);

const CreditPaymentFields = ({
  cardName,
  installments,
  commission,
  totals,
  commissionInfo,
  onCardNameChange,
  onInstallmentsChange,
  onCommissionChange
}) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Nombre de la Tarjeta
      </label>
      <input
        type="text"
        value={cardName}
        onChange={(e) => onCardNameChange(e.target.value)}
        className="w-full input-rosema"
        placeholder="Ingrese nombre de la tarjeta"
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
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

    {commission > 0 && (
      <CommissionInfo commissionInfo={commissionInfo} />
    )}
  </>
);

const CommissionFields = ({ commission, totals, commissionInfo, onCommissionChange }) => (
  <>
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

    {commission > 0 && (
      <CommissionInfo commissionInfo={commissionInfo} />
    )}
  </>
);

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
