/**
 * Custom hook para manejar búsqueda de productos en ventas
 */

import { useState, useCallback, useMemo } from 'react';
import { searchProductsWithPriority, canAddProductToCart } from '../utils/salesHelpers.js';

export const useProductSearch = (products, onProductSelect) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

   // ✅ Mapa de búsqueda rápida por código de barras
  const productByBarcode = useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      if (p.codigoBarras) {      // usa la key que tengas en tu modelo
        map.set(p.codigoBarras, p);
      }
    });
    return map;
  }, [products]);

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
  // ✅ Escaneo usando el mapa
  const handleBarcodeScan = useCallback(async (barcode) => {
    const product = productByBarcode.get(barcode);
    if (!product) {
      alert('Producto no encontrado');
      return;
    }
    handleProductSelect(product);
  }, [productByBarcode, handleProductSelect]);

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
