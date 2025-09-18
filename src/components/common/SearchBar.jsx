/**
 * Componente reutilizable de barra de búsqueda
 */

import React from 'react';

const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  className = '',
  disabled = false,
  autoFocus = false
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="w-full input-rosema pl-10 pr-10"
      />

      {/* Icono de búsqueda (usando texto)
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
        🔍
      </div> */}


      {/* Botón de limpiar */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Limpiar búsqueda"
        >
          <span className="text-lg">×</span>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
