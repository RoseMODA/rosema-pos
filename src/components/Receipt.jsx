import React from 'react';

/**
 * Componente de recibo para imprimir
 * Genera un recibo con el formato requerido para Rosema
 * ACTUALIZADO para manejar correctamente los datos del carrito con Firebase
 */
const Receipt = ({
  sale,
  onPrint,
  onClose,
  show = false
}) => {
  /**
   * Formatear precio
   */
  const formatPrice = (price) => {
    if (typeof price !== 'number') return '$0';
    return `$${price.toLocaleString()}`;
  };

  /**
   * Formatear fecha
   */
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleString('es-AR');
    return new Date(date).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Imprimir recibo
   */
  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  if (!show || !sale) return null;

  return (
    <>
      {/* Modal para vista previa */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-90vh overflow-y-auto">
          {/* Header del modal */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 print:hidden">
            <h3 className="text-lg font-semibold text-gray-900">
              Vista Previa del Recibo
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          {/* Contenido del recibo */}
          <div id="receipt-content" className="p-6 print:p-4">
            {/* Header del recibo */}
            <div className="text-center mb-6 print:mb-4">
              {/* Logo */}
              <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-3 print:w-12 print:h-12 print:mb-2">
                <span className="text-white text-2xl font-bold print:text-xl">R</span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 print:text-xl">ROSEMA</h1>
              <p className="text-sm text-gray-600 print:text-xs">Moda Familiar</p>

              {/* Información de contacto */}
              <div className="mt-3 text-sm text-gray-600 print:text-xs print:mt-2">
                <p>Salto de las Rosas</p>
                <p>WhatsApp: 260 438-1502</p>
              </div>
            </div>

            {/* Información de la venta */}
            <div className="border-t border-b border-gray-300 py-3 mb-4 print:py-2 print:mb-3">
              <div className="flex justify-between text-sm print:text-xs">
                <span>Venta #:</span>
                <span className="font-medium">{sale.saleNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm print:text-xs">
                <span>Fecha:</span>
                <span>{formatDate(sale.createdAt || sale.saleDate)}</span>
              </div>
              <div className="flex justify-between text-sm print:text-xs">
                <span>Método de Pago:</span>
                <span className="capitalize">{sale.paymentMethod || 'Efectivo'}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between text-sm print:text-xs">
                  <span>Cliente:</span>
                  <span>{sale.customerName}</span>
                </div>
              )}
            </div>

            {/* Detalle de productos */}
            <div className="mb-4 print:mb-3">
              <h3 className="font-semibold text-gray-900 mb-2 print:text-sm print:mb-1">
                Detalle de Productos
              </h3>

              <div className="space-y-2 print:space-y-1">
                {Array.isArray(sale.items) && sale.items.map((item, index) => {
                  // Manejar diferentes estructuras de datos del carrito
                  const itemQuantity = item.quantity || item.qty || 1;
                  const itemName = item.name || item.nombre || 'Producto';
                  const itemPrice = item.price || 0;
                  const displayTalle = item.talle || (item.variant && item.variant.talle);
                  const displayColor = item.color || (item.variant && item.variant.color);
                  const itemCode = item.code || item.id || 'N/A';

                  return (
                    <div key={index} className="text-sm print:text-xs">
                      <div className="flex justify-between">
                        <span className="font-medium">{itemName}</span>
                        <span>{formatPrice(itemPrice * itemQuantity)}</span>
                      </div>

                      <div className="flex justify-between text-gray-600 ml-2">
                        <span>
                          {itemQuantity} x {formatPrice(itemPrice)}
                          {displayTalle && ` • Talle: ${displayTalle}`}
                          {displayColor && ` • Color: ${displayColor}`}
                          {item.isReturn && ' • DEVOLUCIÓN'}
                          {item.isQuickItem && ' • ARTÍCULO RÁPIDO'}
                        </span>
                      </div>
                      
                      {itemCode !== 'N/A' && (
                        <div className="text-xs text-gray-500 ml-2">
                          Código: {itemCode}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mensaje si no hay items */}
              {(!Array.isArray(sale.items) || sale.items.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p>No hay productos en esta venta</p>
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="border-t border-gray-300 pt-3 mb-4 print:pt-2 print:mb-3">
              <div className="space-y-1 text-sm print:text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(sale.subtotal || 0)}</span>
                </div>

                {/* Manejo mejorado de descuentos */}
                {((sale.discount && sale.discount > 0) || (sale.discountValue && sale.discountValue > 0)) && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento:</span>
                    <span>-{formatPrice(sale.discount || sale.discountValue || 0)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 print:text-base print:pt-1">
                  <span>TOTAL:</span>
                  <span>{formatPrice(sale.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Información de pago adicional - REMOVIDO: No mostrar efectivo recibido ni vuelto en el recibo */}

            {/* Información adicional */}
            <div className="text-center text-sm text-gray-600 print:text-xs">
              <div className="border border-gray-300 rounded p-3 mb-3 print:p-2 print:mb-2">
                <p className="font-medium text-gray-900 mb-1">POLÍTICA DE CAMBIOS</p>
                <p>Cambios en 3 días hábiles</p>
                <p>Presentar este recibo</p>
                <p>Producto en perfecto estado</p>
              </div>

              <p className="text-xs text-gray-500 print:text-xs">
                ¡Gracias por su compra!
              </p>
              <p className="text-xs text-gray-500 print:text-xs">
                Síguenos en redes sociales
              </p>
            </div>

            {/* Código QR placeholder (opcional) */}
            <div className="text-center mt-4 print:mt-3">
              <div className="inline-block w-16 h-16 bg-gray-200 rounded print:w-12 print:h-12">
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                  QR
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Escanea para contactarnos
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 p-4 border-t border-gray-200 print:hidden">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>🖨</span>
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 300px;
            margin: 0;
            padding: 10px;
            font-size: 12px;
            line-height: 1.3;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:text-xs {
            font-size: 10px !important;
          }
          
          .print\\:text-sm {
            font-size: 11px !important;
          }
          
          .print\\:text-base {
            font-size: 12px !important;
          }
          
          .print\\:text-xl {
            font-size: 16px !important;
          }
          
          .print\\:w-12 {
            width: 3rem !important;
          }
          
          .print\\:h-12 {
            height: 3rem !important;
          }
          
          .print\\:mb-1 {
            margin-bottom: 0.25rem !important;
          }
          
          .print\\:mb-2 {
            margin-bottom: 0.5rem !important;
          }
          
          .print\\:mb-3 {
            margin-bottom: 0.75rem !important;
          }
          
          .print\\:mt-3 {
            margin-top: 0.75rem !important;
          }
          
          .print\\:p-2 {
            padding: 0.5rem !important;
          }
          
          .print\\:p-4 {
            padding: 1rem !important;
          }
          
          .print\\:py-2 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          
          .print\\:pt-1 {
            padding-top: 0.25rem !important;
          }
          
          .print\\:space-y-1 > * + * {
            margin-top: 0.25rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default Receipt;
