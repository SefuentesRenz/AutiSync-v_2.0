// src/lib/userProfilesApi.js
import { supabase } from './supabase';

// Create a new user profile
export async function createUserProfile({
  user_id,
  full_name,
  username,
  gender,
  email,
  age,
  parents_email,
  address,
  grade,
  school,
  phone_number
}) {
  try {
    // Map to your exact database schema - only use columns that exist
    const profileData = {
      user_id, // Foreign key to auth.users.id
      full_name,
      username,
      gender,
      email,
      age,
      parents_email,
      address,
      grade,
      school,
      phone_number
    };

    // Remove null/undefined values to avoid insert issues
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === null || profileData[key] === undefined) {
        delete profileData[key];
      }
    });

    console.log('Creating profile with cleaned data:', profileData);

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select();
    
    return { data, error };
  } catch (e) {
    console.error('Unexpected error in createUserProfile:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all user profiles
export async function getUserProfiles() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*');
  return { data, error };
}

// Get a user profile by user_id (auth user id)
export async function getUserProfileById(user_id) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();
  return { data, error };
}

// Get a user profile by email
export async function getUserProfileByEmail(email) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();
  return { data, error };
}

// Get a user profile by username
export async function getUserProfileByUsername(username) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single();
  return { data, error };
}

// Get user profiles by parent email
export async function getUserProfilesByParentEmail(parents_email) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('parent_email', parents_email); // Use correct column name
  return { data, error };
}

// Update a user profile by user_id
export async function updateUserProfile(user_id, updates) {
  try {
    console.log('updateUserProfile called with:');
    console.log('user_id:', user_id, 'type:', typeof user_id);
    console.log('updates:', updates);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user_id);
      
    console.log('Update result:', { data, error });
    return { data, error };
  } catch (e) {
    console.error('Unexpected error in updateUserProfile:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Update user progress (activities_done, starts_earned, day_streak)
export async function updateUserProgress(user_id, { activities_done, starts_earned, day_streak }) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ 
      activities_done,
      starts_earned,
      day_streak,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user_id);
  return { data, error };
}

// Increment user activities and stars
export async function incrementUserActivity(user_id, starsEarned = 1) {
  const { data: profile, error: fetchError } = await getUserProfileById(user_id);
  
  if (fetchError) return { data: null, error: fetchError };
  
  const newActivitiesDone = (profile.activities_done || 0) + 1;
  const newStarsEarned = (profile.starts_earned || 0) + starsEarned;
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ 
      activities_done: newActivitiesDone,
      starts_earned: newStarsEarned,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user_id);
  return { data, error };
}

// Delete a user profile by user_id
export async function deleteUserProfile(user_id) {
  const { data, error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', user_id);
  return { data, error };
}
