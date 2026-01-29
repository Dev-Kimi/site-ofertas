import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit, Trash2, Loader2 } from 'lucide-react';

interface ReviewOwnerControlsProps {
  reviewId: string;
  authorId: string;
  currentUserId?: string;
}

export const ReviewOwnerControls: React.FC<ReviewOwnerControlsProps> = ({ 
  reviewId, 
  authorId, 
  currentUserId 
}) => {
  const [deleting, setDeleting] = useState(false);

  // Only show controls if the current user is the author
  if (!currentUserId || currentUserId !== authorId) {
    return null;
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este review? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      // Redirect to reviews list after deletion
      window.location.href = '/reviews';
    } catch (error: any) {
      alert('Erro ao excluir review: ' + error.message);
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-3 mt-6">
      <a 
        href={`/admin/editar?id=${reviewId}`}
        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
      >
        <Edit className="w-4 h-4" />
        Editar
      </a>
      
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {deleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
        Excluir
      </button>
    </div>
  );
};
