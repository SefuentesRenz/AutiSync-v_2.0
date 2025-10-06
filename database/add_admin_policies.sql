-- Add admin policies to allow admins to view all student progress

-- First, check if user_profiles table has a role column to identify admins
-- If not, we'll use a different approach

-- Option 1: If you have a role column in user_profiles
CREATE POLICY "Admins can view all progress" ON user_activity_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Option 2: If you don't have a role column, we can allow specific admin emails
-- Replace 'admin@example.com' with your actual admin email
-- CREATE POLICY "Specific admins can view all progress" ON user_activity_progress
--   FOR SELECT USING (
--     auth.jwt() ->> 'email' IN ('admin@example.com', 'your-email@domain.com')
--   );

-- Option 3: Temporary solution - allow all authenticated users to view all progress
-- (Use this only for testing, not recommended for production)
-- CREATE POLICY "Allow all authenticated users to view progress" ON user_activity_progress
--   FOR SELECT USING (auth.role() = 'authenticated');