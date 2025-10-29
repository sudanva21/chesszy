-- ==========================================
-- COMPLETE CHESS GAME SCHEMA WITH AUTH
-- ==========================================

-- Create user profiles table
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

-- Create games table (updated)
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_code TEXT UNIQUE NOT NULL,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  current_turn TEXT NOT NULL DEFAULT 'white',
  white_player_id UUID REFERENCES profiles(id),
  black_player_id UUID REFERENCES profiles(id),
  is_bot_game BOOLEAN DEFAULT FALSE,
  bot_difficulty TEXT, -- 'easy', 'medium', 'hard'
  status TEXT NOT NULL DEFAULT 'waiting',
  winner TEXT,
  white_points_change INTEGER DEFAULT 0,
  black_points_change INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Create match history table
CREATE TABLE IF NOT EXISTS match_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES profiles(id),
  opponent_id UUID REFERENCES profiles(id),
  opponent_name TEXT,
  result TEXT NOT NULL, -- 'win', 'loss', 'draw'
  points_change INTEGER NOT NULL,
  was_bot_game BOOLEAN DEFAULT FALSE,
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
    WHEN games_played > 0 THEN ROUND((games_won::numeric / games_played::numeric) * 100, 1)
    ELSE 0 
  END as win_rate,
  DENSE_RANK() OVER (ORDER BY points DESC) as rank
FROM profiles
WHERE games_played > 0
ORDER BY points DESC, games_won DESC;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_code ON games(game_code);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_white_player ON games(white_player_id);
CREATE INDEX IF NOT EXISTS idx_games_black_player ON games(black_player_id);
CREATE INDEX IF NOT EXISTS idx_match_history_player ON match_history(player_id);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Games policies
CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Players can update their games"
  ON games FOR UPDATE
  USING (
    auth.uid() = white_player_id OR 
    auth.uid() = black_player_id OR
    is_bot_game = true
  );

-- Match history policies
CREATE POLICY "Users can view own match history"
  ON match_history FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "System can insert match history"
  ON match_history FOR INSERT
  WITH CHECK (true);

-- Function to update profile stats after game
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished' AND NEW.is_bot_game = FALSE THEN
    -- Update white player
    IF NEW.white_player_id IS NOT NULL THEN
      UPDATE profiles SET
        games_played = games_played + 1,
        games_won = games_won + CASE WHEN NEW.winner = 'white' THEN 1 ELSE 0 END,
        games_lost = games_lost + CASE WHEN NEW.winner = 'black' THEN 1 ELSE 0 END,
        games_drawn = games_drawn + CASE WHEN NEW.winner = 'draw' THEN 1 ELSE 0 END,
        points = points + NEW.white_points_change
      WHERE id = NEW.white_player_id;
    END IF;
    
    -- Update black player
    IF NEW.black_player_id IS NOT NULL THEN
      UPDATE profiles SET
        games_played = games_played + 1,
        games_won = games_won + CASE WHEN NEW.winner = 'black' THEN 1 ELSE 0 END,
        games_lost = games_lost + CASE WHEN NEW.winner = 'white' THEN 1 ELSE 0 END,
        games_drawn = games_drawn + CASE WHEN NEW.winner = 'draw' THEN 1 ELSE 0 END,
        points = points + NEW.black_points_change
      WHERE id = NEW.black_player_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats
DROP TRIGGER IF EXISTS update_stats_on_game_finish ON games;
CREATE TRIGGER update_stats_on_game_finish
  AFTER UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || substr(NEW.id::text, 1, 6)),
    500
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE match_history;
