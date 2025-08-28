/**
 * Custom hook para manejar búsqueda de productos en ventas
 */

import { useState, useCallback } from 'react';
import { searchProductsWithPriority, canAddProductToCart } from '../utils/salesHelpers.js';

export const useProductSearch = (products, onProductSelect) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Manejar búsqueda de productos
  const handleSearch = useCallback(async (term) => {
    setSearchTerm(term);

    if (term.trim()) {
      const results = searchProductsWithPriority(products, term);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [products]);

  // Manejar selección de producto
  const handleProductSelect = useCallback((product) => {
    console.log('📦 Producto seleccionado:', product);

    const validation = canAddProductToCart(product);
    
    if (!validation.canAdd) {
      alert(validation.reason);
      return;
    }

    const { availableVariants } = validation;

    if (availableVariants.length === 1) {
      // Una sola variante disponible - agregar directamente
      const variant = availableVariants[0];
      console.log('✅ Agregando variante única:', variant);
      onProductSelect(product, 1, variant);
      clearSearch();
    } else {
      // Múltiples variantes - abrir modal de selección
      console.log('🔄 Abriendo modal para seleccionar variante');
      onProductSelect(product, null, null, true); // Indicar que necesita modal
      clearSearch();
    }
  }, [onProductSelect]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  }, []);

  // Manejar escaneo de código de barras
  const handleBarcodeScan = useCallback(async (barcode, getProductByBarcode) => {
    try {
      console.log('🔍 Buscando producto por código:', barcode);
      const product = await getProductByBarcode(barcode);
      
      if (!product) {
        alert('Producto no encontrado');
        return;
      }

      handleProductSelect(product);
    } catch (error) {
      console.error('Error al buscar producto por código:', error);
      alert(`Error al buscar producto: ${error.message}`);
    }
  }, [handleProductSelect]);

  return {
    searchTerm,
    searchResults,
    showResults,
    handleSearch,
    handleProductSelect,
    handleBarcodeScan,
    clearSearch
  };
};
