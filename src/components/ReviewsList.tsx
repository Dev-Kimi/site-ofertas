import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ReviewCard } from './ReviewCard';
import { Loader2 } from 'lucide-react';

interface Review {
  id: string;
  title: string;
  image_url: string;
  rating: number;
  summary: string;
  price: string;
  affiliate_link: string;
  category: string;
  created_at: string;
  slug: string;
}

export const ReviewsList: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Todos');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Erro ao buscar reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Todos', ...new Set(reviews.map(r => r.category || 'Outros'))];
  const filteredReviews = category === 'Todos' 
    ? reviews 
    : reviews.filter(r => (r.category || 'Outros') === category);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredReviews.map(review => (
          <ReviewCard
            key={review.id}
            title={review.title}
            image={review.image_url}
            rating={review.rating}
            summary={review.summary || ''}
            price={review.price || ''}
            affiliateLink={review.affiliate_link}
            detailLink={review.slug ? `/reviews/${review.slug}` : `/reviews/view?id=${review.id}`}
          />
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Nenhum review encontrado.</p>
        </div>
      )}
    </div>
  );
};
