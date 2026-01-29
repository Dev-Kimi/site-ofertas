import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, LogOut } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login';
      } else {
        setSession(session);
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white text-center">
        <div className="w-24 h-24 bg-white text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-xl">
          {session.user.email?.[0].toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold">{session.user.email}</h1>
        <p className="text-blue-100 opacity-80 text-sm mt-1">Membro TechOffers</p>
      </div>

      <div className="p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-2">Informações da Conta</h2>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">E-mail</p>
              <p className="text-gray-900">{session.user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Membro desde</p>
              <p className="text-gray-900">
                {new Date(session.user.created_at).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">ID do Usuário</p>
              <p className="text-gray-900 font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                {session.user.id}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
};
