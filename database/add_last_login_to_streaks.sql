-- Add last_login column to streaks table for 24-hour streak tracking
-- Run this SQL in your Supabase SQL editor

ALTER TABLE streaks 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update existing records to have a last_login timestamp if they don't have one
UPDATE streaks 
SET last_login = updated_at 
WHERE last_login IS NULL AND updated_at IS NOT NULL;

-- For records with no timestamps at all, set to current time
UPDATE streaks 
SET last_login = NOW()
WHERE last_login IS NULL;