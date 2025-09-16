// src/lib/profilesApi.js
import { supabase } from './supabase';

// Create a new profile
export async function createProfile({ name, email, role }) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ name, email, role }]);
  return { data, error };
}

// Get all profiles
export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  return { data, error };
}

// Get a profile by id
export async function getProfileById(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Get a profile by email
export async function getProfileByEmail(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  return { data, error };
}

// Update a profile by id
export async function updateProfile(id, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id);
  return { data, error };
}

// Delete a profile by id
export async function deleteProfile(id) {
  const { data, error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);
  return { data, error };
}
