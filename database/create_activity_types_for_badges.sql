-- Update/Create activities table to support different activity types for All-Rounder badge
-- This ensures we have proper category separation for badge calculations

-- Insert or update activities with proper categories
INSERT INTO activities (id, title, category, difficulty, description) VALUES
(1, 'Numbers & Counting', 'Numbers', 'Easy', 'Learn numbers and counting'),
(2, 'Shape Recognition', 'Shapes', 'Easy', 'Identify and learn geometric shapes'),
(3, 'Daily Life Skills', 'Social/Daily Life', 'Medium', 'Practice daily living skills'),
(4, 'Color Learning', 'Colors', 'Easy', 'Learn and identify colors'),
(5, 'Object Identification', 'Identification', 'Easy', 'Identify objects, animals, and actions'),
(6, 'Matching Activities', 'Matching', 'Medium', 'Match related items and concepts'),
(7, 'Memory Challenges', 'Memory', 'Medium', 'Visual and cognitive memory exercises'),
(8, 'Academic Puzzles', 'Puzzles', 'Medium', 'Problem-solving and puzzle activities')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description;

-- Verify the activities were created/updated
SELECT id, title, category, difficulty FROM activities ORDER BY id;