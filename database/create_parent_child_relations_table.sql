-- Create parent_child_relations table for linking parents and children
-- This table uses int4 (integer) IDs to match your existing schema

CREATE TABLE IF NOT EXISTS public.parent_child_relations (
    id SERIAL PRIMARY KEY,
    parent_user_id INTEGER NOT NULL,
    child_user_id INTEGER NOT NULL,
    parent_email VARCHAR(255),
    child_email VARCHAR(255),
    relationship_type VARCHAR(50) DEFAULT 'parent',
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique parent-child combinations
    UNIQUE(parent_user_id, child_user_id),
    
    -- Foreign key constraints (optional - only if you have these tables)
    -- FOREIGN KEY (parent_user_id) REFERENCES auth.users(id),
    -- FOREIGN KEY (child_user_id) REFERENCES auth.users(id)
    
    -- Indexes for better performance
    INDEX idx_parent_child_parent_id (parent_user_id),
    INDEX idx_parent_child_child_id (child_user_id)
);

-- Add comments for documentation
COMMENT ON TABLE public.parent_child_relations IS 'Stores relationships between parent and child accounts';
COMMENT ON COLUMN public.parent_child_relations.parent_user_id IS 'Auth user ID of the parent (int4)';
COMMENT ON COLUMN public.parent_child_relations.child_user_id IS 'Auth user ID of the child/student (int4)';
COMMENT ON COLUMN public.parent_child_relations.relationship_type IS 'Type of relationship (parent, guardian, etc.)';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_child_relations TO authenticated;
-- GRANT USAGE ON SEQUENCE parent_child_relations_id_seq TO authenticated;