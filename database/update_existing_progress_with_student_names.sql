-- Update existing user_activity_progress records to include student names
-- This will populate the student_name column for all existing progress records

UPDATE user_activity_progress 
SET student_name = up.full_name
FROM user_profiles up
WHERE user_activity_progress.user_id = up.id 
  AND (user_activity_progress.student_name IS NULL OR user_activity_progress.student_name = '');

-- Verify the update
SELECT 
  uap.id,
  uap.student_name,
  uap.score,
  uap.completion_status,
  uap.date_completed,
  up.full_name as profile_full_name
FROM user_activity_progress uap
LEFT JOIN user_profiles up ON uap.user_id = up.id
ORDER BY uap.date_completed DESC
LIMIT 10;