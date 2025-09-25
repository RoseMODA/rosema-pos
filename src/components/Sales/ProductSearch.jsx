import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import SearchBar from '../common/SearchBar.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { formatVariantPriceRange } from '../../utils/salesHelpers.js';

const ProductSearch = forwardRef(({
  searchTerm,
  searchResults,
  showResults,
  productsLoading,
  productStats,
  onSearch,
  onProductSelect,
  onCreateSampleData,
  onQuickItemClick
}, ref) => {
  const searchBarRef = useRef(null);

  // 🔑 Exponer el focus al padre (Sales.jsx)
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (searchBarRef.current) {
        searchBarRef.current.focus();
      }
    }
  }));

  const handleSelectProduct = (product) => {
    onProductSelect(product);
    onSearch(''); // limpiar búsqueda
    if (searchBarRef.current) {
      searchBarRef.current.focus(); // volver a enfocar al seleccionar
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-xl mr-2">𝄃𝄂𝄀𝄁𝄃𝄂𝄂𝄃</span>
          Buscar Productos
        </h3>

        <button
          onClick={onQuickItemClick}
          className="btn-rosema bg-violet-800 hover:bg-violet-700 text-white font-bold text-lm py-3 px-6 rounded-lg transition-colors"
        >
          <span>+</span>
          <span>Artículo Rápido [ F9 ]</span>
        </button>
      </div>

      <div className="relative">
        <SearchBar
          ref={searchBarRef}
          value={searchTerm}
          onChange={onSearch}
          placeholder="Buscar por código o nombre del producto..."
          autoFocus={true}
        />

        {/* Resultados de búsqueda */}
        {showResults && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {productsLoading ? (
              <div className="p-4">
                <LoadingSpinner size="sm" text="Buscando productos..." />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No se encontraron productos</p>
                {productStats.totalProducts === 0 && (
                  <button
                    onClick={onCreateSampleData}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Crear productos de ejemplo
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {searchResults.map((product) => (
                  <ProductSearchItem
                    key={product.id}
                    product={product}
                    onSelect={() => handleSelectProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

const ProductSearchItem = ({ product, onSelect }) => {
  const totalStock = product.variantes?.reduce(
    (sum, v) => sum + (v.stock || 0),
    0
  ) || 0;

  return (
    <div
      onClick={onSelect}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${totalStock <= 0 ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">
            {product.articulo || product.name}
          </h4>
          <p className="text-sm text-gray-500">Código: {product.id}</p>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-lg font-semibold text-green-600">
              {formatVariantPriceRange(product.variantes)}
            </span>
            <span
              className={`text-sm ${totalStock <= 5 ? 'text-red-600' : 'text-gray-600'}`}
            >
              Stock: {totalStock}
            </span>
            {product.categoria && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {product.categoria}
              </span>
            )}
          </div>
        </div>

        {totalStock <= 0 && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
            Sin Stock
          </span>
        )}
      </div>

      {/* Variantes disponibles */}
      {product.variantes && product.variantes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">Variantes:</span>
            {product.variantes.slice(0, 3).map((variant, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded"
              >
                {variant.talle}
                {variant.color ? ` - ${variant.color}` : ''} ({variant.stock})
              </span>
            ))}
            {product.variantes.length > 3 && (
              <span className="text-xs text-gray-400">
                +{product.variantes.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
