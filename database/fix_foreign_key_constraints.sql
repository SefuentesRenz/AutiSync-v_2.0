-- Fix foreign key issues for user_activity_progress table
-- Remove the foreign key constraint that references the 'students' table
-- since we're using Supabase auth users directly

-- Drop the existing foreign key constraint
ALTER TABLE user_activity_progress 
DROP CONSTRAINT IF EXISTS "User Activity Progress_user_id_fkey";

-- Drop the constraint on streaks table as well
ALTER TABLE streaks 
DROP CONSTRAINT IF EXISTS "streaks_user_id_fkey";

-- Optionally, you can add a check to ensure user_id is a valid UUID
ALTER TABLE user_activity_progress 
ADD CONSTRAINT valid_user_id_format 
CHECK (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

ALTER TABLE streaks 
ADD CONSTRAINT valid_user_id_format 
CHECK (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');