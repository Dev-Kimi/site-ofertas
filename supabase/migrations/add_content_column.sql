-- Add content column to reviews table if it doesn't exist
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Ensure it is not null (optional, might fail if there are existing rows without content, so we leave it nullable for now or update it first)
-- UPDATE public.reviews SET content = '' WHERE content IS NULL;
-- ALTER TABLE public.reviews ALTER COLUMN content SET NOT NULL;
