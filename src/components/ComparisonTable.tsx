import React from 'react';

interface Product {
  id: string;
  name: string;
  specs: Record<string, string | number | boolean>;
}

interface ComparisonTableProps {
  products: Product[];
  specLabels: Record<string, string>; // Map spec key to display label
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ products, specLabels }) => {
  const specKeys = Object.keys(specLabels);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 border-b border-gray-200 sticky left-0 bg-gray-50 z-10">Especificação</th>
            {products.map(product => (
              <th key={product.id} className="py-3 px-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 min-w-[150px]">
                {product.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specKeys.map((key, index) => (
            <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="py-3 px-4 text-sm font-medium text-gray-600 border-b border-gray-100 sticky left-0 bg-inherit z-10 border-r">{specLabels[key]}</td>
              {products.map(product => (
                <td key={`${product.id}-${key}`} className="py-3 px-4 text-sm text-gray-800 border-b border-gray-100">
                  {product.specs[key] !== undefined ? product.specs[key].toString() : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
