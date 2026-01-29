-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create reviews table (Updated to match existing schema)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  categoria TEXT,
  conteudo TEXT,
  specs_tecnicas JSONB DEFAULT '{}'::jsonb,
  nota NUMERIC(3, 1) CHECK (nota >= 0 AND nota <= 10),
  imagem_url TEXT,
  link_afiliado TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews." ON public.reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reviews." ON public.reviews
  FOR UPDATE USING (auth.role() = 'authenticated'); -- Simplified as author_id is missing in current schema

-- Create coupons table (Updated to match existing schema)
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja TEXT NOT NULL,
  codigo TEXT,
  desconto_porcentagem INTEGER,
  link_loja TEXT NOT NULL,
  expira_em DATE,
  ativo BOOLEAN DEFAULT true
);

-- Enable RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons
CREATE POLICY "Coupons are viewable by everyone." ON public.coupons
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create coupons." ON public.coupons
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
