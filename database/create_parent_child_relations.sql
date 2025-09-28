-- Create parent_child_relations table for linking parents and children
CREATE TABLE IF NOT EXISTS parent_child_relations (
    id SERIAL PRIMARY KEY,
    parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_email TEXT NOT NULL,
    child_email TEXT NOT NULL,
    relationship_type TEXT DEFAULT 'parent',
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique relationships
    UNIQUE(parent_user_id, child_user_id),
    UNIQUE(parent_email, child_email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parent_child_relations_parent_user_id ON parent_child_relations(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_relations_child_user_id ON parent_child_relations(child_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_relations_parent_email ON parent_child_relations(parent_email);
CREATE INDEX IF NOT EXISTS idx_parent_child_relations_child_email ON parent_child_relations(child_email);

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

-- Insert some test data
INSERT INTO parent_child_relations (parent_user_id, child_user_id, parent_email, child_email, relationship_type) VALUES
    -- These are placeholder UUIDs - replace with actual user IDs when testing
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'parent1@example.com', 'child1@example.com', 'parent'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'parent1@example.com', 'child2@example.com', 'parent')
ON CONFLICT (parent_email, child_email) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE parent_child_relations IS 'Stores relationships between parent and child accounts';
COMMENT ON COLUMN parent_child_relations.parent_user_id IS 'UUID of the parent user from auth.users';
COMMENT ON COLUMN parent_child_relations.child_user_id IS 'UUID of the child user from auth.users';
COMMENT ON COLUMN parent_child_relations.relationship_type IS 'Type of relationship (parent, guardian, etc.)';