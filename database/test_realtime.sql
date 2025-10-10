-- Quick test to verify Realtime is configured correctly

-- 1. Check if messages table is in realtime publication
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'messages';
-- Expected: Should return 1 row showing messages table

-- 2. Check all tables in realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
-- Expected: Should include 'messages' in the list

-- 3. If messages is NOT in the list, run this:
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 4. Verify RLS policies on messages table
SELECT * FROM pg_policies WHERE tablename = 'messages';
-- Expected: Should show at least 2 policies (SELECT and INSERT)

-- 5. Test insert (will trigger realtime if configured)
-- First, get a valid room_id and user_id:
SELECT 
  (SELECT id FROM rooms LIMIT 1) as room_id,
  (SELECT id FROM user_profiles LIMIT 1) as user_id;

-- Then insert a test message (replace the UUIDs with actual ones from above):
-- INSERT INTO messages (room_id, user_id, text) 
-- VALUES ('YOUR-ROOM-ID', 'YOUR-USER-ID', 'Test realtime message');

-- 6. Check if message was inserted
SELECT m.*, up.full_name, up.username 
FROM messages m
LEFT JOIN user_profiles up ON m.user_id = up.id
ORDER BY m.created_at DESC
LIMIT 5;
