-- Fix parent_child_relations table foreign key issues
-- Run this in your Supabase SQL Editor

-- Drop the table completely to remove all constraints
DROP TABLE IF EXISTS parent_child_relations CASCADE;

-- Create the table WITHOUT foreign key constraints to avoid issues
CREATE TABLE parent_child_relations (
    id SERIAL PRIMARY KEY,
    parent_user_id UUID NOT NULL,
    child_user_id UUID NOT NULL,
    parent_email TEXT NOT NULL,
    child_email TEXT NOT NULL,
    relationship_type TEXT DEFAULT 'parent',
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique relationships
    UNIQUE(parent_user_id, child_user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_parent_child_relations_parent_user_id ON parent_child_relations(parent_user_id);
CREATE INDEX idx_parent_child_relations_child_user_id ON parent_child_relations(child_user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE parent_child_relations ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own parent-child relationships" ON parent_child_relations
    FOR SELECT USING (
        auth.uid() = parent_user_id OR 
        auth.uid() = child_user_id
    );

CREATE POLICY "Parents can create relationships" ON parent_child_relations
    FOR INSERT WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Parents can update their relationships" ON parent_child_relations
    FOR UPDATE USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can delete their relationships" ON parent_child_relations
    FOR DELETE USING (auth.uid() = parent_user_id);

-- Grant necessary permissions
GRANT ALL ON parent_child_relations TO authenticated;
GRANT USAGE ON SEQUENCE parent_child_relations_id_seq TO authenticated;