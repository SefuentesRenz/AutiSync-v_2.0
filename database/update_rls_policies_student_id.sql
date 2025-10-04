-- Update RLS policies for user_activity_progress table to use student_id instead of user_id

-- Drop the existing policies
DROP POLICY IF EXISTS "Users can insert own progress" ON user_activity_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON user_activity_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_activity_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_activity_progress;

-- Create new policies using student_id
CREATE POLICY "Users can insert own progress" ON user_activity_progress
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can view own progress" ON user_activity_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can update own progress" ON user_activity_progress
  FOR UPDATE USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can delete own progress" ON user_activity_progress
  FOR DELETE USING (auth.uid() = student_id);