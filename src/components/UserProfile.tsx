import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, LogOut, Edit, Trash2, Eye } from 'lucide-react';

interface Review {
  id: string;
  title: string;
  created_at: string;
  rating: number;
  slug: string;
}

export const UserProfile: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login';
      } else {
        setSession(session);
        fetchUserReviews(session.user.id);
      }
      setLoading(false);
    });
  }, []);

  const fetchUserReviews = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, title, created_at, rating, slug')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserReviews(data || []);
    } catch (error) {
      console.error('Erro ao buscar reviews do usuário:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Tem certeza que deseja excluir este review? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setUserReviews(userReviews.filter(r => r.id !== reviewId));
      alert('Review excluído com sucesso!');
    } catch (error: any) {
      alert('Erro ao excluir review: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white text-center">
          <div className="w-24 h-24 bg-white text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-xl">
            {session.user.email?.[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">{session.user.email}</h1>
          <p className="text-blue-100 opacity-80 text-sm mt-1">Membro TechOffers</p>
        </div>

        <div className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">Informações da Conta</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">E-mail</p>
                <p className="text-gray-900 dark:text-white">{session.user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Membro desde</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(session.user.created_at).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium transition"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>

      {/* My Reviews Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-8">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Meus Reviews</h2>
          <a 
            href="/admin/novo-review" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
          >
            Novo Review
          </a>
        </div>

        {reviewsLoading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando reviews...</div>
        ) : userReviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Você ainda não publicou nenhum review.</p>
            <a href="/admin/novo-review" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Começar agora</a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Título</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Data</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Nota</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {userReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{review.title}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(review.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-bold px-2 py-1 rounded">
                        {review.rating}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <a 
                        href={`/reviews/${review.slug}`} 
                        target="_blank"
                        className="inline-flex p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a 
                        href={`/admin/editar?id=${review.id}`} 
                        className="inline-flex p-2 text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="inline-flex p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
