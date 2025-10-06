-- Check what activities exist in the database
SELECT id, name, category, difficulty FROM activities ORDER BY id;

-- Also check the structure of the activities table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'activities' 
ORDER BY ordinal_position;