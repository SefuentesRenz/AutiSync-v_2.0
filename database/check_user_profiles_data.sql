-- Check user_profiles table structure and sample data
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Sample data from user_profiles
SELECT id, email, first_name, last_name, username 
FROM user_profiles 
LIMIT 5;