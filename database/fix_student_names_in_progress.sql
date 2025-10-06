-- Script to diagnose and fix student names in user_activity_progress table

-- 1. Check current state of user_activity_progress table
SELECT 
  COUNT(*) as total_records,
  COUNT(student_name) as records_with_names,
  COUNT(*) - COUNT(student_name) as records_without_names
FROM user_activity_progress;

-- 2. Check what user_ids exist in progress table but not in user_profiles
SELECT DISTINCT 
  uap.student_id,
  up.user_id,
  up.full_name
FROM user_activity_progress uap
LEFT JOIN user_profiles up ON uap.student_id = up.user_id
WHERE up.user_id IS NULL
LIMIT 10;

-- 3. Update existing records with student names (using student_id column)
UPDATE user_activity_progress 
SET student_name = up.full_name
FROM user_profiles up
WHERE user_activity_progress.student_id = up.user_id 
  AND (user_activity_progress.student_name IS NULL OR user_activity_progress.student_name = '');

-- 4. Verify the update worked
SELECT 
  uap.id,
  uap.student_id,
  uap.student_name,
  uap.score,
  uap.completion_status,
  uap.date_completed,
  up.full_name as profile_full_name
FROM user_activity_progress uap
LEFT JOIN user_profiles up ON uap.student_id = up.user_id
ORDER BY uap.date_completed DESC
LIMIT 10;

-- 5. Check for any remaining null student names
SELECT COUNT(*) as remaining_null_names
FROM user_activity_progress 
WHERE student_name IS NULL;