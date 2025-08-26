import React, { useState } from 'react';

/**
 * Modal mejorado para imprimir códigos de barras
 * Incluye opciones de precio y tamaño de etiqueta
 */
const BarcodeModal = ({ isOpen, onClose, product }) => {
  const [showPrice, setShowPrice] = useState(false);
  const [labelSize, setLabelSize] = useState('2x1'); // 2x1 pulgadas por defecto
  const [customPrice, setCustomPrice] = useState('');

  if (!isOpen || !product) return null;

  // Obtener precio promedio del producto
  const getAveragePrice = () => {
    if (!product.variantes || product.variantes.length === 0) {
      return product.precioCosto || 0;
    }
    const total = product.variantes.reduce((sum, variante) => sum + (variante.precioVenta || 0), 0);
    return Math.round(total / product.variantes.length);
  };

  const averagePrice = getAveragePrice();
  const displayPrice = customPrice ? parseFloat(customPrice) : averagePrice;

  // Generar las barras del código de barras (simulación visual)
  const generateBarcodePattern = (code) => {
    const patterns = [];
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      // Generar patrón basado en el carácter
      if (char.match(/[0-9]/)) {
        patterns.push('thin', 'thick', 'thin', 'thick');
      } else if (char.match(/[A-Z]/)) {
        patterns.push('thick', 'thin', 'thick', 'thin');
      } else {
        patterns.push('thin', 'thin', 'thick', 'thick');
      }
    }
    return patterns;
  };

  const barcodePattern = generateBarcodePattern(product.id);

  const handlePrint = () => {
    // Crear una ventana de impresión con el código de barras
    const printWindow = window.open('', '_blank');
    const labelWidth = labelSize === '2x1' ? '2in' : labelSize === '1.5x1' ? '1.5in' : '2.5in';
    const labelHeight = '1in';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código de Barras - ${product.articulo}</title>
          <style>
            @page {
              size: ${labelWidth} ${labelHeight};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 4px;
              font-family: Arial, sans-serif;
              width: ${labelWidth};
              height: ${labelHeight};
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              box-sizing: border-box;
            }
            .product-name {
              font-size: 8px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 2px;
              line-height: 1;
              max-height: 16px;
              overflow: hidden;
            }
            .barcode-container {
              display: flex;
              align-items: end;
              justify-content: center;
              margin: 2px 0;
            }
            .barcode {
              display: flex;
              align-items: end;
              height: 20px;
            }
            .bar {
              background-color: black;
              margin-right: 1px;
            }
            .bar.thin {
              width: 1px;
              height: 20px;
            }
            .bar.thick {
              width: 2px;
              height: 20px;
            }
            .code-text {
              font-size: 6px;
              font-weight: bold;
              text-align: center;
              margin-top: 1px;
              letter-spacing: 1px;
            }
            .price {
              font-size: 7px;
              font-weight: bold;
              text-align: center;
              margin-top: 1px;
            }
          </style>
        </head>
        <body>
          <div class="product-name">${product.articulo}</div>
          <div class="barcode-container">
            <div class="barcode">
              ${barcodePattern.map(pattern => `<div class="bar ${pattern}"></div>`).join('')}
            </div>
          </div>
          <div class="code-text">${product.id}</div>
          ${showPrice ? `<div class="price">$${displayPrice.toLocaleString()}</div>` : ''}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Esperar a que se cargue y luego imprimir
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Imprimir Código de Barras
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Vista previa del código de barras */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-6 text-center">
            <div className="text-xs font-bold mb-2 text-gray-800">
              {product.articulo}
            </div>
            
            {/* Código de barras visual */}
            <div className="flex justify-center items-end mb-2">
              <div className="flex items-end" style={{ height: '40px' }}>
                {barcodePattern.map((pattern, index) => (
                  <div
                    key={index}
                    className="bg-black mr-px"
                    style={{
                      width: pattern === 'thick' ? '3px' : '1px',
                      height: '40px'
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-xs font-bold mb-1 tracking-wider">
              {product.id}
            </div>
            
            {showPrice && (
              <div className="text-sm font-bold text-green-600">
                ${displayPrice.toLocaleString()}
              </div>
            )}
          </div>

          {/* Opciones de configuración */}
          <div className="space-y-4">
            {/* Tamaño de etiqueta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño de Etiqueta
              </label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value)}
                className="w-full input-rosema"
              >
                <option value="1.5x1">1.5" x 1" pulgadas</option>
                <option value="2x1">2" x 1" pulgadas (Recomendado)</option>
                <option value="2.5x1">2.5" x 1" pulgadas</option>
              </select>
            </div>

            {/* Mostrar precio */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPrice"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="showPrice" className="ml-2 text-sm text-gray-700">
                Incluir precio en la etiqueta
              </label>
            </div>

            {/* Precio personalizado */}
            {showPrice && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio a mostrar
                </label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder={`Precio promedio: $${averagePrice.toLocaleString()}`}
                  className="w-full input-rosema"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deja vacío para usar el precio promedio del producto
                </p>
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{product.articulo}</div>
              <div className="text-gray-600">Código: {product.id}</div>
              <div className="text-gray-600">Precio promedio: ${averagePrice.toLocaleString()}</div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 btn-rosema flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeModal;
