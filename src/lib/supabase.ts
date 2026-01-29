import { createClient } from '@supabase/supabase-js';

// Tenta ler de import.meta.env (Vite/Astro) ou process.env (Node/Vercel)
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file or Vercel settings.');
}

// Evita crash se as variáveis não estiverem definidas (comum no build ou antes da configuração)
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder';

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
