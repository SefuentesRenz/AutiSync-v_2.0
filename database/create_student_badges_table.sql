-- Create student_badges table to match the API expectations
-- This table is used by badgesApi.js to track badges earned by students

CREATE TABLE IF NOT EXISTS student_badges (
    id SERIAL PRIMARY KEY,
    student_id UUID NOT NULL,
    badge_id INTEGER REFERENCES badges(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    badge_name VARCHAR(255),
    badge_icon VARCHAR(500),
    badge_rarity VARCHAR(50) DEFAULT 'Common',
    activity_name VARCHAR(255),
    activity_category VARCHAR(255),
    activity_difficulty VARCHAR(50),
    session_score VARCHAR(50),
    UNIQUE(student_id, badge_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_badge_id ON student_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_earned_at ON student_badges(earned_at);

-- Enable Row Level Security
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_badges 
CREATE POLICY "Users can view own student badges" ON student_badges
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own student badges" ON student_badges
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "System can insert student badges" ON student_badges
    FOR INSERT WITH CHECK (true);

-- Allow admins to view all student badges
CREATE POLICY "Admins can view all student badges" ON student_badges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );