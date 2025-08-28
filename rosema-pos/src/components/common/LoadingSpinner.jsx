/**
 * Componente de loading spinner reutilizable
 */

import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'red', 
  text = 'Cargando...', 
  showText = true,
  className = '' 
}) => {
  // Tamaños del spinner
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Colores del spinner
  const colorClasses = {
    red: 'border-red-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    gray: 'border-gray-600'
  };

  const spinnerSizeClass = sizeClasses[size] || sizeClasses.md;
  const spinnerColorClass = colorClasses[color] || colorClasses.red;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-b-2 ${spinnerSizeClass} ${spinnerColorClass} mb-4`}
      />
      {showText && text && (
        <p className="text-gray-600 text-center">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
