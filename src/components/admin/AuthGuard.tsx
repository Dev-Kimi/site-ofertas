import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, Loader2, AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [configError, setConfigError] = useState(false);

  React.useEffect(() => {
    // Check if Supabase is configured correctly
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      setConfigError(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error('Error checking session:', err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.href,
        },
      });

      if (error) {
        alert(error.message);
      } else {
        setIsMagicLinkSent(true);
      }
    } catch (error: any) {
      alert('Erro ao tentar login: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuração Necessária</h2>
          <p className="text-gray-600 mb-6">
            As variáveis de ambiente do Supabase não foram configuradas corretamente na Vercel.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm font-mono text-gray-700 overflow-x-auto">
            PUBLIC_SUPABASE_URL<br/>
            PUBLIC_SUPABASE_ANON_KEY
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Área Restrita</h2>
            <p className="text-gray-600 mt-2">Acesso exclusivo para administradores</p>
          </div>

          {isMagicLinkSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800 mb-1">Verifique seu e-mail</h3>
              <p className="text-green-700 text-sm">
                Enviamos um link mágico para <strong>{email}</strong>. Clique nele para entrar.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="admin@techoffers.com"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Entrar com Magic Link'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
