import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useProviders } from '../hooks/useProviders';
import ProductForm from '../components/ProductForm';
import BarcodeModal from '../components/BarcodeModal';

/**
 * Página de Productos del sistema POS Rosema
 * Sistema CRUD completo para gestión de inventario (Etapa 4)
 *  */
const Products = () => {
  const {
    products,
    loading,
    error,
    loadProducts,
    searchProductsByTerm,
    addProduct,
    updateProductData,
    removeProduct,
    getProductStats,
    createSampleData
  } = useProducts();

  const { providers, loadProviders } = useProviders();

  // Estados locales
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('asc');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    categories: {}
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [productToPrint, setProductToPrint] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProducts();
    loadProviders();
  }, [loadProducts, loadProviders]);

  // Actualizar estadísticas cuando cambien los productos
  useEffect(() => {
    const productStats = getProductStats();
    setStats(productStats);
  }, [products, getProductStats]);

  /**
   * Filtrar y ordenar productos
   */
  const getFilteredAndSortedProducts = () => {
    let filtered = products;

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.categoria === categoryFilter);
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.articulo?.toLowerCase().includes(term) ||
        product.id?.toLowerCase().includes(term) ||
        product.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'created':
          // Ordenar por fecha de creación (más recientes primero)
          aValue = a.createdAt ? new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt) : new Date(0);
          bValue = b.createdAt ? new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt) : new Date(0);
          return bValue - aValue; // Más recientes primero
        case 'name':
          aValue = a.articulo || '';
          bValue = b.articulo || '';
          break;
        case 'price':
          aValue = a.precioCosto || 0;
          bValue = b.precioCosto || 0;
          break;
        case 'stock':
          aValue = a.variantes?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
          bValue = b.variantes?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
          break;
        case 'category':
          aValue = a.categoria || '';
          bValue = b.categoria || '';
          break;
        default:
          // Por defecto, ordenar por fecha de creación
          aValue = a.createdAt ? new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt) : new Date(0);
          bValue = b.createdAt ? new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt) : new Date(0);
          return bValue - aValue;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  };

  /**
   * Obtener nombre del proveedor
   */
  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.proveedor : 'Proveedor no encontrado';
  };

  /**
   * Calcular stock total de un producto
   */
  const getTotalStock = (product) => {
    if (!product.variantes || !Array.isArray(product.variantes)) return 0;
    return product.variantes.reduce((sum, variante) => sum + (variante.stock || 0), 0);
  };

  /**
   * Obtener precio promedio de venta
   */
  const getAveragePrice = (product) => {
    if (!product.variantes || !Array.isArray(product.variantes) || product.variantes.length === 0) {
      return product.precioCosto || 0;
    }
    const total = product.variantes.reduce((sum, variante) => sum + (variante.precioVenta || 0), 0);
    return Math.round(total / product.variantes.length);
  };

  /**
   * Manejar búsqueda
   */
  const handleSearch = (term) => {
    setSearchTerm(term);
    // La búsqueda se maneja en getFilteredAndSortedProducts()
    // No necesitamos llamar a la API aquí
  };

  /**
   * Abrir formulario para crear producto
   */
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setFormMode('create');
    setShowProductForm(true);
  };

  /**
   * Abrir formulario para editar producto
   */
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormMode('edit');
    setShowProductForm(true);
  };

  /**
   * Manejar envío del formulario
   */
  const handleFormSubmit = async (productData) => {
    try {
      let createdProduct;
      if (formMode === 'create') {
        createdProduct = await addProduct(productData);
        // Mostrar opción de imprimir código después de crear
        const shouldPrint = confirm('Producto creado exitosamente. ¿Deseas imprimir el código de barras?');
        if (shouldPrint) {
          setProductToPrint(createdProduct);
          setShowPrintModal(true);
        }
      } else {
        await updateProductData(editingProduct.id, productData);
        alert('Producto actualizado exitosamente');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      await loadProducts(); // Recargar lista
    } catch (error) {
      console.error('Error al guardar producto:', error);
      throw error; // Re-lanzar para que ProductForm maneje el error
    }
  };

  /**
   * Eliminar producto
   */
  const handleDeleteProduct = async (productId) => {
    try {
      await removeProduct(productId);
      setShowDeleteConfirm(null);
      alert('Producto eliminado exitosamente');
    } catch (error) {
      alert('Error al eliminar producto: ' + error.message);
    }
  };

  /**
   * Ver detalles del producto
   */
  const handleViewProduct = (product) => {
    setViewingProduct(product);
  };

  /**
   * Imprimir código de barras
   *   */
  const handlePrintBarcode = (product) => {
    setProductToPrint(product);
    setShowPrintModal(true);
  };

  /**
   * Crear productos de ejemplo
   */
  const handleCreateSampleData = async () => {
    if (confirm('¿Crear productos de ejemplo? Esto agregará productos de prueba a la base de datos.')) {
      try {
        await createSampleData();
        alert('Productos de ejemplo creados exitosamente');
      } catch (error) {
        alert('Error al crear productos: ' + error.message);
      }
    }
  };

  const filteredProducts = getFilteredAndSortedProducts();

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.totalProducts}</div>
          <div className="text-gray-600">Total Productos</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalStock}</div>
          <div className="text-gray-600">Stock Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.lowStockProducts}</div>
          <div className="text-gray-600">Stock Bajo</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.outOfStockProducts}</div>
          <div className="text-gray-600">Sin Stock</div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por código, nombre o tags..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full input-rosema pl-10"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filtro por categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-rosema"
          >
            <option value="all">Todas las categorías</option>
            <option value="mujer">Mujer</option>
            <option value="hombre">Hombre</option>
            <option value="niños-bebes">Niños-Bebés</option>
            <option value="otros">Otros</option>
          </select>

          {/* Ordenar por */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-rosema"
          >
            <option value="created">Más Recientes</option>
            <option value="name">Ordenar por Nombre</option>
            <option value="price">Ordenar por Precio</option>
            <option value="stock">Ordenar por Stock</option>
            <option value="category">Ordenar por Categoría</option>
          </select>

          {/* Orden */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input-rosema"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>

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
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">Error al cargar productos: {error}</p>
            <button onClick={loadProducts} className="btn-rosema">
              Reintentar
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const totalStock = getTotalStock(product);
                  const averagePrice = getAveragePrice(product);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.articulo || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Código: {product.id}
                          </div>
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="text-xs text-gray-400">+{product.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.categoria || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getProviderName(product.proveedorId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(product.precioCosto || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${averagePrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${totalStock === 0
                          ? 'bg-red-100 text-red-800'
                          : totalStock <= 5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {totalStock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.createdAt ? (
                          <div>
                            <div className="font-medium">
                              {new Date(product.createdAt.seconds ? product.createdAt.seconds * 1000 : product.createdAt).toLocaleDateString('es-ES')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(product.createdAt.seconds ? product.createdAt.seconds * 1000 : product.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin fecha</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Ver detalles"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handlePrintBarcode(product)}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="Imprimir código"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(product.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de formulario de producto */}
      <ProductForm
        isOpen={showProductForm}
        onClose={() => {
          setShowProductForm(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        mode={formMode}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h4 className="text-lg font-semibold text-gray-900">
                  Confirmar Eliminación
                </h4>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteProduct(showDeleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de ver producto */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalles del Producto
              </h3>
              <button
                onClick={() => setViewingProduct(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Código de Barras</label>
                  <p className="text-gray-900 font-mono text-lg">{viewingProduct.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nombre del Artículo</label>
                  <p className="text-gray-900 text-lg">{viewingProduct.articulo}</p>
                </div>
              </div>

              {viewingProduct.descripcion && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Descripción</label>
                  <p className="text-gray-900">{viewingProduct.descripcion}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Categoría</label>
                  <p className="text-gray-900">{viewingProduct.categoria}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Temporada</label>
                  <p className="text-gray-900">{viewingProduct.temporada || 'No especificada'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Proveedor</label>
                  <p className="text-gray-900">{getProviderName(viewingProduct.proveedorId)}</p>
                </div>
              </div>

              {/* Subcategorías */}
              {viewingProduct.subcategorias && viewingProduct.subcategorias.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Subcategorías</label>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.subcategorias.map(sub => (
                      <span key={sub} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.tags.map(tag => (
                      <span key={tag} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Imágenes del producto */}
              {viewingProduct.imagenes && viewingProduct.imagenes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-3">Imágenes del Producto</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {viewingProduct.imagenes.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`${viewingProduct.articulo} - Imagen ${index + 1}`}
                          className="w-full object-contain rounded-lg border border-gray-200 max-h-64"
                          onClick={() => window.open(url, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                          <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Precios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Precio de Costo</label>
                  <p className="text-gray-900 text-lg font-semibold">${(viewingProduct.precioCosto || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Precio de Venta Promedio</label>
                  <p className="text-green-600 text-lg font-semibold">${getAveragePrice(viewingProduct).toLocaleString()}</p>
                </div>
              </div>

              {/* Variantes */}
              {viewingProduct.variantes && viewingProduct.variantes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-3">Variantes</label>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Talla</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Color</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Stock</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Precio Venta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingProduct.variantes.map((variante, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="px-4 py-2">{variante.talle || 'N/A'}</td>
                            <td className="px-4 py-2">{variante.color || 'N/A'}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${variante.stock === 0
                                ? 'bg-red-100 text-red-800'
                                : variante.stock <= 5
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                                }`}>
                                {variante.stock || 0}
                              </span>
                            </td>
                            <td className="px-4 py-2">${(variante.precioVenta || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handlePrintBarcode(viewingProduct)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Imprimir Código</span>
                </button>
                <button
                  onClick={() => {
                    setViewingProduct(null);
                    handleEditProduct(viewingProduct);
                  }}
                  className="btn-rosema flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imprimir código de barras */}
      <BarcodeModal
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          setProductToPrint(null);
        }}
        product={productToPrint}
      />
    </div>
  );
};

export default Products;