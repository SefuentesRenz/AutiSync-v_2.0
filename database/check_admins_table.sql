-- Check the structure of the admins table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admins' 
ORDER BY ordinal_position;

-- Check what data exists in admins table
SELECT * FROM admins LIMIT 5;

-- Check your current authenticated user ID
SELECT auth.uid() as current_user_id;