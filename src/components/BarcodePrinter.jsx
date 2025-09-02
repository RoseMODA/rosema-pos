import React, { useRef, useEffect, useState } from 'react';
import JsBarcode from 'jsbarcode';

/**
 * Componente para generar e imprimir códigos de barras
 * Optimizado para impresoras térmicas Xprinter en formato 2x1 pulgadas
 * Genera códigos de barras en SVG y PNG listos para imprimir
 */
const BarcodePrinter = ({
  isOpen,
  onClose,
  product,
  barcodeValue,
  productName,
  price,
  showPreview = true
}) => {
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const [barcodeDataUrl, setBarcodeDataUrl] = useState('');
  const [svgContent, setSvgContent] = useState('');

  // Configuración optimizada para impresoras térmicas Xprinter
  const barcodeConfig = {
    format: "CODE39", // Formato más compatible con impresoras térmicas
    width: 2, // Ancho de las barras
    height: 60, // Altura del código de barras
    displayValue: true, // Mostrar el valor debajo del código
    fontSize: 12, // Tamaño de fuente para el texto
    textAlign: "center", // Alineación del texto
    textPosition: "bottom", // Posición del texto
    textMargin: 5, // Margen del texto
    fontOptions: "bold", // Opciones de fuente
    font: "Arial", // Fuente
    background: "#ffffff", // Fondo blanco
    lineColor: "#000000", // Color de las barras (negro)
    margin: 10, // Margen alrededor del código
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10
  };

  // Generar código de barras cuando se abre el modal
  useEffect(() => {
    if (isOpen && (barcodeValue || product?.id)) {
      generateBarcode();
    }
  }, [isOpen, barcodeValue, product]);

  const generateBarcode = () => {
    const code = barcodeValue || product?.id || '';
    const name = productName || product?.articulo || product?.name || '';
    const productPrice = price || product?.precioCosto || 0;

    if (!code) {
      console.error('No hay código de barras para generar');
      return;
    }

    try {
      // Generar SVG
      if (svgRef.current) {
        JsBarcode(svgRef.current, code, {
          ...barcodeConfig,
          width: 2.5, // Ancho ligeramente mayor para SVG
          height: 70
        });
        setSvgContent(svgRef.current.outerHTML);
      }

      // Generar Canvas/PNG
      if (canvasRef.current) {
        // Configurar canvas para 2x1 pulgadas a 203 DPI (resolución típica de impresoras térmicas)
        const canvas = canvasRef.current;
        const dpi = 203; // DPI de impresoras térmicas Xprinter
        const widthInches = 2;
        const heightInches = 1;

        canvas.width = widthInches * dpi; // 406 pixels
        canvas.height = heightInches * dpi; // 203 pixels

        // Limpiar canvas
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generar código de barras en canvas
        JsBarcode(canvas, code, {
          ...barcodeConfig,
          width: 2, // Ancho optimizado para 2 pulgadas
          height: 80, // Altura optimizada
          fontSize: 14,
          margin: 15
        });

        // Agregar información adicional del producto
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';

        // Nombre del producto (truncado si es muy largo)
        if (name) {
          const truncatedName = name.length > 25 ? name.substring(0, 25) + '...' : name;
          ctx.fillText(truncatedName, canvas.width / 2, canvas.height - 40);
        }

        // Precio
        if (productPrice > 0) {
          ctx.font = 'bold 14px Arial';
          ctx.fillText(`$${productPrice.toLocaleString()}`, canvas.width / 2, canvas.height - 20);
        }

        // Convertir a Data URL para descarga
        setBarcodeDataUrl(canvas.toDataURL('image/png', 1.0));
      }
    } catch (error) {
      console.error('Error generando código de barras:', error);
      alert('Error al generar el código de barras. Verifique que el código sea válido.');
    }
  };

  const handlePrint = () => {
    // Crear ventana de impresión optimizada para etiquetas
    const printWindow = window.open('', '_blank');
    const code = barcodeValue || product?.id || '';
    const name = productName || product?.articulo || product?.name || '';
    const productPrice = price || product?.precioCosto || 0;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código de Barras - ${code}</title>
          <style>
            @page {
              size: 2in 1in; /* Tamaño de etiqueta 2x1 pulgadas */
              margin: 0.1in; /* Margen mínimo */
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
                width: 2in;
                height: 1in;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
                background: white;
              }
              
              .barcode-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
              }
              
              .barcode-svg {
                max-width: 1.8in;
                max-height: 0.6in;
              }
              
              .product-info {
                text-align: center;
                margin-top: 2px;
              }
              
              .product-name {
                font-size: 8px;
                font-weight: bold;
                margin: 1px 0;
                max-width: 1.8in;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              
              .product-price {
                font-size: 10px;
                font-weight: bold;
                margin: 1px 0;
              }
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            
            .preview-container {
              border: 2px dashed #ccc;
              padding: 20px;
              margin: 20px 0;
              background: #f9f9f9;
            }
            
            .print-button {
              background: #d62818;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              margin: 10px;
            }
            
            .print-button:hover {
              background: #b71c0c;
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <h3>Vista Previa - Etiqueta 2x1 pulgadas</h3>
            <div class="barcode-container">
              ${svgContent}
              <div class="product-info">
                ${name ? `<div class="product-name">${name.length > 30 ? name.substring(0, 30) + '...' : name}</div>` : ''}
                ${productPrice > 0 ? `<div class="product-price">$${productPrice.toLocaleString()}</div>` : ''}
              </div>
            </div>
          </div>
          
          <button class="print-button" onclick="window.print()">
            🖨️ Imprimir Etiqueta
          </button>
          
          <button class="print-button" onclick="window.close()" style="background: #666;">
            ❌ Cerrar
          </button>
          
          <script>
            // Auto-imprimir después de cargar (opcional)
            // window.onload = function() {
            //   setTimeout(function() {
            //     window.print();
            //   }, 500);
            // };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDownloadPNG = () => {
    if (barcodeDataUrl) {
      const link = document.createElement('a');
      link.download = `barcode-${barcodeValue || product?.id || 'codigo'}.png`;
      link.href = barcodeDataUrl;
      link.click();
    }
  };

  const handleDownloadSVG = () => {
    if (svgContent) {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `barcode-${barcodeValue || product?.id || 'codigo'}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen) return null;

  const code = barcodeValue || product?.id || '';
  const name = productName || product?.articulo || product?.name || '';
  const productPrice = price || product?.precioCosto || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🏷️ Imprimir Código de Barras
            </h2>
            <p className="text-gray-600 mt-1">
              Optimizado para impresoras térmicas Xprinter - Formato 2x1 pulgadas
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Información del producto */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Información del Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Código:</span>
                <p className="text-gray-900">{code}</p>
              </div>
              {name && (
                <div>
                  <span className="font-medium text-gray-700">Producto:</span>
                  <p className="text-gray-900">{name}</p>
                </div>
              )}
              {productPrice > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Precio:</span>
                  <p className="text-gray-900">${productPrice.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vista previa */}
          {showPreview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vista previa SVG */}
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-white">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Formato SVG (Vector)</h4>
                  <div className="flex justify-center items-center min-h-[120px] bg-gray-50 rounded">
                    <svg ref={svgRef}></svg>
                  </div>
                </div>

                {/* Vista previa Canvas/PNG */}
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-white">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Formato PNG (2x1 pulgadas)</h4>
                  <div className="flex justify-center items-center min-h-[120px] bg-gray-50 rounded">
                    <canvas
                      ref={canvasRef}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        border: '1px solid #ddd'
                      }}
                    ></canvas>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Especificaciones técnicas */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Especificaciones Técnicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p><strong>Tamaño:</strong> 2x1 pulgadas (50.8x25.4 mm)</p>
                <p><strong>Resolución:</strong> 203 DPI</p>
                <p><strong>Formato:</strong> CODE39</p>
              </div>
              <div>
                <p><strong>Compatible con:</strong> Impresoras térmicas Xprinter</p>
                <p><strong>Papel recomendado:</strong> Etiquetas térmicas adhesivas</p>
                <p><strong>Colores:</strong> Negro sobre blanco</p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              🖨️ Imprimir Etiqueta
            </button>

            <button
              onClick={handleDownloadPNG}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📥 Descargar PNG
            </button>

            <button
              onClick={handleDownloadSVG}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📥 Descargar SVG
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ❌ Cerrar
            </button>
          </div>

          {/* Instrucciones de uso */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">💡 Instrucciones de Uso</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p><strong>1.</strong> Conecta tu impresora térmica Xprinter y asegúrate de que esté configurada correctamente.</p>
              <p><strong>2.</strong> Carga etiquetas térmicas de 2x1 pulgadas en la impresora.</p>
              <p><strong>3.</strong> Haz clic en "🖨️ Imprimir Etiqueta" para abrir la vista de impresión optimizada.</p>
              <p><strong>4.</strong> En la ventana de impresión, selecciona tu impresora térmica y ajusta la configuración si es necesario.</p>
              <p><strong>5.</strong> También puedes descargar los archivos PNG o SVG para usar en otros programas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrinter;
