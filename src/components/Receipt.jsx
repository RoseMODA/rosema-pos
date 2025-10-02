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
  };


  if (!show || !sale) return null;

  return (
    <>
      {/* Modal para vista previa */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">

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

          {/* 🔹 Cuerpo con scroll */}
          <div
            id="receipt-content"
            className="p-6 print:p-4 max-h-[60vh] overflow-y-auto print:max-h-none print:overflow-visible"
          >


            {/* Contenido del recibo */}
            <div id="receipt-content" className="p-6 print:p-4">
              {/* Header del recibo */}
              <div className="text-center mb-6 print:mb-4">
                {/* Logo */}
                <div className="flex justify-center mb-3 print:mb-2">
                  <img
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAE8CAYAAADuYedZAAAACXBIWXMAAC4jAAAuIwF4pT92AAAHsmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDMgNzkuMTY0NTI3LCAyMDIwLzEwLzE1LTE3OjQ4OjMyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTEwLTI1VDA4OjM0OjQ1LTAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNS0xMC0wMlQwMTo0MToxNi0wMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNS0xMC0wMlQwMTo0MToxNi0wMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpmNjBlM2ZmNC01ZDM4LTRhNDUtOTU0My1iNTM0OTNjN2FhNGIiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDozNzUzODNiYy02OTM3LWY0NGMtODkxYi1jY2FmNmY4MWRiNWYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjNDczNjRjMi1mYzkyLWJiNDEtOTI0Zi01NTlhODA4ZjIwMDAiPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT54bXAuZGlkOjc4NjVEMEUzOTJDRjExRUY5Mjc2QTJGODcwMDZBNUUzPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YzQ3MzY0YzItZmM5Mi1iYjQxLTkyNGYtNTU5YTgwOGYyMDAwIiBzdEV2dDp3aGVuPSIyMDI0LTEwLTI1VDA4OjM0OjQ1LTAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMSAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NDQ0YmRjYzUtYWY5MC0zZjRiLWI4ZGQtYTBjODU2NjdkOWQ0IiBzdEV2dDp3aGVuPSIyMDI1LTA1LTA3VDE0OjQxOjE0LTAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmY2MGUzZmY0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
"   // 👈 poné la ruta de tu logo aquí
                    alt="Logo"
                    style={{
                      maxWidth: "150px", // controla el tamaño
                      maxHeight: "150px",
                      objectFit: "contain" // hace que no se corte ni deforme
                    }}
                  />
                </div>


                {/* Información de contacto */}
                <div className="mt-3 text-sm font-bold text-black print:text-xs print:mt-2">
                  <p>Salto de las Rosas</p>
                  <p>WhatsApp: 260 438-1502</p>
                </div>
              </div>

              {/* Información de la venta */}
              <div className="border-t border-b border-black py-3 mb-4 print:py-2 print:mb-3">
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
                          <span className="font-bold">{itemName}</span>
                          <span>{formatPrice(itemPrice * itemQuantity)}</span>
                        </div>

                        <div className="flex justify-between text-black ml-2">
                          <span>
                            {itemQuantity} x {formatPrice(itemPrice)}
                            {displayTalle && ` | Talle: ${displayTalle}`}
                            {displayColor && ` | Color: ${displayColor}`}
                            {item.isReturn && ' | DEVOLUCIÓN'}
                            {item.isQuickItem && ' | ARTÍCULO RÁPIDO'}
                          </span>
                        </div>

                        {itemCode !== 'N/A' && (
                          <div className="text-xs text-black ml-2">
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
              <div className="border-t border-black pt-3 mb-4 print:pt-2 print:mb-3">
                <div className="space-y-1 text-sm print:text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Subtotal:</span>
                    <span>{formatPrice(sale.subtotal || 0)}</span>
                  </div>

                  {/* Manejo mejorado de descuentos */}
                  {((sale.discount && sale.discount > 0) || (sale.discountValue && sale.discountValue > 0)) && (
                    <div className="flex justify-between font-bold text-green-700">
                      <span>Descuento:</span>
                      <span>Aplicado</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg border-t border-black pt-2 print:text-base print:pt-1">
                    <span>TOTAL:</span>
                    <span>{formatPrice(sale.total || 0)}</span>
                  </div>
                </div>
              </div>



              {/* Información adicional */}
              <div className="text-center text-sm text-gray-800 print:text-xs">
                <div className="border border-gray-700 rounded p-3 mb-3 print:p-2 print:mb-2">
                  <p className="font-bold text-black mb-2">POLÍTICA DE CAMBIOS</p>
                  <p className="font-bold text-black mb-2">- Cambios en 3 días hábiles</p>
                  <p className="font-bold text-black mb-2">- Presentar este recibo</p>
                  <p className="font-bold text-black mb-2">- Producto en perfecto estado</p>
                  <p className="font-bold text-black mb-2">- Con la etiqueta aun puesta en la prenda</p>
                </div>

                <p className="text-lm text-black font-bold print:text-xs">
                  ¡Gracias por su compra!
                </p>
                <p className="text-lm text-black print:text-xs">
                  Síguenos en redes sociales:
                  <br />
                  Instagram: @rosema_ropa
                  <br />
                  Facebook: @rosemaropa
                </p>

                {/* Espacio en blanco para evitar corte al final */}
                <div className="hidden print:block" style={{ height: '80px' }} />




              </div>


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
            padding-bottom: 80px;
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
