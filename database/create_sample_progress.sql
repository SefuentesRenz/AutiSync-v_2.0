-- Create sample progress data for testing parent dashboard
-- This script adds test progress records for student users

-- First, let's check if we have any student users
-- You'll need to replace these with actual user_profile IDs from your database

-- Sample progress data for testing
-- Replace student_id values with actual user_profile.id values from your database

INSERT INTO user_activity_progress (student_id, activity_id, score, completion_status, date_completed) VALUES
-- Student 1 progress
(1, 1, 95, 'completed', '2024-01-15'),
(1, 2, 87, 'completed', '2024-01-16'),
(1, 3, 92, 'completed', '2024-01-17'),
(1, 4, 89, 'completed', '2024-01-18'),
(1, 6, 94, 'completed', '2024-01-19'),
(1, 7, 88, 'completed', '2024-01-20'),
(1, 9, 91, 'completed', '2024-01-21'),

-- Student 2 progress (different completion rates)
(2, 1, 78, 'completed', '2024-01-10'),
(2, 2, 82, 'completed', '2024-01-12'),
(2, 4, 85, 'completed', '2024-01-14'),
(2, 6, 79, 'completed', '2024-01-16'),
(2, 9, 88, 'completed', '2024-01-18')
ON CONFLICT DO NOTHING;

-- Note: You'll need to update the student_id values to match actual user_profile.id values
-- Run this query first to get the actual student IDs:
-- SELECT id, first_name, last_name FROM user_profiles WHERE role = 'student';