/**
 * Componente reutilizable para mostrar tarjetas de estadísticas
 */

import React from 'react';
import { formatPrice } from '../../utils/formatters.js';

const StatsCard = ({
  title,
  value,
  color = 'blue',
  format = 'number',
  subtitle,
  className = ''
}) => {
  // Formatear valor según el tipo
  const formatValue = (val, formatType) => {
    switch (formatType) {
      case 'price':
        return formatPrice(val);
      case 'percentage':
        return `${val}%`;
      case 'number':
      default:
        return typeof val === 'number' ? val.toLocaleString() : val;
    }
  };

  // Clases de color
  const colorClasses = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  const textColorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 text-center ${className}`}>
      <div className={`text-3xl font-bold mb-1 ${textColorClass}`}>
        {formatValue(value, format)}
      </div>
      <div className="text-xs text-gray-500 font-medium">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
