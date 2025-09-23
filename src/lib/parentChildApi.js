// src/lib/parentChildApi.js
import { supabase } from './supabase';

// Create a parent-child relationship
export async function linkParentToChild(parentUserId, childUserId, parentEmail, childEmail) {
  try {
    console.log('parentChildApi: Linking parent to child:', { parentUserId, childUserId, parentEmail, childEmail });
    
    // Check if relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('parent_child_relations')
      .select('id')
      .eq('parent_user_id', parentUserId)
      .eq('child_user_id', childUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means "no rows returned" which is fine, any other error needs handling
      if (checkError.message.includes('does not exist') || checkError.message.includes('schema cache')) {
        return { 
          data: null, 
          error: { 
            message: 'Database table not set up. Please run the database setup script first.',
            details: 'The parent_child_relations table does not exist. Check the database folder for setup scripts.'
          } 
        };
      }
      return { data: null, error: checkError };
    }

    if (existing) {
      return { data: existing, error: { message: 'Relationship already exists' } };
    }
    
    const { data, error } = await supabase
      .from('parent_child_relations')
      .insert([{
        parent_user_id: parentUserId,
        child_user_id: childUserId,
        parent_email: parentEmail,
        child_email: childEmail,
        relationship_type: 'parent'
      }])
      .select();
      
    console.log('parentChildApi: Link result:', { data, error });
    return { data, error };
  } catch (e) {
    console.error('parentChildApi: Unexpected error:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all children for a parent
export async function getChildrenByParentId(parentUserId) {
  const { data, error } = await supabase
    .from('parent_child_relations')
    .select(`
      *,
      user_profiles!parent_child_relations_child_user_id_fkey(
        id,
        user_id,
        username,
        first_name,
        last_name,
        email,
        age,
        grade,
        gender
      )
    `)
    .eq('parent_user_id', parentUserId);
  return { data, error };
}

// Get all parents for a child
export async function getParentsByStudentId(childUserId) {
  const { data, error } = await supabase
    .from('parent_child_relations')
    .select(`
      *,
      user_profiles!parent_child_relations_parent_user_id_fkey(
        id,
        user_id,
        username,
        first_name,
        last_name,
        email,
        phone_number
      )
    `)
    .eq('child_user_id', childUserId);
  return { data, error };
}

// Check if parent-child relationship exists
export async function checkParentChildRelationship(parentUserId, childUserId) {
  const { data, error } = await supabase
    .from('parent_child_relations')
    .select('*')
    .eq('parent_user_id', parentUserId)
    .eq('child_user_id', childUserId)
    .single();
  return { data, error };
}

// Remove parent-child relationship
export async function unlinkParentFromChild(relationId) {
  const { data, error } = await supabase
    .from('parent_child_relations')
    .delete()
    .eq('id', relationId);
  return { data, error };
}

// Find student by email
export async function findStudentByEmail(email) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();
  return { data, error };
}