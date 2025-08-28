/**
 * Componente para mostrar estadísticas de productos
 */

import React from 'react';
import StatsCard from '../common/StatsCard.jsx';

const ProductsStats = ({ stats }) => {
  const statsData = [
    {
      title: 'Total Productos',
      value: stats.totalProducts,
      color: 'red',
      format: 'number'
    },
    {
      title: 'Stock Total',
      value: stats.totalStock,
      color: 'blue',
      format: 'number'
    },
    {
      title: 'Stock Bajo',
      value: stats.lowStockProducts,
      color: 'yellow',
      format: 'number'
    },
    {
      title: 'Sin Stock',
      value: stats.outOfStockProducts,
      color: 'red',
      format: 'number'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {statsData.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          color={stat.color}
          format={stat.format}
        />
      ))}
    </div>
  );
};

export default ProductsStats;
