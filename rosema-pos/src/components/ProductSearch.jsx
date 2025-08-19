import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductSelectionModal from './ProductSelectionModal';

/**
 * Componente de búsqueda de productos
 * Permite buscar productos por nombre o código y agregarlos al carrito
 */
const ProductSearch = ({ onAddToCart, disabled = false }) => {
  const { 
    products, 
    loading, 
    error, 
    searchProductsByTerm, 
    clearSearch,
    createSampleData,
    getProductStats
  } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showResults, setShowResults] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Estadísticas de productos
  const productStats = getProductStats();

  /**
   * Manejar búsqueda
   */
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchProductsByTerm(term);
      setShowResults(true);
    } else {
      setShowResults(false);
      clearSearch();
    }
  };

  /**
   * Manejar selección de producto
   */
  const handleProductSelect = (product) => {
    if (product.stock <= 0) {
      alert('Producto sin stock disponible');
      return;
    }
    
    // Si el producto tiene tallas o colores, mostrar modal de selección
    if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
      setSelectedProduct(product);
      setShowSelectionModal(true);
    } else {
      // Si no tiene opciones, agregar directamente
      onAddToCart(product, 1, null, null);
    }
    
    setSearchTerm('');
    setShowResults(false);
  };

  /**
   * Manejar confirmación desde el modal
   */
  const handleModalAddToCart = (product, quantity, size, color) => {
    onAddToCart(product, quantity, size, color);
    setShowSelectionModal(false);
    setSelectedProduct(null);
  };



  /**
   * Crear productos de ejemplo
   */
  const handleCreateSampleData = async () => {
    if (confirm('¿Crear productos de ejemplo? Esto agregará productos de prueba a la base de datos.')) {
      await createSampleData();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Agregar Prendas
        </h3>

      </div>

      {/* Barra de búsqueda */}
      <div className="relative mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={disabled || loading}
            className="input-rosema pr-10"
          />
          
          {/* Icono de búsqueda */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {showResults && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {products.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No se encontraron productos
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      product.stock <= 0 ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {product.name}
                        </h4>
                        {product.code && (
                          <p className="text-sm text-gray-500">
                            Código: {product.code}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-lg font-semibold text-green-600">
                            ${product.salePrice?.toLocaleString()}
                          </span>
                          <span className={`text-sm ${
                            product.stock <= 5 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            Stock: {product.stock}
                          </span>
                          {product.category && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {product.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {product.stock <= 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Sin Stock
                        </span>
                      )}
                    </div>
                    
                    {/* Tallas y colores disponibles */}
                    {(product.sizes || product.colors) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.sizes && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Tallas:</span>
                            {product.sizes.slice(0, 3).map((size, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                                {size}
                              </span>
                            ))}
                            {product.sizes.length > 3 && (
                              <span className="text-xs text-gray-400">+{product.sizes.length - 3}</span>
                            )}
                          </div>
                        )}
                        
                        {product.colors && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Colores:</span>
                            {product.colors.slice(0, 3).map((color, index) => (
                              <div
                                key={index}
                                className="w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                                title={color}
                              ></div>
                            ))}
                            {product.colors.length > 3 && (
                              <span className="text-xs text-gray-400">+{product.colors.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>



      {/* Acciones adicionales */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        
        
        {/* Botón para crear datos de ejemplo (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && productStats.totalProducts === 0 && (
          <button
            onClick={handleCreateSampleData}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            {loading ? 'Creando...' : 'Crear Productos de Ejemplo'}
          </button>
        )}
      </div>

      {/* Mostrar errores */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Modal de selección de producto */}
      <ProductSelectionModal
        product={selectedProduct}
        show={showSelectionModal}
        onClose={() => {
          setShowSelectionModal(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleModalAddToCart}
      />
    </div>
  );
};

export default ProductSearch;
