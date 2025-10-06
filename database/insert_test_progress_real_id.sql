-- Insert test progress data using the actual profile ID from console logs
-- Replace the student_id with the actual profile ID: 6c08468a-dc45-4206-9793-83743f152bf2

-- First, make sure activities exist
INSERT INTO activities (id, title, category_id, difficulty_id, description) VALUES
(1, 'Basic Colors', 'Easy-identificaction', 'Easy', 'Learn basic colors through flashcards'),
(2, 'Basic Shapes', 'Easy-identificaction', 'Easy', 'Identify basic geometric shapes'),
(3, 'Numbers 1-10', 'Easy-Numbers', 'Easy', 'Basic number recognition')
ON CONFLICT (id) DO NOTHING;

-- Insert progress records with the actual profile ID
INSERT INTO user_activity_progress (student_id, activity_id, score, completion_status, date_completed) VALUES
('6c08468a-dc45-4206-9793-83743f152bf2', 1, 95, 'completed', '2024-10-01'),
('6c08468a-dc45-4206-9793-83743f152bf2', 2, 87, 'completed', '2024-10-02'),
('6c08468a-dc45-4206-9793-83743f152bf2', 3, 92, 'completed', '2024-10-03')
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT * FROM user_activity_progress WHERE student_id = '6c08468a-dc45-4206-9793-83743f152bf2';