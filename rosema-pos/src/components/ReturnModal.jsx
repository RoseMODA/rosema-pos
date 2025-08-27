import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import ReturnProductModal from './ReturnProductModal';

/**
 * Modal para realizar cambios de prenda (devoluciones)
 * Actualizado para manejar variantes de productos
 * CORREGIDO: Mantiene resultados de búsqueda independientes
 */
const ReturnModal = ({ isOpen, onClose, onAddReturn }) => {
  const {
    loading: productsLoading,
    searchProductsByTerm,
    getProductByCode
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReturnProductModal, setShowReturnProductModal] = useState(false);

  /**
   * Manejar búsqueda de productos (prioriza coincidencias exactas por ID)
   * CORREGIDO: Mantiene los resultados en estado local
   */
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await searchProductsByTerm(term);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setSearchResults([]);
        setShowResults(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  /**
   * Manejar escaneo de código de barras
   */
  const handleBarcodeScan = async (barcode) => {
    try {
      console.log('🔍 Buscando producto por código para devolución:', barcode);
      const product = await getProductByCode(barcode);
      if (!product) {
        alert('Producto no encontrado');
        return;
      }

      handleProductSelect(product);
    } catch (error) {
      console.error('Error al buscar producto por código:', error);
      alert(`Error al buscar producto: ${error.message}`);
    }
  };

  /**
   * Seleccionar producto para devolución
   */
  const handleProductSelect = (product) => {
    console.log('📦 Producto seleccionado para devolución:', product);

    if (!product.variantes || product.variantes.length === 0) {
      alert('El producto no tiene variantes disponibles');
      return;
    }

    // Para devoluciones, abrir modal de selección de variante
    // (permite seleccionar variantes con stock 0)
    setSelectedProduct(product);
    setShowReturnProductModal(true);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  /**
   * Manejar devolución desde el modal de variantes
   */
  const handleReturnFromModal = (returnData) => {
    console.log('✅ Devolución procesada:', returnData);
    onAddReturn(returnData);
    setShowReturnProductModal(false);
    setSelectedProduct(null);
  };

  /**
   * Cerrar modal y limpiar estado
   */
  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedProduct(null);
    setShowReturnProductModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-red-600 mr-2">🔄</span>
              Cambio de Prenda
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <div className="p-6">
            {/* Instrucciones */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-blue-600 mt-0.5 mr-2">ℹ️</span>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Flujo de Cambio de Prenda</p>
                  <p className="text-xs text-blue-700 mt-1">
                    1. Escanee o busque el código de barras del producto a devolver<br />
                    2. Seleccione la variante exacta (talle y color)<br />
                    3. Configure el descuento aplicado si corresponde<br />
                    4. El stock se incrementará automáticamente al finalizar
                  </p>
                </div>
              </div>
            </div>

            {/* Búsqueda de producto */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Producto a Devolver
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Escanee o escriba el código de barras del producto..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full input-rosema pl-10"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>

                {/* Resultados de búsqueda */}
                {showResults && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {productsLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Buscando productos...</p>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p>No se encontraron productos</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => handleProductSelect(product)}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {product.articulo || product.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Código: {product.id}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-lg font-semibold text-green-600">
                                    {product.variantes && product.variantes.length > 0 ? (
                                      `$${Math.min(...product.variantes.map(v => v.precioVenta)).toLocaleString()} - $${Math.max(...product.variantes.map(v => v.precioVenta)).toLocaleString()}`
                                    ) : (
                                      'Sin precio'
                                    )}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {product.variantes?.length || 0} variantes
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Información importante */}
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-orange-600 mt-0.5 mr-2">⚠️</span>
                <div>
                  <p className="text-sm text-orange-800 font-medium">Política de Cambios</p>
                  <p className="text-xs text-orange-700 mt-1">
                    • Se pueden seleccionar variantes sin stock (para devoluciones)<br />
                    • El valor se ajusta según el descuento aplicado en la venta original<br />
                    • El stock se incrementa automáticamente al finalizar la operación
                  </p>
                </div>
              </div>
            </div>

            {/* Botón cerrar */}
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de selección de variante para devolución */}
      <ReturnProductModal
        product={selectedProduct}
        show={showReturnProductModal}
        onClose={() => {
          setShowReturnProductModal(false);
          setSelectedProduct(null);
        }}
        onAddReturn={handleReturnFromModal}
      />
    </>
  );
};

export default ReturnModal;
