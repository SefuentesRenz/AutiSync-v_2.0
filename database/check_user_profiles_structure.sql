-- Check the structure of user_profiles table to see if it has a role column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Also check what data exists in user_profiles
SELECT id, role FROM user_profiles LIMIT 5;