-- Migration: Add game_type column to image_games table
-- Date: 2025-02-01
-- Description: Adds game_type column to support two modes: 'region' (existing) and 'text-cover' (new)

-- Add game_type column with default value 'region' for existing records
ALTER TABLE image_games 
ADD COLUMN IF NOT EXISTS game_type TEXT DEFAULT 'region';

-- Drop constraint if exists, then add it (to avoid duplicate error)
ALTER TABLE image_games
DROP CONSTRAINT IF EXISTS valid_game_type;

ALTER TABLE image_games
ADD CONSTRAINT valid_game_type CHECK (game_type IN ('region', 'text-cover'));

-- Create index for faster filtering by game type
CREATE INDEX IF NOT EXISTS idx_image_games_type ON image_games(game_type);

-- Update existing records to have 'region' type (if any exist without it)
UPDATE image_games SET game_type = 'region' WHERE game_type IS NULL;

-- Verify the migration
SELECT 
  COUNT(*) as total_games,
  COUNT(CASE WHEN game_type = 'region' THEN 1 END) as region_games,
  COUNT(CASE WHEN game_type = 'text-cover' THEN 1 END) as text_cover_games
FROM image_games;
