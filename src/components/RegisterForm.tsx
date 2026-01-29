import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, User, Loader2, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setErrorMsg(null);
    
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        throw new Error('Erro de configuração: Variáveis de ambiente do Supabase não encontradas.');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/perfil`,
          data: {
            full_name: fullName,
          }
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      let message = error.message || 'Ocorreu um erro ao tentar criar a conta. Tente novamente.';
      
      // Tratamento específico para Rate Limit
      if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('too many requests')) {
        message = 'Muitas tentativas recentes. Por favor, aguarde alguns minutos antes de tentar novamente.';
      }

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-8 animate-in fade-in duration-500">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifique seu e-mail</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Enviamos um link de confirmação para <strong>{email}</strong>.<br/>
          Clique no link para ativar sua conta.
        </p>
        <button 
          onClick={() => setSent(false)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Corrigir e-mail
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crie sua conta</h1>
        <p className="text-gray-500">Junte-se à comunidade TechOffers</p>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Atenção</h3>
            <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white"
              placeholder="Seu nome"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Criando conta...
            </>
          ) : (
            <>
              Cadastrar <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
            Entrar agora
          </a>
        </p>
      </div>
    </div>
  );
};
