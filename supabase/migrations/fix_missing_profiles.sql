-- Fix for "violates foreign key constraint reviews_author_id_fkey"
-- This happens because when we reset the public tables, the 'profiles' table was cleared,
-- but the users still exist in the 'auth.users' system table.
-- We need to regenerate the profiles for existing users.

INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
