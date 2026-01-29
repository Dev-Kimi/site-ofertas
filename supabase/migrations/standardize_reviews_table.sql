-- Rename columns to match English codebase conventions
ALTER TABLE public.reviews RENAME COLUMN nota TO rating;
ALTER TABLE public.reviews RENAME COLUMN link_afiliado TO affiliate_link;
ALTER TABLE public.reviews RENAME COLUMN imagem_url TO image_url;
ALTER TABLE public.reviews RENAME COLUMN specs_tecnicas TO specs;

-- Add missing columns required by the frontend
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS price TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS category TEXT;

-- Update RLS policies if they reference renamed columns (none of the previous policies referenced these specific columns, only author_id)
