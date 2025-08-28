/**
 * Componente para filtros de productos
 */

import React from 'react';
import SearchBar from '../common/SearchBar.jsx';
import { PRODUCT_CATEGORIES, SORT_OPTIONS, ORDER_OPTIONS } from '../../utils/constants.js';

const ProductsFilters = ({
  searchTerm,
  sizeFilter,
  categoryFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onSizeFilterChange,
  onCategoryChange,
  onSortChange,
  onOrderChange,
  onClearSearch,
  onClearSizeFilter
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="space-y-4">
        {/* Primera fila: Búsqueda general */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda general */}
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            onClear={onClearSearch}
            placeholder="Buscar por código, nombre, tags o proveedor..."
          />

          {/* Filtro por categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="input-rosema"
          >
            <option value="all">Todas las categorías</option>
            {PRODUCT_CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {/* Ordenar por */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="input-rosema"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Orden */}
          <select
            value={sortOrder}
            onChange={(e) => onOrderChange(e.target.value)}
            className="input-rosema"
          >
            {ORDER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Segunda fila: Filtro por talle */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              value={sizeFilter}
              onChange={(e) => onSizeFilterChange(e.target.value)}
              placeholder="Filtrar por talle específico (ej: 2, M, XL)..."
              className="input-rosema pr-10"
            />
            {sizeFilter && (
              <button
                onClick={onClearSizeFilter}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpiar filtro de talle"
              >
                ✕
              </button>
            )}
          </div>
          <div className="md:col-span-3 flex items-center">
            <span className="text-sm text-gray-500">
              💡 Tip: El filtro de talle busca productos que tengan ese talle específico en sus variantes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsFilters;
