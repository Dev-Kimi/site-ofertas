-- Add slug column and rename specs to technical_specs
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.reviews RENAME COLUMN specs TO technical_specs;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.slugify(value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        translate(value, 'áàâãäåāăąèééêëēĕėęěìíîïìĩīĭįóòôõöōŏőùúûüũūŭůűųýÿŷñç', 'aaaaaaaaaeeeeeeeeeeiiiiiiiiioooooooouuuuuuuuuuyyync'),
        '[^a-z0-9\\-_]+', '-', 'g'
      ),
      '(^-+|-+$)', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing rows with slug
UPDATE public.reviews SET slug = slugify(title) WHERE slug IS NULL;

-- Make slug not null after population
ALTER TABLE public.reviews ALTER COLUMN slug SET NOT NULL;
