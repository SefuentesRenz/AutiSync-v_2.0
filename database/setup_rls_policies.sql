-- Setup Row Level Security policies for user_activity_progress table

-- Enable RLS on the table
ALTER TABLE user_activity_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own progress records
CREATE POLICY "Users can insert own progress" ON user_activity_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own progress records
CREATE POLICY "Users can view own progress" ON user_activity_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own progress records
CREATE POLICY "Users can update own progress" ON user_activity_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own progress records (optional)
CREATE POLICY "Users can delete own progress" ON user_activity_progress
  FOR DELETE USING (auth.uid() = user_id);

-- If you want admins to have full access, also add:
-- CREATE POLICY "Admins can manage all progress" ON user_activity_progress
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM user_profiles 
--       WHERE user_profiles.id = auth.uid() 
--       AND user_profiles.role = 'admin'
--     )
--   );