-- Create activities table if it doesn't exist and add sample activities
-- This provides activity IDs that can be referenced in the User Activity Progress table

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(100),
    difficulty_id VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample activities for testing
INSERT INTO activities (id, title, category_id, difficulty_id, description) VALUES
(1, 'Basic Colors', 'Easy-identificaction', 'Easy', 'Learn basic colors through flashcards'),
(2, 'Advanced Colors', 'Easy-identificaction', 'Medium', 'Advanced color identification'),
(3, 'Color Mixing', 'Easy-identificaction', 'Hard', 'Understanding color combinations'),
(4, 'Basic Shapes', 'Easy-identificaction', 'Easy', 'Identify basic geometric shapes'),
(5, 'Shape Recognition', 'Easy-identificaction', 'Medium', 'Advanced shape recognition'),
(6, 'Numbers 1-10', 'Easy-Numbers', 'Easy', 'Basic number recognition'),
(7, 'Numbers 11-20', 'Easy-Numbers', 'Medium', 'Extended number recognition'),
(8, 'Basic Math', 'Easy-Numbers', 'Hard', 'Simple addition and subtraction'),
(9, 'Hygiene Hero', 'Daily Life Skills', 'Easy', 'Learn proper hygiene habits'),
(10, 'Cashier Game', 'Daily Life Skills', 'Medium', 'Practice money handling and social interaction'),
(11, 'Safe Street Crossing', 'Daily Life Skills', 'Medium', 'Learn traffic safety rules'),
(12, 'Tooth Brushing', 'Daily Life Skills', 'Easy', 'Proper tooth brushing techniques')
ON CONFLICT (id) DO NOTHING;

-- Update the sequence to continue from the last inserted ID
SELECT setval('activities_id_seq', (SELECT MAX(id) FROM activities));