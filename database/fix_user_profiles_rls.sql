-- Check current RLS policies on user_profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Check if RLS is enabled on user_profiles
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Create or update RLS policy to allow admins to read all user profiles
DROP POLICY IF EXISTS "Admins can read all user profiles" ON user_profiles;

CREATE POLICY "Admins can read all user profiles"
ON user_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()
  )
);

-- Also ensure there's a policy for users to read their own profiles
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

CREATE POLICY "Users can read own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Check the policies after creation
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';