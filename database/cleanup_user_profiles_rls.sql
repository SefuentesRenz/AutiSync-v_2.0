-- Clean up conflicting RLS policies on user_profiles
-- Drop old policies that use user_id
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON user_profiles;

-- Keep the correct policies that use 'id' column
-- The admin policy is already correct: "Admins can read all user profiles"
-- The user policy is already correct: "Users can read own profile"

-- Make sure we have the essential policies using 'id' column
CREATE POLICY IF NOT EXISTS "Users can read own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Verify the final policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';