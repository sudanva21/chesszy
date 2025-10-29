-- ============================================
-- DIAGNOSTIC SCRIPT
-- Run this to see what's wrong
-- ============================================

-- Check 1: Do tables exist?
SELECT 
  'Tables Check' as test,
  CASE 
    WHEN COUNT(*) = 3 THEN '✓ All tables exist'
    ELSE '✗ Missing tables! Count: ' || COUNT(*)::text
  END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'games', 'match_history');

-- Check 2: Is RLS disabled?
SELECT 
  'RLS Check' as test,
  tablename,
  CASE 
    WHEN rowsecurity = false THEN '✓ Disabled (Good)'
    ELSE '✗ ENABLED (This is the problem!)'
  END as result
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'games', 'match_history')
ORDER BY tablename;

-- Check 3: Are permissions granted?
SELECT 
  'Permissions Check' as test,
  table_name,
  grantee,
  STRING_AGG(privilege_type, ', ') as privileges
FROM information_schema.table_privileges 
WHERE table_name IN ('profiles', 'games', 'match_history')
AND grantee IN ('anon', 'authenticated')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- Check 4: Can we query profiles?
SELECT 
  'Query Test' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN '✓ Can query profiles table'
    WHEN NOT EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN '✓ Table exists but empty'
    ELSE '✗ Cannot query'
  END as result;

-- Check 5: Profile count
SELECT 
  'Profile Count' as test,
  COUNT(*)::text || ' profiles exist' as result
FROM profiles;

-- ============================================
-- SUMMARY
-- ============================================

DO $$ 
DECLARE
  table_count INTEGER;
  rls_enabled BOOLEAN;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'games', 'match_history');
  
  -- Check RLS
  SELECT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
    AND rowsecurity = true
  ) INTO rls_enabled;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIAGNOSTIC SUMMARY:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables: %/3', table_count;
  RAISE NOTICE 'RLS on profiles: %', CASE WHEN rls_enabled THEN 'ENABLED (BAD!)' ELSE 'Disabled (good)' END;
  RAISE NOTICE '========================================';
  
  IF table_count < 3 THEN
    RAISE NOTICE 'PROBLEM: Missing tables!';
    RAISE NOTICE 'SOLUTION: Run schema-complete.sql';
  ELSIF rls_enabled THEN
    RAISE NOTICE 'PROBLEM: RLS is enabled!';
    RAISE NOTICE 'SOLUTION: Run PERMANENT-FIX.sql';
  ELSE
    RAISE NOTICE 'STATUS: Everything looks good!';
    RAISE NOTICE 'If still getting 406, check:';
    RAISE NOTICE '1. .env.local has correct keys';
    RAISE NOTICE '2. Restart dev server';
    RAISE NOTICE '3. Clear browser cache';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
