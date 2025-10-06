-- Check if admin users can access user_activity_progress data
-- This query will help identify if RLS is blocking admin access

-- Show current RLS policies on user_activity_progress
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_activity_progress';

-- Test if admin can see all records (run this as an admin user)
SELECT COUNT(*) as total_records FROM user_activity_progress;

-- Show sample of progress records
SELECT student_id, activity_id, score, completion_status, date_completed 
FROM user_activity_progress 
ORDER BY date_completed DESC 
LIMIT 5;