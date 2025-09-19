import React from 'react';
import { useProducts } from '../hooks/useProducts';

import { useSales } from '../hooks/useSales';
import EditPriceModal from "../components/Sales/EditPriceModal";

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
import DailyStats from '../components/Sales/DailyStats';

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
    updateCartItemPrice,
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
    'productSelection',
    'editPrice'
  ]);

  const pendingSales = formatSessionsForUI(sessions);
  const productStats = getProductStats();

  function handleProductSelection(product, quantity = 1, variant = null, needsModal = false) {
    if (needsModal) {
      openModal('productSelection', product);
    } else {
      addToCart(product, quantity, variant);
    }
  }

  const handleVariantSelection = (product, quantity, variant) => {
    addToCart(product, quantity, variant);
    closeModal('productSelection');
  };

  const handleNewSale = () => {
    try {
      const sessionCount = Object.keys(sessions).length;
      createSession(`Cliente ${sessionCount + 1}`);
    } catch (error) {
      alert(`Error al crear nueva venta: ${error.message}`);
    }
  };

  const handleProcessSale = async () => {
    try {
      const validation = validateSaleBeforeProcessing(cart, totals);
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }

      const confirmMessage = generateSaleConfirmationMessage(totals, paymentMethod, discountPercent);
      if (!confirm(confirmMessage)) return;

      await finalizeSession(activeSessionId);
      alert(MESSAGES.SUCCESS.SALE_PROCESSED || 'Venta procesada exitosamente');
    } catch (error) {
      alert(`❌ Error al procesar venta: ${error.message}`);
    }
  };

  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      alert('No hay productos en el carrito para imprimir');
      return;
    }
    const receiptData = prepareReceiptData(cart, totals, paymentMethod, customerName, cashReceived);
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
    <div key={activeSessionId} className="min-h-screen bg-gray-50 p-4 space-y-4">

      {/* HEADER + BOTONES */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Ventas</h1>

        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleNewSale} className="btn-rosema">+ Nueva Venta</button>
          <button onClick={() => openModal('history')} className="btn-secondary">🕒 Historial</button>
          <button onClick={resetAllSessions} className="bg-violet-800 hover:bg-violet-700 text-white font-bold text-lm py-3 px-6 rounded-lg transition-colors">Borrar Venta</button>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="w-full max-w-6xl">
        <DailyStats />
      </div>

      {/* TABS DE SESIONES */}
      <SessionTabs
        sessions={pendingSales}
        activeSessionId={activeSessionId}
        onSessionChange={switchSession}
        onDeleteSession={cancelSession}
        onNewSession={handleNewSale}
      />

      {/* MARCO / HOJA */}
      <div className="bg-gray-400 rounded-lg shadow-md border p-6 space-y-6">

        {/* FILA 1: Buscar producto + Botón cambio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="flex items-start ">
            <button
              onClick={() => openModal('return')}
              className="bg-violet-800 hover:bg-violet-700 text-white font-bold text-lg py-3 px-6 rounded-lg transition-colors"
            >
              Agregar Devolución
            </button>

          </div>
        </div>

        {/* FILA 2: Carrito + Información de pago  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesCart
            cart={cart}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            onUpdateQuantity={updateCartItemQuantity}
            onRemoveItem={removeFromCart}
            onEditPrice={(item) => openModal("editPrice", item)}
          />

          <div className="bg-gray-50 rounded-lg p-4">
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

            <div className="flex gap-5 mt-6 ">
              <button onClick={handlePrintReceipt} className="flex-1 btn-secondary">🖨️ Imprimir</button>
              <button
                onClick={handleProcessSale}
                disabled={salesLoading || cart.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {salesLoading ? "Procesando..." : "💰 Procesar"}
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* MODALES */}
      <QuickItemModal
        isOpen={isModalOpen('quickItem')}
        onClose={() => closeModal('quickItem')}
        onAddItem={(itemData) => {
          addQuickItem(itemData);
          closeModal('quickItem');
        }}
      />
      <EditPriceModal
        isOpen={isModalOpen("editPrice")}
        onClose={() => closeModal("editPrice")}
        item={getModalData("editPrice")}
        onSave={(itemId, newPrice) => {
          updateCartItemPrice(itemId, newPrice);
          closeModal("editPrice");
        }}
      />
      <SalesHistoryModal isOpen={isModalOpen('history')} onClose={() => closeModal('history')} />
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
