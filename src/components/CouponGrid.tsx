import React from 'react';

export interface Coupon {
  id: string;
  storeName: string;
  discount: string;
  code?: string;
  affiliateLink: string;
  expirationDate: string;
}

interface CouponGridProps {
  coupons: Coupon[];
}

export const CouponGrid: React.FC<CouponGridProps> = ({ coupons }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coupons.map((coupon) => (
        <div key={coupon.id} className="border border-dashed border-gray-300 bg-white p-6 rounded-lg relative hover:border-blue-500 transition group">
          <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-bl-lg">
            Ativo
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{coupon.storeName}</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{coupon.discount}</div>
          <p className="text-sm text-gray-500 mb-4">Expira em: {new Date(coupon.expirationDate).toLocaleDateString('pt-BR')}</p>
          
          {coupon.code ? (
            <div className="bg-gray-100 p-2 rounded text-center mb-4 font-mono font-bold text-gray-700 border border-gray-200 select-all cursor-pointer hover:bg-gray-200 transition" title="Clique para copiar">
              {coupon.code}
            </div>
          ) : (
            <div className="bg-gray-100 p-2 rounded text-center mb-4 text-gray-500 italic">
              Desconto automático no link
            </div>
          )}
          
          <a 
            href={coupon.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium"
          >
            Pegar Desconto
          </a>
        </div>
      ))}
    </div>
  );
};
