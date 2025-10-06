-- Create badges and streaks tables for the AutiSync application

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    criteria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table for tracking earned badges
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_id INTEGER REFERENCES badges(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Create streaks table for tracking daily activity streaks
CREATE TABLE IF NOT EXISTS streaks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample badges
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('First Steps', 'Complete your first activity', '🌟', 'Complete 1 activity'),
('Learning Streak', 'Complete activities for 3 days in a row', '🔥', 'Maintain a 3-day streak'),
('Perfect Week', 'Complete activities for 7 days in a row', '⭐', 'Maintain a 7-day streak'),
('High Achiever', 'Score 90% or higher on 5 activities', '🏆', 'Score 90%+ on 5 activities'),
('Category Explorer', 'Complete activities in 3 different categories', '🎯', 'Complete activities in 3 categories'),
('Persistence', 'Complete 50 activities total', '💪', 'Complete 50 activities'),
('Master Learner', 'Complete 100 activities total', '👑', 'Complete 100 activities')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);

-- Enable Row Level Security
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for badges (public read)
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

-- Create RLS policies for user_badges
CREATE POLICY "Users can view own badges" ON user_badges 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for streaks
CREATE POLICY "Users can view own streaks" ON streaks 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON streaks 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON streaks 
    FOR UPDATE USING (auth.uid() = user_id);