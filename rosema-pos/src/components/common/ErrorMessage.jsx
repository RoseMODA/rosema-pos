/**
 * Componente reutilizable para mostrar mensajes de error
 */

import React from 'react';

const ErrorMessage = ({ 
  message, 
  title = 'Error',
  onRetry,
  retryText = 'Reintentar',
  className = '',
  variant = 'default'
}) => {
  // Variantes de estilo
  const variants = {
    default: {
      container: 'bg-red-50 border border-red-200 text-red-800',
      title: 'text-red-900',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      container: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
      title: 'text-yellow-900',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    info: {
      container: 'bg-blue-50 border border-blue-200 text-blue-800',
      title: 'text-blue-900',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div className={`rounded-lg p-4 ${currentVariant.container} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${currentVariant.title}`}>
            {title}
          </h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentVariant.button}`}
              >
                {retryText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
