-- Update user_activity_progress table to use correct Supabase Auth UUIDs

-- Update Isaiah's progress records
UPDATE user_activity_progress
SET student_id = '6c08468a-dc45-4206-9793-83743f152bf2'
WHERE student_id = '1c623fa0-8f30-46fa-8270-bf951266616b';

-- Check if there are other mismatched UUIDs in progress records
SELECT DISTINCT student_id 
FROM user_activity_progress 
WHERE student_id NOT IN (
  SELECT id FROM user_profiles
);

-- Check all current progress records to verify they match user_profiles
SELECT 
  uap.student_id,
  up.full_name,
  up.email,
  COUNT(uap.id) as activity_count
FROM user_activity_progress uap
LEFT JOIN user_profiles up ON uap.student_id = up.id
GROUP BY uap.student_id, up.full_name, up.email
ORDER BY uap.student_id;