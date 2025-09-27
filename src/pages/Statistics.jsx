import React, { useMemo } from 'react';
import { getStockByCategoryAndSize } from '../utils/productHelpers';
import { sortSizes } from '../utils/sizeOrder';
import { useProducts } from '../hooks/useProducts';

const Statistics = () => {
  const { products } = useProducts();
  const stockData = useMemo(() => getStockByCategoryAndSize(products), [products]);

  // 👉 Orden de prioridad de las categorías
  const CATEGORY_ORDER = ["Mujer", "Hombre", "Niños-Bebes", "Otros"];

  // 👉 Ordenamos las categorías según la lista
  const categories = Object.keys(stockData).sort((a, b) => {
    const order = ["mujer", "hombre", "niños-bebes", "otros"];

    const indexA = order.indexOf(a.toLowerCase());
    const indexB = order.indexOf(b.toLowerCase());

    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 Estadísticas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {categories.map(category => {
          const sizes = Object.keys(stockData[category]).sort(sortSizes);

          return (
            <div key={category} className="bg-white shadow rounded-lg p-3 border border-gray-200">
              <h2 className="text-md font-semibold text-gray-900 mb-2 text-center">
                {category}
              </h2>
              <div className="overflow-x-auto">
                <table className="  border border-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 border text-center">Talle</th>
                      <th className="px-2 py-1 border text-center bg-blue-200">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map(size => (
                      <tr key={size}>
                        <td className="px-2 py-1  border text-center font-medium ">{size}</td>
                        <td
                          className={`px-2 py-1 border text-center bg-blue-50 font-bold ${stockData[category][size] <= 5 ? 'text-red-600 font-bold' : ''
                            }`}
                        >
                          {stockData[category][size]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;
