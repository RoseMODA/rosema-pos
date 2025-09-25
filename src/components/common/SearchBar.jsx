/**
 * Componente reutilizable de barra de búsqueda
 */

import React, { forwardRef, useRef, useEffect } from 'react';

const SearchBar = forwardRef(({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  className = '',
  disabled = false,
  autoFocus = false
}, ref) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);


  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
    if (inputRef.current) {
      inputRef.current.focus(); // vuelve a enfocar después de limpiar
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
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={true}
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
});

export default SearchBar;
