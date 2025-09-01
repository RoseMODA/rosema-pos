import React from 'react';
import { useProducts } from '../hooks/useProducts';

import { useSales } from '../hooks/useSales';
import { useProductSearch } from '../hooks/useProductSearch';
import { useModals } from '../hooks/useModal';
import {
  formatSessionsForUI,
  validateSaleBeforeProcessing,
  generateSaleConfirmationMessage,
  prepareReceiptData
} from '../utils/salesHelpers';
import { MESSAGES } from '../utils/constants';
import QuickItemModal from '../components/QuickItemModal';
import SalesHistoryModal from '../components/SalesHistoryModal';
import ReturnModal from '../components/ReturnModal';
import PrintReceiptModal from '../components/PrintReceiptModal';
import ProductSelectionModal from '../components/ProductSelectionModal';
import ProductSearch from '../components/Sales/ProductSearch';
import SessionTabs from '../components/Sales/SessionTabs';
import PaymentForm from '../components/Sales/PaymentForm';
import SalesCart from '../components/Sales/SalesCart';

/**
 * Página principal del sistema de ventas - Completamente Refactorizada
 * Sistema de ventas con layout de dos columnas y manejo de variantes
 */
const Sales = () => {
  // Hooks de datos
  const {
    products,
    loading: productsLoading,
    createSampleData,
    getProductStats,
    getProductByBarcode
  } = useProducts();

  const {
    sessions,
    activeSessionId,
    cart,
    paymentMethod,
    discountPercent,
    cashReceived,
    customerName,
    cardName,
    installments,
    commission,
    totals,
    loading: salesLoading,
    createSession,
    switchSession,
    cancelSession,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    finalizeSession,
    setPaymentMethod,
    setDiscountPercent,
    setCashReceived,
    setCustomerName,
    setCardName,
    setInstallments,
    setCommission,
    addQuickItem,
    addReturnItem,
    resetAllSessions,
  } = useSales();

  // Hook de búsqueda de productos
  const {
    searchTerm,
    searchResults,
    showResults,
    handleSearch,
    handleProductSelect: handleProductSearchSelect,
    handleBarcodeScan
  } = useProductSearch(products, handleProductSelection);

  // Hook de modales
  const {
    openModal,
    closeModal,
    isModalOpen,
    getModalData
  } = useModals([
    'quickItem',
    'return',
    'history',
    'print',
    'productSelection'
  ]);

  // Convertir sesiones para UI
  const pendingSales = formatSessionsForUI(sessions);
  const productStats = getProductStats();

  /**
   * Handlers de acciones
   */
  function handleProductSelection(product, quantity = 1, variant = null, needsModal = false) {
    if (needsModal) {
      openModal('productSelection', product);
    } else {
      addToCart(product, quantity, variant);
    }
  }

  const handleVariantSelection = (product, quantity, variant) => {
    console.log('✅ Variante seleccionada:', { product: product.articulo, variant, quantity });
    addToCart(product, quantity, variant);
    closeModal('productSelection');
  };

  const handleNewSale = () => {
    try {
      const sessionCount = Object.keys(sessions).length;
      const newSessionId = createSession(`Cliente ${sessionCount + 1}`);
      console.log('Nueva sesión creada:', newSessionId);
    } catch (error) {
      console.error('Error al crear nueva venta:', error);
      alert(`Error al crear nueva venta: ${error.message}`);
    }
  };

  const Sales = () => {
    const { resetAllSessions } = useSales();

    return (
      <div className="flex justify-end mb-4">
        <Button variant="destructive" onClick={resetAllSessions}>
          Limpiar Todo
        </Button>
      </div>
    );
  };


  const handleProcessSale = async () => {
    try {
      const validation = validateSaleBeforeProcessing(cart, totals);
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }

      const confirmMessage = generateSaleConfirmationMessage(totals, paymentMethod, discountPercent);
      if (!confirm(confirmMessage)) {
        return;
      }

      const sale = await finalizeSession(activeSessionId);
      alert(MESSAGES.SUCCESS.SALE_PROCESSED || 'Venta procesada exitosamente');
      console.log('Venta completada:', sale);
    } catch (error) {
      alert(`Error al procesar venta: ${error.message}`);
    }
  };

  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      alert('No hay productos en el carrito para imprimir');
      return;
    }

    const receiptData = prepareReceiptData(cart, totals, paymentMethod, customerName, cashReceived);
    console.log('📄 Datos del recibo preparados:', receiptData);
    openModal('print', receiptData);
  };

  const handleCreateSampleData = async () => {
    if (confirm(MESSAGES.CONFIRM.CREATE_SAMPLE_DATA)) {
      try {
        await createSampleData();
        alert('Productos de ejemplo creados exitosamente');
      } catch (error) {
        alert(`Error al crear productos: ${error.message}`);
      }
    }
  };

  return (
    <div key={activeSessionId} className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Ventas</h1>
          <p className="text-gray-600">Busca productos y agrégalos al carrito para procesar una venta</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleNewSale}
            className="btn-rosema flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Nueva Venta</span>
          </button>

          <button
            onClick={() => openModal('history')}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>🕒</span>
            <span>Historial de Ventas</span>
          </button>

          <button
            onClick={resetAllSessions}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            🗑️ Limpiar Todo
          </button>
        </div>


      </div>



      {/* Tabs de sesiones */}
      <SessionTabs
        sessions={pendingSales}
        activeSessionId={activeSessionId}
        onSessionChange={switchSession}
        onDeleteSession={cancelSession}
        onNewSession={handleNewSale}
      />

      {/* Layout principal de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda - Búsqueda y formulario de pago */}
        <div className="space-y-6">
          {/* Búsqueda de productos */}
          <ProductSearch
            searchTerm={searchTerm}
            searchResults={searchResults}
            showResults={showResults}
            productsLoading={productsLoading}
            productStats={productStats}
            onSearch={handleSearch}
            onProductSelect={handleProductSearchSelect}
            onCreateSampleData={handleCreateSampleData}
            onQuickItemClick={() => openModal('quickItem')}
          />

          {/* Botón de cambio de prenda */}
          <button
            onClick={() => openModal('return')}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            🔄 Realizar Cambio de Prenda
          </button>

          {/* Formulario de pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <span className="text-xl mr-2">💳</span>
              Información de Pago
            </h3>

            <PaymentForm
              paymentMethod={paymentMethod}
              discountPercent={discountPercent}
              cashReceived={cashReceived}
              cardName={cardName}
              installments={installments}
              commission={commission}
              totals={totals}
              onPaymentMethodChange={setPaymentMethod}
              onDiscountChange={setDiscountPercent}
              onCashReceivedChange={setCashReceived}
              onCardNameChange={setCardName}
              onInstallmentsChange={setInstallments}
              onCommissionChange={setCommission}
            />

            {/* Botones de acción */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 btn-secondary flex items-center justify-center space-x-2"
              >
                <span>🖨️</span>
                <span>Imprimir recibo</span>
              </button>

              <button
                onClick={handleProcessSale}
                disabled={salesLoading || cart.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {salesLoading ? "Procesando..." : "💰 Procesar Venta"}
              </button>
            </div>
          </div>
        </div>

        {/* Columna derecha - Carrito detallado */}
        <SalesCart
          cart={cart}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          onUpdateQuantity={updateCartItemQuantity}
          onRemoveItem={removeFromCart}
        />
      </div>

      {/* Modales */}
      <QuickItemModal
        isOpen={isModalOpen('quickItem')}
        onClose={() => closeModal('quickItem')}
        onAddItem={(itemData) => {
          addQuickItem(itemData);
          closeModal('quickItem');
        }}
      />

      <SalesHistoryModal
        isOpen={isModalOpen('history')}
        onClose={() => closeModal('history')}
      />

      <ReturnModal
        isOpen={isModalOpen('return')}
        onClose={() => closeModal('return')}
        onAddReturn={(returnData) => {
          addReturnItem(returnData);
          closeModal('return');
        }}
      />

      <PrintReceiptModal
        isOpen={isModalOpen('print')}
        onClose={() => closeModal('print')}
        saleData={getModalData('print')}
      />

      <ProductSelectionModal
        product={getModalData('productSelection')}
        show={isModalOpen('productSelection')}
        onClose={() => closeModal('productSelection')}
        onAddToCart={handleVariantSelection}
      />
    </div>
  );
};

export default Sales;
