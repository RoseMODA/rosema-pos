import React, { useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useProviders } from '../hooks/useProviders';
import { useProductFilters } from '../hooks/useProductFilters';
import { useModals } from '../hooks/useModal';
import { calculateProductStats } from '../utils/calculations';
import { MESSAGES } from '../utils/constants';
import ProductForm from '../components/ProductForm';
import BarcodeModal from '../components/BarcodeModal';
import ProductsStats from '../components/Products/ProductsStats';
import ProductsFilters from '../components/Products/ProductsFilters';
import ProductsTable from '../components/Products/ProductsTable';
import ProductDetailsModal from '../components/Products/ProductDetailsModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

/**
 * Página de Productos del sistema POS Rosema - Refactorizada
 * Sistema CRUD completo para gestión de inventario
 */
const Products = () => {
  // Hooks de datos
  const {
    products,
    loading,
    error,
    loadProducts,
    addProduct,
    updateProductData,
    removeProduct,
    createSampleData
  } = useProducts();

  const { providers, loadProviders } = useProviders();

  // Hook de filtros
  const {
    searchTerm,
    categoryFilter,
    sortBy,
    sortOrder,
    filteredProducts,
    handleSearch,
    handleCategoryChange,
    handleSortChange,
    handleOrderChange,
    clearSearch
  } = useProductFilters(products);

  // Hook de modales
  const {
    openModal,
    closeModal,
    isModalOpen,
    getModalData
  } = useModals([
    'productForm',
    'productDetails',
    'deleteConfirm',
    'barcodePrint'
  ]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProducts();
    loadProviders();
  }, [loadProducts, loadProviders]);

  // Calcular estadísticas
  const stats = calculateProductStats(products);

  /**
   * Handlers de acciones
   */
  const handleCreateProduct = () => {
    openModal('productForm', { mode: 'create', product: null });
  };

  const handleEditProduct = (product) => {
    openModal('productForm', { mode: 'edit', product });
  };

  const handleViewProduct = (product) => {
    openModal('productDetails', product);
  };

  const handleDeleteProduct = (productId) => {
    openModal('deleteConfirm', productId);
  };

  const handlePrintBarcode = (product) => {
    openModal('barcodePrint', product);
  };

  const handleFormSubmit = async (productData) => {
    try {
      const modalData = getModalData('productForm');
      let createdProduct;
      
      if (modalData.mode === 'create') {
        createdProduct = await addProduct(productData);
        const shouldPrint = confirm(MESSAGES.SUCCESS.PRODUCT_CREATED + ' ¿Deseas imprimir el código de barras?');
        if (shouldPrint) {
          openModal('barcodePrint', createdProduct);
        }
      } else {
        await updateProductData(modalData.product.id, productData);
        alert(MESSAGES.SUCCESS.PRODUCT_UPDATED);
      }
      
      closeModal('productForm');
      await loadProducts();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      throw error;
    }
  };

  const confirmDeleteProduct = async () => {
    try {
      const productId = getModalData('deleteConfirm');
      await removeProduct(productId);
      closeModal('deleteConfirm');
      alert(MESSAGES.SUCCESS.PRODUCT_DELETED);
    } catch (error) {
      alert('Error al eliminar producto: ' + error.message);
    }
  };

  const handleCreateSampleData = async () => {
    if (confirm(MESSAGES.CONFIRM.CREATE_SAMPLE_DATA)) {
      try {
        await createSampleData();
        alert('Productos de ejemplo creados exitosamente');
      } catch (error) {
        alert('Error al crear productos: ' + error.message);
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-2">Gestión de inventario y catálogo</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCreateProduct}
            className="btn-rosema flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Agregar Producto</span>
          </button>

          <button className="btn-secondary flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Imprimir Códigos</span>
          </button>
        </div>
      </div>

      {/* Estadísticas de productos */}
      <ProductsStats stats={stats} />

      {/* Filtros y búsqueda */}
      <ProductsFilters
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={handleSearch}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onOrderChange={handleOrderChange}
        onClearSearch={clearSearch}
      />

      {/* Lista de productos */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Catálogo de Productos ({filteredProducts.length})
            </h2>
            {products.length === 0 && (
              <button
                onClick={handleCreateSampleData}
                className="btn-secondary text-sm"
              >
                Crear productos de ejemplo
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Cargando productos..." />
        ) : error ? (
          <ErrorMessage 
            message={`Error al cargar productos: ${error}`}
            onRetry={loadProducts}
          />
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600 mb-4">
              {products.length === 0 ? 'No hay productos registrados' : 'No se encontraron productos con los filtros aplicados'}
            </p>
            {products.length === 0 && (
              <div className="space-x-3">
                <button onClick={handleCreateProduct} className="btn-rosema">
                  Agregar Primer Producto
                </button>
                <button onClick={handleCreateSampleData} className="btn-secondary">
                  Crear Productos de Ejemplo
                </button>
              </div>
            )}
          </div>
        ) : (
          <ProductsTable
            products={filteredProducts}
            providers={providers}
            onView={handleViewProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onPrintBarcode={handlePrintBarcode}
          />
        )}
      </div>

      {/* Modales */}
      <ProductForm
        isOpen={isModalOpen('productForm')}
        onClose={() => closeModal('productForm')}
        onSubmit={handleFormSubmit}
        product={getModalData('productForm')?.product}
        mode={getModalData('productForm')?.mode || 'create'}
      />

      {/* Modal de confirmación de eliminación */}
      {isModalOpen('deleteConfirm') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">⚠️</span>
                <h4 className="text-lg font-semibold text-gray-900">
                  Confirmar Eliminación
                </h4>
              </div>
              <p className="text-gray-600 mb-6">
                {MESSAGES.CONFIRM.DELETE_PRODUCT}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => closeModal('deleteConfirm')}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProductDetailsModal
        isOpen={isModalOpen('productDetails')}
        onClose={() => closeModal('productDetails')}
        product={getModalData('productDetails')}
        providers={providers}
        onEdit={handleEditProduct}
        onPrintBarcode={handlePrintBarcode}
      />

      <BarcodeModal
        isOpen={isModalOpen('barcodePrint')}
        onClose={() => closeModal('barcodePrint')}
        product={getModalData('barcodePrint')}
      />
    </div>
  );
};

export default Products;