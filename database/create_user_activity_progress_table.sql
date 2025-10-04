-- Create User Activity Progress table for tracking student activity completions
-- This table stores completion data for all student activities

CREATE TABLE IF NOT EXISTS "User Activity Progress" (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL,
    score INTEGER,
    completion_status VARCHAR(20) DEFAULT 'completed',
    date_completed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_spent INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_progress_user_id ON "User Activity Progress"(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_progress_activity_id ON "User Activity Progress"(activity_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_progress_date_completed ON "User Activity Progress"(date_completed);

-- Create unique constraint to prevent duplicate entries for same user and activity
-- (Remove this if you want to allow multiple attempts)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activity_progress_unique ON "User Activity Progress"(user_id, activity_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_activity_progress_updated_at 
    BEFORE UPDATE ON "User Activity Progress" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO "User Activity Progress" (user_id, activity_id, score, completion_status) 
-- VALUES 
-- ('user-uuid-here', 1, 85, 'completed'),
-- ('user-uuid-here', 2, 92, 'completed');