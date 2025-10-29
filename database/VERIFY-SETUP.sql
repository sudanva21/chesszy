-- ============================================
-- VERIFICATION & FIX SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if tables exist
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'games', 'match_history')
ORDER BY table_name;

-- Expected output:
-- profiles | BASE TABLE
-- games | BASE TABLE  
-- match_history | BASE TABLE

-- If you don't see all 3 tables, STOP and run schema-complete.sql first!

-- ============================================

-- 2. Disable RLS on all tables (for testing)
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS games DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS match_history DISABLE ROW LEVEL SECURITY;

-- ============================================

-- 3. Grant permissions
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON games TO anon, authenticated;
GRANT ALL ON match_history TO anon, authenticated;

-- ============================================

-- 4. Check if leaderboard view exists
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name = 'leaderboard';

-- Expected: leaderboard | VIEW

-- ============================================

-- 5. Test query (this should work without errors)
SELECT COUNT(*) as profile_count FROM profiles;
SELECT COUNT(*) as games_count FROM games;
SELECT COUNT(*) as history_count FROM match_history;

-- ============================================

-- If ALL of the above works, your database is set up correctly!
-- Now restart your dev server and clear browser cache.

-- ============================================
-- QUICK FIX IF TABLES DON'T EXIST:
-- ============================================

-- Uncomment and run this if tables don't exist:

/*
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  points INTEGER DEFAULT 500,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_lost INTEGER DEFAULT 0,
  games_drawn INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_code TEXT UNIQUE NOT NULL,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  current_turn TEXT NOT NULL DEFAULT 'white',
  white_player_id UUID REFERENCES profiles(id),
  black_player_id UUID REFERENCES profiles(id),
  is_bot_game BOOLEAN DEFAULT false,
  bot_difficulty TEXT,
  white_points_change INTEGER DEFAULT 0,
  black_points_change INTEGER DEFAULT 0,
  winner TEXT,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create match_history table
CREATE TABLE IF NOT EXISTS match_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES profiles(id),
  opponent_id UUID REFERENCES profiles(id),
  opponent_name TEXT,
  result TEXT NOT NULL,
  points_change INTEGER DEFAULT 0,
  was_bot_game BOOLEAN DEFAULT false,
  bot_difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  id,
  username,
  avatar_url,
  points,
  games_played,
  games_won,
  games_lost,
  games_drawn,
  CASE 
    WHEN games_played > 0 THEN ROUND((games_won::NUMERIC / games_played::NUMERIC) * 100, 1)
    ELSE 0
  END as win_rate,
  ROW_NUMBER() OVER (ORDER BY points DESC, games_won DESC) as rank
FROM profiles
WHERE games_played > 0
ORDER BY points DESC, games_won DESC;

-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_history DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON games TO anon, authenticated;
GRANT ALL ON match_history TO anon, authenticated;
*/
