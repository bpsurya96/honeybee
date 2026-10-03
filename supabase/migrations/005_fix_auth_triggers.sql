-- Fix for "Database error saving new user"
-- The triggers were failing because they execute in the 'auth' schema context
-- and could not find the 'profiles' or 'ai_credit_accounts' tables in the 'public' schema.
-- We must either prefix with public. or set the search_path.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 'parent')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_profile_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ai_credit_accounts (id, balance) 
  VALUES (NEW.id, 0) 
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;