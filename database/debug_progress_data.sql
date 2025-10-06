-- Debug queries to check progress data in the database

-- 1. Check what student_ids exist in user_activity_progress table
SELECT DISTINCT student_id, COUNT(*) as activity_count 
FROM user_activity_progress 
GROUP BY student_id;

-- 2. Check what user_profile ids exist for students
SELECT id, user_id, first_name, last_name, role 
FROM user_profiles 
WHERE role = 'student' OR role IS NULL;

-- 3. Check sample progress records
SELECT * FROM user_activity_progress LIMIT 10;

-- 4. Check if there's a specific student's progress
-- Replace 'YOUR_PROFILE_ID' with the actual profile ID from the parent dashboard logs
-- SELECT * FROM user_activity_progress WHERE student_id = 'YOUR_PROFILE_ID';

-- 5. Check activities table
SELECT id, title, category_id FROM activities LIMIT 5;