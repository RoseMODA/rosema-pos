import React from 'react';

/**
 * Modal para imprimir recibos de venta
 */
const PrintReceiptModal = ({ isOpen, onClose, saleData }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recibo de Venta</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del recibo */}
        <div className="p-6" id="receipt-content">
          {/* Encabezado de la empresa */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">ROSEMA</h1>
            <p className="text-sm text-gray-600">Sistema de Punto de Venta</p>
            <p className="text-xs text-gray-500">Fecha: {saleData?.saleDate ? 
              new Date(saleData.saleDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : currentDate}</p>
            {saleData?.saleNumber && (
              <p className="text-xs text-gray-500 font-medium">
                Venta N°: {saleData.saleNumber}
              </p>
            )}
          </div>

          {/* Información del cliente */}
          {saleData?.customerName && (
            <div className="mb-4">
              <p className="text-sm"><strong>Cliente:</strong> {saleData.customerName}</p>
            </div>
          )}

          {/* Productos */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 border-b border-gray-200 pb-2">Productos</h3>
            <div className="space-y-2">
              {saleData?.items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500 text-xs">
                      {item.code} | Cant: {item.quantity} | ${item.price.toLocaleString()} c/u
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${saleData?.subtotal?.toLocaleString() || '0'}</span>
            </div>
            
            {saleData?.discount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Descuento:</span>
                <span>-${saleData.discount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>${saleData?.total?.toLocaleString() || '0'}</span>
            </div>
          </div>

          {/* Información de pago */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm mb-2">
              <span>Método de pago:</span>
              <span>{saleData?.paymentMethod || 'Efectivo'}</span>
            </div>
            
            {saleData?.cashReceived > 0 && (
              <>
                <div className="flex justify-between text-sm mb-2">
                  <span>Recibido:</span>
                  <span>${saleData.cashReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vuelto:</span>
                  <span>${saleData.change?.toLocaleString() || '0'}</span>
                </div>
              </>
            )}
          </div>

          {/* Pie del recibo */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">¡Gracias por su compra!</p>
            <p className="text-xs text-gray-500">ROSEMA - Sistema POS</p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Imprimir</span>
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintReceiptModal;
