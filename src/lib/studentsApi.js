// src/lib/studentsApi.js
import { supabase } from './supabase';

// Create a new student
export async function createStudent({ profile_id }) {
  try {
    console.log('studentsApi: Creating student with data:', { profile_id });
    
    // Only insert the profile_id - keep it simple
    const studentData = {
      profile_id: profile_id
    };
    
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select();
      
    console.log('studentsApi: Insert result:', { data, error });
    return { data, error };
  } catch (e) {
    console.error('studentsApi: Unexpected error:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all students
export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      user_profiles!inner(*)
    `);
  return { data, error };
}

// Get student by profile_id
export async function getStudentByProfileId(profile_id) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      user_profiles!inner(*)
    `)
    .eq('profile_id', profile_id)
    .single();
  return { data, error };
}

// Get student by ID
export async function getStudentById(id) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      user_profiles!inner(*)
    `)
    .eq('id', id)
    .single();
  return { data, error };
}

// Update student
export async function updateStudent(id, updates) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
}

// Delete student
export async function deleteStudent(id) {
  const { data, error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);
  return { data, error };
}

// Get student by user_id (from auth)
export async function getStudentByUserId(user_id) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      user_profiles!inner(*)
    `)
    .eq('user_profiles.user_id', user_id)
    .single();
  return { data, error };
}
