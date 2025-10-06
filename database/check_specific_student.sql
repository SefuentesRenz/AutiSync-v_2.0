-- Check specific student's profile data
SELECT id, email, full_name, username 
FROM user_profiles 
WHERE id LIKE '1c623fa0%' OR id LIKE '%1c623fa0%';

-- Check all student profiles
SELECT id, email, full_name, username 
FROM user_profiles;