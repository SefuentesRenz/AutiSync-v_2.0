// src/lib/parentChildApi.js
import { supabase } from './supabase';

// Create a parent-child relationship
export async function linkParentToChild(parent_id, student_id) {
  try {
    console.log('parentChildApi: Linking parent to child:', { parent_id, student_id });
    
    const { data, error } = await supabase
      .from('parent_child_relationships')
      .insert([{
        parent_id: parent_id,
        student_id: student_id
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
export async function getChildrenByParentId(parent_id) {
  const { data, error } = await supabase
    .from('parent_child_relationships')
    .select(`
      *,
      students!inner(
        *,
        user_profiles!inner(*)
      )
    `)
    .eq('parent_id', parent_id);
  return { data, error };
}

// Get all parents for a child
export async function getParentsByStudentId(student_id) {
  const { data, error } = await supabase
    .from('parent_child_relationships')
    .select(`
      *,
      parents!inner(
        *,
        user_profiles!inner(*)
      )
    `)
    .eq('student_id', student_id);
  return { data, error };
}

// Check if parent-child relationship exists
export async function checkParentChildRelationship(parent_id, student_id) {
  const { data, error } = await supabase
    .from('parent_child_relationships')
    .select('*')
    .eq('parent_id', parent_id)
    .eq('student_id', student_id)
    .single();
  return { data, error };
}

// Remove parent-child relationship
export async function unlinkParentFromChild(parent_id, student_id) {
  const { data, error } = await supabase
    .from('parent_child_relationships')
    .delete()
    .eq('parent_id', parent_id)
    .eq('student_id', student_id);
  return { data, error };
}

// Get all parent-child relationships (for admin)
export async function getAllParentChildRelationships() {
  const { data, error } = await supabase
    .from('parent_child_relationships')
    .select(`
      *,
      parents!inner(
        *,
        user_profiles!inner(*)
      ),
      students!inner(
        *,
        user_profiles!inner(*)
      )
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Link parent to child by email (for convenience)
export async function linkParentToChildByEmail(parent_email, child_email) {
  try {
    // First, get the parent by email
    const { data: parentProfile, error: parentError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        parents(*)
      `)
      .eq('email', parent_email)
      .single();

    if (parentError || !parentProfile) {
      return { data: null, error: { message: 'Parent not found' } };
    }

    // Then, get the child by email
    const { data: childProfile, error: childError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        students(*)
      `)
      .eq('email', child_email)
      .single();

    if (childError || !childProfile) {
      return { data: null, error: { message: 'Child not found' } };
    }

    // Check if both have the correct roles
    if (!parentProfile.parents || parentProfile.parents.length === 0) {
      return { data: null, error: { message: 'User is not registered as a parent' } };
    }

    if (!childProfile.students || childProfile.students.length === 0) {
      return { data: null, error: { message: 'User is not registered as a student' } };
    }

    // Create the relationship
    return await linkParentToChild(
      parentProfile.parents[0].id,
      childProfile.students[0].id
    );

  } catch (e) {
    console.error('parentChildApi: Error linking by email:', e);
    return { data: null, error: { message: e.message } };
  }
}
