-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_code TEXT UNIQUE NOT NULL,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  current_turn TEXT NOT NULL DEFAULT 'white',
  white_player TEXT,
  black_player TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on game_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_games_game_code ON games(game_code);

-- Create index on status for filtering active games
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read games
CREATE POLICY "Anyone can view games"
  ON games
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to create games
CREATE POLICY "Anyone can create games"
  ON games
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to update games
CREATE POLICY "Anyone can update games"
  ON games
  FOR UPDATE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for the games table
ALTER PUBLICATION supabase_realtime ADD TABLE games;
