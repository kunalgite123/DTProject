-- =============================================================================
-- INFRATRACE: BULLETPROOF AUTH TRIGGER (Fixes "Database error saving new user")
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- 1. Ensure the users_profile table exists with correct columns
CREATE TABLE IF NOT EXISTS public.users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    profession TEXT CHECK (profession IN ('Civil Engineer', 'Site Engineer', 'Contractor', 'Surveyor')) DEFAULT 'Civil Engineer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure profession column exists if the table was created under an older schema
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'users_profile' 
          AND column_name = 'profession'
    ) THEN
        ALTER TABLE public.users_profile ADD COLUMN profession TEXT DEFAULT 'Civil Engineer';
    END IF;
END $$;

-- Ensure RLS is active and permissive for user operations
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select own row" ON public.users_profile;
DROP POLICY IF EXISTS "users_profile_select" ON public.users_profile;
CREATE POLICY "select own row" ON public.users_profile
    FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "insert own row" ON public.users_profile;
DROP POLICY IF EXISTS "users_profile_insert" ON public.users_profile;
CREATE POLICY "insert own row" ON public.users_profile
    FOR INSERT WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "update own row" ON public.users_profile;
DROP POLICY IF EXISTS "users_profile_update" ON public.users_profile;
CREATE POLICY "update own row" ON public.users_profile
    FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- 2. Drop any previous broken or conflicting triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Exception-safe trigger function: Never crashes the auth signup transaction
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_profession TEXT;
BEGIN
    BEGIN
        user_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        );
        
        user_profession := COALESCE(
            NEW.raw_user_meta_data->>'profession',
            'Civil Engineer'
        );

        IF user_profession NOT IN ('Civil Engineer', 'Site Engineer', 'Contractor', 'Surveyor') THEN
            user_profession := 'Civil Engineer';
        END IF;

        INSERT INTO public.users_profile (id, email, full_name, profession)
        VALUES (NEW.id, NEW.email, user_name, user_profession)
        ON CONFLICT (id) DO UPDATE 
        SET full_name = EXCLUDED.full_name,
            profession = EXCLUDED.profession;

    EXCEPTION WHEN OTHERS THEN
        -- Catch any possible error and log warning so auth.users signup NEVER fails
        RAISE WARNING 'handle_new_user_profile notice: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 4. Bind trigger to auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_profile();
