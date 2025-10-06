-- Remove problematic foreign key constraints to allow direct use of Supabase Auth user IDs

-- Drop foreign key constraint from user_activity_progress to students table
ALTER TABLE user_activity_progress 
DROP CONSTRAINT IF EXISTS "User Activity Progress_student_id_fkey";

-- Drop foreign key constraint from streaks to students table  
ALTER TABLE streaks 
DROP CONSTRAINT IF EXISTS "streaks_user_id_fkey";

-- Keep the activity_id foreign key since activities table exists and works
-- ALTER TABLE user_activity_progress 
-- DROP CONSTRAINT IF EXISTS "User Activity Progress_activity_id_fkey";

-- Add basic validation for UUID format (optional)
ALTER TABLE user_activity_progress 
ADD CONSTRAINT IF NOT EXISTS valid_student_id_format 
CHECK (student_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

ALTER TABLE streaks 
ADD CONSTRAINT IF NOT EXISTS valid_user_id_format 
CHECK (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');