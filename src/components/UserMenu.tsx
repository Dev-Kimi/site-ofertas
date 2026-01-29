import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, LogOut, LayoutDashboard, Loader2, LogIn } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    window.location.href = '/';
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>;
  }

  if (!session) {
    return (
      <a 
        href="/login" 
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
      >
        <LogIn className="w-5 h-5" />
        <span className="hidden md:inline">Entrar</span>
      </a>
    );
  }

  const userEmail = session.user.email;
  const initial = userEmail ? userEmail[0].toUpperCase() : 'U';

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold border border-blue-200 hover:bg-blue-200 transition">
          {initial}
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-500">Logado como</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{userEmail}</p>
            </div>
            
            <div className="py-1">
              <a 
                href="/perfil" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                Meu Perfil
              </a>
              <a 
                href="/admin/novo-review" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Área Admin
              </a>
            </div>

            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
