-- =============================================================================
-- INFRATRACE: FIX AUTH RLS POLICIES FOR USERS, VERIFIERS, AND ADMINS
-- Execute this SQL in your Supabase Project SQL Editor
-- =============================================================================

-- 1. Ensure helper functions exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_verifier()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.verifiers WHERE id = auth.uid()
  );
$$;

-- 2. Ensure RLS is enabled on all profile tables
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES FOR USERS_PROFILE
-- User can select own row; admins can select all
DROP POLICY IF EXISTS "select own row" ON public.users_profile;
DROP POLICY IF EXISTS "users_profile_select" ON public.users_profile;
CREATE POLICY "select own row" ON public.users_profile
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- User can insert own row (id = auth.uid()); admins can insert
DROP POLICY IF EXISTS "insert own row" ON public.users_profile;
DROP POLICY IF EXISTS "users_profile_insert" ON public.users_profile;
CREATE POLICY "insert own row" ON public.users_profile
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- User can update own row; admins can update all
DROP POLICY IF EXISTS "update own row" ON public.users_profile;
DROP POLICY IF EXISTS "users_profile_update" ON public.users_profile;
CREATE POLICY "update own row" ON public.users_profile
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4. POLICIES FOR VERIFIERS
-- Verifier can select own row; admins can select all
DROP POLICY IF EXISTS "select own row" ON public.verifiers;
DROP POLICY IF EXISTS "verifiers_select" ON public.verifiers;
CREATE POLICY "select own row" ON public.verifiers
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Admins full access on verifiers table
DROP POLICY IF EXISTS "verifiers_admin_all" ON public.verifiers;
CREATE POLICY "verifiers_admin_all" ON public.verifiers
    FOR ALL USING (public.is_admin());

-- 5. POLICIES FOR ADMINS
-- Admin can select own row; admins can select all
DROP POLICY IF EXISTS "select own row" ON public.admins;
DROP POLICY IF EXISTS "admins_select" ON public.admins;
CREATE POLICY "select own row" ON public.admins
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Admins full access on admins table
DROP POLICY IF EXISTS "admins_admin_all" ON public.admins;
CREATE POLICY "admins_admin_all" ON public.admins
    FOR ALL USING (public.is_admin());
