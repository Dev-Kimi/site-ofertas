import React from 'react';

interface ReviewCardProps {
  title: string;
  image: string;
  rating: number;
  summary: string;
  price: string;
  affiliateLink: string;
  detailLink?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ title, image, rating, summary, price, affiliateLink, detailLink }) => {
  const ImageComponent = () => (
    <img src={image} alt={title} className="w-full h-48 object-cover hover:opacity-90 transition-opacity" />
  );

  const TitleComponent = () => (
    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{title}</h3>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700">
      {detailLink ? (
        <a href={detailLink} className="block">
          <ImageComponent />
        </a>
      ) : (
        <ImageComponent />
      )}
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          {detailLink ? (
            <a href={detailLink} className="flex-grow">
              <TitleComponent />
            </a>
          ) : (
            <div className="flex-grow">
              <TitleComponent />
            </div>
          )}
          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded ml-2 whitespace-nowrap flex-shrink-0">
            {rating}/10
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">{summary}</p>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{price}</span>
          <a 
            href={affiliateLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
          >
            Ver Oferta
          </a>
        </div>
      </div>
    </div>
  );
};
