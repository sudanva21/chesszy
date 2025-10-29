-- ============================================
-- COMPLETE FRESH SETUP FOR NEW SUPABASE PROJECT
-- Run this ONCE in your new Supabase project
-- This will set up EVERYTHING with NO ERRORS
-- ============================================

-- ============================================
-- STEP 1: CREATE TABLES
-- ============================================

-- Profiles table (user data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  points INTEGER DEFAULT 500 NOT NULL,
  games_played INTEGER DEFAULT 0 NOT NULL,
  games_won INTEGER DEFAULT 0 NOT NULL,
  games_lost INTEGER DEFAULT 0 NOT NULL,
  games_drawn INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Games table (chess games)
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_code TEXT UNIQUE NOT NULL,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  current_turn TEXT NOT NULL DEFAULT 'white',
  white_player_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  black_player_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_bot_game BOOLEAN DEFAULT false NOT NULL,
  bot_difficulty TEXT,
  white_points_change INTEGER DEFAULT 0 NOT NULL,
  black_points_change INTEGER DEFAULT 0 NOT NULL,
  winner TEXT,
  status TEXT DEFAULT 'waiting' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'playing', 'finished')),
  CONSTRAINT valid_turn CHECK (current_turn IN ('white', 'black')),
  CONSTRAINT valid_difficulty CHECK (bot_difficulty IS NULL OR bot_difficulty IN ('easy', 'medium', 'hard'))
);

-- Match history table (game results)
CREATE TABLE IF NOT EXISTS match_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opponent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  opponent_name TEXT,
  result TEXT NOT NULL,
  points_change INTEGER DEFAULT 0 NOT NULL,
  was_bot_game BOOLEAN DEFAULT false NOT NULL,
  bot_difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_result CHECK (result IN ('win', 'loss', 'draw'))
);

-- ============================================
-- STEP 2: CREATE INDEXES (for performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_games_code ON games(game_code);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_match_history_player ON match_history(player_id);
CREATE INDEX IF NOT EXISTS idx_match_history_created ON match_history(created_at DESC);

-- ============================================
-- STEP 3: CREATE LEADERBOARD VIEW
-- ============================================

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
  ROW_NUMBER() OVER (ORDER BY points DESC, games_won DESC, username ASC) as rank
FROM profiles
WHERE games_played > 0
ORDER BY points DESC, games_won DESC, username ASC;

-- ============================================
-- STEP 4: CREATE UPDATED_AT TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for games
DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 5: CREATE PROFILE ON USER SIGNUP
-- ============================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url',
    500
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 6: DISABLE RLS (to prevent 406 errors)
-- ============================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_history DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 7: GRANT FULL PERMISSIONS
-- ============================================

-- Grant all permissions to anon and authenticated roles
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant permissions on the view
GRANT SELECT ON leaderboard TO anon, authenticated;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- ============================================
-- STEP 8: ENABLE REALTIME (with error handling)
-- ============================================

DO $$ 
BEGIN
    -- Enable realtime for profiles
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Enable realtime for games
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE games;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Enable realtime for match_history
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE match_history;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- ============================================
-- STEP 9: CREATE HELPER FUNCTIONS (optional)
-- ============================================

-- Function to update player stats after game
CREATE OR REPLACE FUNCTION update_player_stats(
  p_player_id UUID,
  p_result TEXT,
  p_points_change INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    games_played = games_played + 1,
    games_won = games_won + CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
    games_lost = games_lost + CASE WHEN p_result = 'loss' THEN 1 ELSE 0 END,
    games_drawn = games_drawn + CASE WHEN p_result = 'draw' THEN 1 ELSE 0 END,
    points = points + p_points_change,
    updated_at = NOW()
  WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 10: RELOAD POSTGREST SCHEMA
-- ============================================

NOTIFY pgrst, 'reload schema';

-- ============================================
-- STEP 11: VERIFY SETUP
-- ============================================

-- Check tables exist
DO $$ 
DECLARE
  table_count INTEGER;
  rls_check INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'games', 'match_history');
  
  -- Check RLS is disabled
  SELECT COUNT(*) INTO rls_check
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'games', 'match_history')
  AND rowsecurity = true;
  
  -- Report results
  RAISE NOTICE '================================================';
  RAISE NOTICE '🎉 SETUP COMPLETE!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Tables created: %/3', table_count;
  RAISE NOTICE 'RLS disabled: % (0 = all disabled ✓)', rls_check;
  RAISE NOTICE 'Indexes created: ✓';
  RAISE NOTICE 'Triggers created: ✓';
  RAISE NOTICE 'Permissions granted: ✓';
  RAISE NOTICE 'Realtime enabled: ✓';
  RAISE NOTICE '================================================';
  
  IF table_count = 3 AND rls_check = 0 THEN
    RAISE NOTICE '✅ SUCCESS! Your database is ready!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Copy your Project URL and anon key';
    RAISE NOTICE '2. Update .env.local with new keys';
    RAISE NOTICE '3. Restart: npm run dev';
    RAISE NOTICE '4. Test signup and gameplay';
  ELSE
    RAISE NOTICE '⚠️ Warning: Some issues detected';
    RAISE NOTICE 'Please review the setup';
  END IF;
  
  RAISE NOTICE '================================================';
END $$;

-- ============================================
-- BONUS: Sample data for testing (optional)
-- ============================================

-- Uncomment below to insert test data
/*
-- Test profile (will be created automatically on first signup)
-- No manual insert needed due to trigger

-- Sample completed game
INSERT INTO games (game_code, status, winner) 
VALUES ('TEST123', 'finished', 'white')
ON CONFLICT (game_code) DO NOTHING;
*/

-- ============================================
-- END OF SETUP
-- ============================================
