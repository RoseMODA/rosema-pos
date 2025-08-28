/**
 * Componente para filtros de productos
 */

import React from 'react';
import SearchBar from '../common/SearchBar.jsx';
import { PRODUCT_CATEGORIES, SORT_OPTIONS, ORDER_OPTIONS } from '../../utils/constants.js';

const ProductsFilters = ({
  searchTerm,
  categoryFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onOrderChange,
  onClearSearch
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          onClear={onClearSearch}
          placeholder="Buscar por código, nombre, tags, proveedor o talle..."
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
    </div>
  );
};

export default ProductsFilters;
