import React, { useState } from 'react';


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

  const [isGift, setIsGift] = useState(false);


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
  const handlePrint = (gift = false) => {
    setIsGift(gift);
    setTimeout(() => {
      window.print();
      setIsGift(false);  // volvemos al modo normal después de imprimir
    }, 100);
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
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAEmCAYAAABMLMakAAAACXBIWXMAAC4jAAAuIwF4pT92AAAHsmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDMgNzkuMTY0NTI3LCAyMDIwLzEwLzE1LTE3OjQ4OjMyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTEwLTI1VDA4OjM0OjQ1LTAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNS0xMC0wMlQyMDo0MToyNS0wMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNS0xMC0wMlQyMDo0MToyNS0wMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxOTcyOWZiYS03MDVjLWQ0NGYtODU5ZC00ZmZiMDc4Zjk1NzgiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDozNzUzODNiYy02OTM3LWY0NGMtODkxYi1jY2FmNmY4MWRiNWYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjNDczNjRjMi1mYzkyLWJiNDEtOTI0Zi01NTlhODA4ZjIwMDAiPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT54bXAuZGlkOjc4NjVEMEUzOTJDRjExRUY5Mjc2QTJGODcwMDZBNUUzPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YzQ3MzY0YzItZmM5Mi1iYjQxLTkyNGYtNTU5YTgwOGYyMDAwIiBzdEV2dDp3aGVuPSIyMDI0LTEwLTI1VDA4OjM0OjQ1LTAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMSAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NDQ0YmRjYzUtYWY5MC0zZjRiLWI4ZGQtYTBjODU2NjdkOWQ0IiBzdEV2dDp3aGVuPSIyMDI1LTA1LTA3VDE0OjQxOjE0LTAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjE5NzI5ZmJh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
"   // 👈 poné la ruta de tu logo aquí
                    alt="Logo"
                    style={{
                      maxWidth: "150px", // controla el tamaño
                      maxHeight: "150px",
                      objectFit: "contain" // hace que no se corte ni deforme
                    }}
                  />

                </div>
                <p className='text-sm font-medium text-black'>MODA FAMILIAR</p>


                {/* Información de contacto */}
                <div className="mt-3 text-sm font-medium justify-center text-black print:text-xs print:mt-2">
                  <p>Salto de las Rosas, Local 3 en Lubricentro Rhasa</p>
                  <div className="flex items-center justify-center space-x-2">
                    <img
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAABhCAYAAABf/hYWAAAACXBIWXMAAC4jAAAuIwF4pT92AAAHsmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDMgNzkuMTY0NTI3LCAyMDIwLzEwLzE1LTE3OjQ4OjMyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTEwLTI1VDA4OjM0OjQ1LTAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNS0xMC0wMlQyMDo0NToyMy0wMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNS0xMC0wMlQyMDo0NToyMy0wMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1Zjc5OGViZi03YmVkLTc3NDMtYTAzYi00ZGQwZWQ1YzQ3YWQiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo1OTMzMTJhYi03YjYzLTk5NGEtOWQ1OS0zMTlmNWYxOWI2YzIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjNDczNjRjMi1mYzkyLWJiNDEtOTI0Zi01NTlhODA4ZjIwMDAiPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT54bXAuZGlkOjc4NjVEMEUzOTJDRjExRUY5Mjc2QTJGODcwMDZBNUUzPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YzQ3MzY0YzItZmM5Mi1iYjQxLTkyNGYtNTU5YTgwOGYyMDAwIiBzdEV2dDp3aGVuPSIyMDI0LTEwLTI1VDA4OjM0OjQ1LTAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMSAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NDQ0YmRjYzUtYWY5MC0zZjRiLWI4ZGQtYTBjODU2NjdkOWQ0IiBzdEV2dDp3aGVuPSIyMDI1LTA1LTA3VDE0OjQxOjE0LTAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjVmNzk4ZWJm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
"   // 👈 poné la ruta de tu logo aquí
                      style={{
                        maxWidth: "20px", // controla el tamaño
                        maxHeight: "20px",
                        objectFit: "contain" // hace que no se corte ni deforme
                      }}
                    />                  <p>Catalogo: 260 438-1502</p>
                  </div>
                </div>
              </div>

              {/* Información de la venta */}
              <div className="border-t border-b  border-gray-700 py-3 mb-4 print:py-2 print:mb-3">
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
                  <span className="capitalize font-bold">{sale.paymentMethod || 'Efectivo'}</span>
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
                  Detalle de Articulos
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
                          {!isGift && <span>{formatPrice(itemPrice * itemQuantity)}</span>}

                        </div>

                        <div className="flex justify-between text-black ml-2">
                          <span>
                            {itemQuantity} {!isGift && `x ${formatPrice(itemPrice)}`}
                            {displayTalle && ` | Talle: ${displayTalle}`}
                            {displayColor && ` | Color: ${displayColor}`}
                            {item.isReturn && ' | DEVOLUCIÓN'}
                            {item.isQuickItem && ' | Art. rápido'}
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
              {!isGift && (
                <div className="border-t  border-gray-700 pt-3 mb-4 print:pt-2 print:mb-3">
                  <div className="space-y-1 text-sm print:text-xs">
                    <div className="flex justify-between font-bold">
                      <span>Subtotal:</span>
                      <span>{formatPrice(sale.subtotal || 0)}</span>
                    </div>

                    {/* Manejo mejorado de descuentos */}
                    {((sale.discount && sale.discount > 0) || (sale.discountValue && sale.discountValue > 0)) && (
                      <div className="flex justify-between font-medium text-black">
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
              )}



              {/* Información adicional */}
              <div className="text-center text-sm text-gray-800 print:text-xs">
                <div className="border border-gray-700 rounded p-3 mb-3 print:p-2 print:mb-2">
                  <p className="font-bold text-black mb-2">POLÍTICA DE CAMBIOS</p>
                  <p className="font-bold text-black mb-2">- Cambios en 3 días hábiles</p>
                  <p className="font-bold text-black mb-2">- Presentar este recibo</p>
                  <p className="font-bold text-black mb-2">- Prendas en perfecto estado</p>
                  <p className="font-bold text-black mb-2">- Con la etiqueta aun puesta en la prenda</p>
                  <p className="font-bold text-black mb-2">- NO hacemos cambios de: Ofertas, Bodys y Ropa interior</p>

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

                <div className="border border-white rounded p-3 mb-3 print:p-2 print:mb-2">
                  <p className="font-bold text-white mb-2"></p>
                  <p className="font-bold text-white mb-2"></p>


                </div>





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
              onClick={() => handlePrint(false)}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>🖨</span>
              <span>Imprimir</span>
            </button>
            <button
              onClick={() => handlePrint(true)}
              className="flex-1 bg-pink-600 text-white py-2 rounded hover:bg-pink-700"
            >
              Regalo
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
            left: 2mm;
            top: 0;
            width: 65mm;
            max-width: 300px;
            margin: 0 auto;
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
