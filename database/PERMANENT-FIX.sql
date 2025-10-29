-- ============================================
-- PERMANENT FIX FOR 406 ERROR
-- Copy ALL of this and run in Supabase SQL Editor
-- ============================================

-- Step 1: Check if profiles table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        RAISE NOTICE 'ERROR: profiles table does not exist!';
        RAISE NOTICE 'You need to run schema-complete.sql first!';
    ELSE
        RAISE NOTICE 'SUCCESS: profiles table exists';
    END IF;
END $$;

-- Step 2: Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Step 3: Completely disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_history DISABLE ROW LEVEL SECURITY;

-- Step 4: Grant FULL permissions to anon and authenticated roles
GRANT ALL PRIVILEGES ON profiles TO anon;
GRANT ALL PRIVILEGES ON profiles TO authenticated;
GRANT ALL PRIVILEGES ON games TO anon;
GRANT ALL PRIVILEGES ON games TO authenticated;
GRANT ALL PRIVILEGES ON match_history TO anon;
GRANT ALL PRIVILEGES ON match_history TO authenticated;

-- Step 5: Grant usage on sequences (for auto-generated IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 6: Test query - this should work
SELECT id, username, points FROM profiles LIMIT 5;

-- If you see results (even empty), it's working!
-- If you get an error, the table doesn't exist - run schema-complete.sql

-- Step 7: Verify RLS is OFF
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'games', 'match_history');

-- All should show: rowsecurity = false

-- ============================================
-- ADDITIONAL FIX: Enable Realtime (if needed)
-- ============================================

-- Add tables to realtime (ignore errors if already added)
DO $$ 
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE games;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE match_history;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'SETUP COMPLETE!';
    RAISE NOTICE '1. RLS is DISABLED on all tables';
    RAISE NOTICE '2. Full permissions granted to anon and authenticated';
    RAISE NOTICE '3. Realtime enabled';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Now restart your dev server: npm run dev';
    RAISE NOTICE 'Then hard refresh browser: Ctrl+Shift+R';
END $$;
