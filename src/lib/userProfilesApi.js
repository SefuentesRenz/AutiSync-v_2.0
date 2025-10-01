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
  birthdate,
  address,
  grade,
  school,
  phone_number
}) {
  try {
    // Use only essential fields - no firstname/lastname, just full_name
    const profileData = {
      user_id: user_id,
      username,
      full_name,
      email
    };

    // Add optional fields only if they have values
    if (age) profileData.age = age;
    if (birthdate) profileData.birthdate = birthdate;
    if (address) profileData.address = address;
    if (gender) profileData.gender = gender;
    if (grade) profileData.grade = grade;
    if (school) profileData.school = school;

    // Remove null/undefined values to avoid insert issues
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === null || profileData[key] === undefined) {
        delete profileData[key];
      }
    });

    console.log('Creating profile with cleaned data:', profileData);

    // First, verify the auth user exists before attempting insert
    try {
      const { data: userExists } = await supabase
        .rpc('check_auth_user_exists', { user_uuid: user_id });
      
      if (!userExists) {
        console.warn('Auth user does not exist yet, will retry...');
      } else {
        console.log('Auth user verified to exist in database');
      }
    } catch (rpcError) {
      console.warn('Could not verify auth user (function may not exist):', rpcError.message);
    }

    // Retry mechanism for foreign key constraint violations (timing issues)
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select();
      
      if (!error) {
        // Success!
        console.log('Profile created successfully on attempt', retryCount + 1);
        return { data, error };
      }
      
      if (error.code === '23503') {
        // Foreign key constraint violation - retry after a delay
        console.warn(`Foreign key constraint violation on attempt ${retryCount + 1}. Retrying...`);
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Wait longer with each retry (exponential backoff)
          const delay = 1500 * retryCount; // 1.5s, 3s, 4.5s
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Final attempt failed
          console.error('All retry attempts failed. Auth user may not exist:', user_id);
          return { 
            data: null, 
            error: { 
              message: `Account creation failed after multiple attempts. Please try again in a few moments, or contact support if the issue persists.`,
              code: 'FK_CONSTRAINT_VIOLATION_RETRY_FAILED',
              originalError: error
            } 
          };
        }
      } else {
        // Different error, don't retry
        console.error('Non-foreign-key error:', error);
        return { data, error };
      }
    }
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
