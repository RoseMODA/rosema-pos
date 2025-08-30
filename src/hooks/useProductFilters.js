/**
 * Custom hook para manejar filtros y búsqueda de productos
 */

import { useState, useMemo, useCallback } from 'react';
import { filterAndSortProducts, searchProducts } from '../utils/productHelpers.js';

export const useProductFilters = (products = [], providers = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showResults, setShowResults] = useState(false);

  // Filtros aplicados
  const filters = useMemo(() => ({
    searchTerm,
    sizeFilter,
    categoryFilter,
    sortBy,
    sortOrder
  }), [searchTerm, sizeFilter, categoryFilter, sortBy, sortOrder]);

  // Productos filtrados y ordenados
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, filters, providers);
  }, [products, filters, providers]);

  // Resultados de búsqueda (para dropdown de búsqueda)
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchProducts(products, searchTerm);
  }, [products, searchTerm]);

  // Handlers
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setShowResults(!!term.trim());
  }, []);

  const handleSizeFilter = useCallback((size) => {
    setSizeFilter(size);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setCategoryFilter(category);
  }, []);

  const handleSortChange = useCallback((sort) => {
    setSortBy(sort);
  }, []);

  const handleOrderChange = useCallback((order) => {
    setSortOrder(order);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setShowResults(false);
  }, []);

  const clearSizeFilter = useCallback(() => {
    setSizeFilter('');
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSizeFilter('');
    setCategoryFilter('all');
    setSortBy('created');
    setSortOrder('asc');
    setShowResults(false);
  }, []);

  // Estadísticas de filtros
  const filterStats = useMemo(() => {
    const total = products.length;
    const filtered = filteredProducts.length;
    const hasActiveFilters = searchTerm.trim() || sizeFilter.trim() || categoryFilter !== 'all';

    return {
      total,
      filtered,
      hasActiveFilters,
      hiddenCount: total - filtered
    };
  }, [products.length, filteredProducts.length, searchTerm, sizeFilter, categoryFilter]);

  return {
    // Estados
    searchTerm,
    sizeFilter,
    categoryFilter,
    sortBy,
    sortOrder,
    showResults,
    
    // Datos procesados
    filteredProducts,
    searchResults,
    filterStats,
    
    // Handlers
    handleSearch,
    handleSizeFilter,
    handleCategoryChange,
    handleSortChange,
    handleOrderChange,
    clearSearch,
    clearSizeFilter,
    clearAllFilters,
    setShowResults,
    
    // Utilidades
    filters
  };
};
