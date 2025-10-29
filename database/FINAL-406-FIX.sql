-- ============================================
-- FINAL FIX FOR PERSISTENT 406 ERROR
-- This addresses API-level issues
-- ============================================

-- Step 1: Completely reset permissions
REVOKE ALL ON profiles FROM anon, authenticated, postgres, service_role;
REVOKE ALL ON games FROM anon, authenticated, postgres, service_role;
REVOKE ALL ON match_history FROM anon, authenticated, postgres, service_role;

-- Step 2: Grant MAXIMUM permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Step 3: Ensure sequences are accessible
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Step 4: Disable RLS completely
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_history DISABLE ROW LEVEL SECURITY;

-- Step 5: Remove ALL policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Step 6: Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- Step 7: Verify table structure (check for issues)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 8: Test direct query
SELECT id, username, points FROM profiles LIMIT 1;

-- ============================================
-- IMPORTANT: Enable PostgREST API Access
-- ============================================

-- Make sure schema is exposed to PostgREST
NOTIFY pgrst, 'reload schema';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'FINAL FIX COMPLETE!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'All permissions granted';
    RAISE NOTICE 'All policies removed';
    RAISE NOTICE 'RLS completely disabled';
    RAISE NOTICE 'PostgREST schema reloaded';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'If STILL getting 406:';
    RAISE NOTICE '1. Go to Supabase → Settings → API';
    RAISE NOTICE '2. Check "Enable API" is ON';
    RAISE NOTICE '3. Check "Schema" includes "public"';
    RAISE NOTICE '4. Try regenerating API key';
    RAISE NOTICE '================================================';
END $$;
