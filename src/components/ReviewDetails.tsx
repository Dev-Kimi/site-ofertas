import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
import { Loader2, Calendar, User, Star, ShoppingCart } from 'lucide-react';

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  summary: string;
  price: string;
  affiliate_link: string;
  image_url: string;
  category: string;
  specs: Record<string, string>;
  created_at: string;
  author_id: string;
  profiles?: {
    full_name: string;
  };
}

export const ReviewDetails: React.FC = () => {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      fetchReview(id);
    } else {
      setError('Review não encontrado.');
      setLoading(false);
    }
  }, []);

  const fetchReview = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setReview(data);
    } catch (error: any) {
      console.error('Erro ao buscar review:', error);
      setError('Erro ao carregar o review.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ops!</h2>
        <p className="text-gray-600">{error || 'Review não encontrado.'}</p>
        <a href="/reviews" className="text-blue-600 hover:underline mt-4 inline-block">Voltar para Reviews</a>
      </div>
    );
  }

  const formattedDate = new Date(review.created_at).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-white pb-12">
      {/* Header Section */}
      <div className="bg-gray-900 text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-gray-900 opacity-90"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-blue-300 text-sm font-medium mb-4">
                <a href="/" className="hover:text-white transition">Home</a>
                <span>/</span>
                <a href="/reviews" className="hover:text-white transition">Reviews</a>
                <span>/</span>
                <span className="text-white">{review.category || 'Geral'}</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{review.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  <span>{review.profiles?.full_name || 'Autor Desconhecido'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  {review.rating}/10
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl overflow-hidden shadow-lg mb-10">
              <img src={review.image_url} alt={review.title} className="w-full h-auto object-cover" />
            </div>

            <article className="prose prose-lg prose-blue max-w-none text-gray-700">
              <ReactMarkdown>{review.content}</ReactMarkdown>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Verdict Card (Sticky) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Veredito</h3>
              
              <div className="flex justify-between items-center mb-6">
                <div className="text-gray-600 font-medium">Nota Final</div>
                <div className="text-4xl font-black text-blue-600">{review.rating}<span className="text-lg text-gray-400 font-normal">/10</span></div>
              </div>

              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {review.summary}
              </p>

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Melhor Preço Encontrado</div>
                <div className="text-3xl font-bold text-green-600">{review.price}</div>
              </div>

              <a 
                href={review.affiliate_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Ver Oferta na Loja
              </a>
              <p className="text-xs text-gray-400 text-center mt-3">
                *Podemos receber comissão por compras qualificadas.
              </p>
            </div>

            {/* Specs Card */}
            {review.specs && Object.keys(review.specs).length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Especificações Técnicas</h3>
                <div className="space-y-3">
                  {Object.entries(review.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 text-sm font-medium">{key}</span>
                      <span className="text-gray-900 text-sm font-semibold text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
