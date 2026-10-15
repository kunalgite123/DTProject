-- =============================================================================
-- INFRATRACE COMPLETE DATABASE SCHEMA & SECURITY POLICIES
-- Nashik Shadow Infrastructure Mapping System
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. DROP OBSOLETE TRIGGERS TO PREVENT AUTH CONFLICTS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;

-- 3. TABLES DEFINITIONS

-- 3.1 Users Profile Table (General Users / Field Engineers)
CREATE TABLE IF NOT EXISTS public.users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    profession TEXT CHECK (profession IN ('Civil Engineer', 'Site Engineer', 'Contractor', 'Surveyor')) DEFAULT 'Civil Engineer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure profession column exists if users_profile was created with an old schema
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

-- 3.2 Verifiers Table (Municipal Inspectors)
CREATE TABLE IF NOT EXISTS public.verifiers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Inspection & Verification',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Admins Table (Infrastructure Directors)
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Infrastructure Management',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Utilities Table (Infrastructure Asset Records)
CREATE TABLE IF NOT EXISTS public.utilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id TEXT UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('water', 'electricity', 'gas', 'sewage', 'telecom')),
    location_text TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    installed_date DATE,
    owner TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Verified', 'Pending', 'Rejected')),
    rejection_reason TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Record Events Table (Audit Trail Timeline)
CREATE TABLE IF NOT EXISTS public.record_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utility_id UUID NOT NULL REFERENCES public.utilities(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    note TEXT,
    by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HELPER FUNCTIONS (Security Definer)

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

-- 5. RECORD ID GENERATOR & UPDATED_AT TRIGGERS

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_utilities_updated_at ON public.utilities;
CREATE TRIGGER set_utilities_updated_at
    BEFORE UPDATE ON public.utilities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.generate_utility_record_id(utility_type TEXT)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    next_num INT;
    new_record_id TEXT;
BEGIN
    CASE lower(utility_type)
        WHEN 'water' THEN prefix := 'WTR-';
        WHEN 'electricity' THEN prefix := 'ELC-';
        WHEN 'gas' THEN prefix := 'GAS-';
        WHEN 'sewage' THEN prefix := 'SWR-';
        WHEN 'telecom' THEN prefix := 'TEL-';
        ELSE prefix := 'UTL-';
    END CASE;

    SELECT COALESCE(MAX(
        CASE 
            WHEN record_id ~ ('^' || prefix || '[0-9]+$') 
            THEN SUBSTRING(record_id FROM LENGTH(prefix) + 1)::INT 
            ELSE 0 
        END
    ), 1000) + 1
    INTO next_num
    FROM public.utilities
    WHERE type = lower(utility_type) OR record_id LIKE (prefix || '%');

    new_record_id := prefix || LPAD(next_num::TEXT, 4, '0');
    RETURN new_record_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_utility_record_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.record_id IS NULL OR NEW.record_id = '' THEN
        NEW.record_id := public.generate_utility_record_id(NEW.type);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_utility_record_id ON public.utilities;
CREATE TRIGGER trigger_set_utility_record_id
    BEFORE INSERT ON public.utilities
    FOR EACH ROW
    EXECUTE FUNCTION public.set_utility_record_id();

-- 6. EXCEPTION-SAFE AUTH REGISTRATION TRIGGER

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
        RAISE WARNING 'handle_new_user_profile notice: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_profile();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_events ENABLE ROW LEVEL SECURITY;

-- 7.1 users_profile policies
DROP POLICY IF EXISTS "select own row" ON public.users_profile;
DROP POLICY IF EXISTS "users_profile_select" ON public.users_profile;
CREATE POLICY "users_profile_select" ON public.users_profile
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "insert own row" ON public.users_profile;
DROP POLICY IF EXISTS "users_profile_insert" ON public.users_profile;
CREATE POLICY "users_profile_insert" ON public.users_profile
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "update own row" ON public.users_profile;
DROP POLICY IF EXISTS "users_profile_update" ON public.users_profile;
CREATE POLICY "users_profile_update" ON public.users_profile
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- 7.2 verifiers policies
DROP POLICY IF EXISTS "select own row" ON public.verifiers;
DROP POLICY IF EXISTS "verifiers_select" ON public.verifiers;
CREATE POLICY "verifiers_select" ON public.verifiers
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "verifiers_admin_all" ON public.verifiers;
CREATE POLICY "verifiers_admin_all" ON public.verifiers
    FOR ALL USING (public.is_admin());

-- 7.3 admins policies
DROP POLICY IF EXISTS "select own row" ON public.admins;
DROP POLICY IF EXISTS "admins_select" ON public.admins;
CREATE POLICY "admins_select" ON public.admins
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "admins_admin_all" ON public.admins;
CREATE POLICY "admins_admin_all" ON public.admins
    FOR ALL USING (public.is_admin());

-- 7.4 utilities policies
DROP POLICY IF EXISTS "utilities_select" ON public.utilities;
CREATE POLICY "utilities_select" ON public.utilities
    FOR SELECT USING (
        public.is_admin()
        OR public.is_verifier()
        OR status = 'Verified'
        OR created_by = auth.uid()
    );

DROP POLICY IF EXISTS "utilities_insert" ON public.utilities;
CREATE POLICY "utilities_insert" ON public.utilities
    FOR INSERT WITH CHECK (
        public.is_admin()
        OR (auth.uid() IS NOT NULL AND created_by = auth.uid() AND status = 'Pending')
    );

DROP POLICY IF EXISTS "utilities_admin_update" ON public.utilities;
CREATE POLICY "utilities_admin_update" ON public.utilities
    FOR UPDATE USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "utilities_verifier_update" ON public.utilities;
CREATE POLICY "utilities_verifier_update" ON public.utilities
    FOR UPDATE USING (public.is_verifier())
    WITH CHECK (public.is_verifier());

DROP POLICY IF EXISTS "utilities_user_update" ON public.utilities;
CREATE POLICY "utilities_user_update" ON public.utilities
    FOR UPDATE USING (created_by = auth.uid() AND status = 'Rejected')
    WITH CHECK (created_by = auth.uid() AND status = 'Pending');

DROP POLICY IF EXISTS "utilities_delete" ON public.utilities;
CREATE POLICY "utilities_delete" ON public.utilities
    FOR DELETE USING (public.is_admin());

-- 7.5 record_events policies
DROP POLICY IF EXISTS "record_events_select" ON public.record_events;
CREATE POLICY "record_events_select" ON public.record_events
    FOR SELECT USING (
        public.is_admin()
        OR public.is_verifier()
        OR EXISTS (
            SELECT 1 FROM public.utilities u
            WHERE u.id = record_events.utility_id
              AND (u.status = 'Verified' OR u.created_by = auth.uid())
        )
    );

DROP POLICY IF EXISTS "record_events_insert" ON public.record_events;
CREATE POLICY "record_events_insert" ON public.record_events
    FOR INSERT WITH CHECK (
        public.is_admin()
        OR (
            auth.uid() IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.utilities u
                WHERE u.id = record_events.utility_id
                  AND (public.is_verifier() OR u.status = 'Verified' OR u.created_by = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "record_events_delete" ON public.record_events;
CREATE POLICY "record_events_delete" ON public.record_events
    FOR DELETE USING (public.is_admin());
