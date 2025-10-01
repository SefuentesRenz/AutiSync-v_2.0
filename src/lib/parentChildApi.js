// src/lib/parentChildApi.js
import { supabase } from './supabase';

// Create a parent-child relationship
export async function linkParentToChild(parentUserId, childUserId, parentEmail, childEmail) {
  try {
    console.log('parentChildApi: Linking parent to child:', { parentUserId, childUserId, parentEmail, childEmail });
    
    // First, get the parent record by user_id
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', parentUserId)
      .single();
    
    if (parentError || !parentData) {
      console.error('Parent not found for user_id:', parentUserId);
      return { 
        data: null, 
        error: { message: 'Parent account not found. Please ensure you have a parent profile setup.' } 
      };
    }

    // Get the student record by user_id through user_profiles
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        user_profiles!inner (
          user_id
        )
      `)
      .eq('user_profiles.user_id', childUserId)
      .single();
    
    if (studentError || !studentData) {
      console.error('Student not found for user_id:', childUserId);
      return { 
        data: null, 
        error: { message: 'Student account not found. Please ensure the child has a student profile.' } 
      };
    }

    // Check if relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('parent_child_relations')
      .select('id')
      .eq('parent_user_id', parentData.id)
      .eq('child_user_id', studentData.id)
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
    
    // Create the relationship using the correct foreign keys
    const { data, error } = await supabase
      .from('parent_child_relations')
      .insert([{
        parent_user_id: parentData.id,
        child_user_id: studentData.id,
        relationship_type: 'parent',
        linked_at: new Date().toISOString()
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
  try {
    // First get the parent record
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', parentUserId)
      .single();
      
    if (parentError || !parentData) {
      return { data: [], error: parentError };
    }

    const { data, error } = await supabase
      .from('parent_child_relations')
      .select(`
        *,
        students!inner (
          id,
          profile_id,
          user_profiles!inner (
            id,
            user_id,
            username,
            firstname,
            lastname,
            email,
            age,
            grade,
            gender
          )
        )
      `)
      .eq('parent_user_id', parentData.id);
      
    return { data, error };
  } catch (e) {
    return { data: [], error: { message: e.message } };
  }
}

// Get all parents for a child
export async function getParentsByStudentId(childUserId) {
  try {
    // First get the student record
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        user_profiles!inner (
          user_id
        )
      `)
      .eq('user_profiles.user_id', childUserId)
      .single();
      
    if (studentError || !studentData) {
      return { data: [], error: studentError };
    }

    const { data, error } = await supabase
      .from('parent_child_relations')
      .select(`
        *,
        parents!inner (
          id,
          user_id,
          full_name,
          email,
          phone_number
        )
      `)
      .eq('child_user_id', studentData.id);
      
    return { data, error };
  } catch (e) {
    return { data: [], error: { message: e.message } };
  }
}

// Check if parent-child relationship exists
export async function checkParentChildRelationship(parentUserId, childUserId) {
  try {
    // Get parent and student IDs first
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', parentUserId)
      .single();
      
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        user_profiles!inner (
          user_id
        )
      `)
      .eq('user_profiles.user_id', childUserId)
      .single();
      
    if (parentError || studentError || !parentData || !studentData) {
      return { data: null, error: parentError || studentError || { message: 'Records not found' } };
    }
    
    const { data, error } = await supabase
      .from('parent_child_relations')
      .select('*')
      .eq('parent_user_id', parentData.id)
      .eq('child_user_id', studentData.id)
      .single();
      
    return { data, error };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
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