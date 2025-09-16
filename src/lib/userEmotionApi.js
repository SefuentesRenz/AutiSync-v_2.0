// src/lib/userEmotionApi.js
import { supabase } from './supabase';

// Create a new user emotion entry
export async function createUserEmotion({
  profile_id,
  emotion_id,
  intensity,
  expressions_id
}) {
  const { data, error } = await supabase
    .from('User_emotion')
    .insert([{
      profile_id,
      emotion_id,
      intensity,
      expressions_id
    }]);
  return { data, error };
}

// Get all user emotions
export async function getUserEmotions() {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get a user emotion by entry_id
export async function getUserEmotionById(entry_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .eq('entry_id', entry_id)
    .single();
  return { data, error };
}

// Get user emotions by profile_id (user_profiles foreign key)
export async function getUserEmotionsByProfileId(profile_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions by emotion_id
export async function getUserEmotionsByEmotionId(emotion_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .eq('emotion_id', emotion_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions by expressions_id
export async function getUserEmotionsByExpressionId(expressions_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .eq('expressions_id', expressions_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions by intensity level
export async function getUserEmotionsByIntensity(intensity) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .eq('intensity', intensity)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions within intensity range
export async function getUserEmotionsByIntensityRange(minIntensity, maxIntensity) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .gte('intensity', minIntensity)
    .lte('intensity', maxIntensity)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions within a date range
export async function getUserEmotionsByDateRange(startDate, endDate, profile_id = null) {
  let query = supabase
    .from('User_emotion')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate);
  
  if (profile_id) {
    query = query.eq('profile_id', profile_id);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions with full details (joined with expressions and user_profiles)
export async function getUserEmotionsWithDetails(profile_id = null) {
  let query = supabase
    .from('User_emotion')
    .select(`
      *,
      expressions(*),
      user_profiles(
        *,
        profiles(first_name, last_name, email)
      )
    `);
  
  if (profile_id) {
    query = query.eq('profile_id', profile_id);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions with expression details only
export async function getUserEmotionsWithExpressions(profile_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select(`
      *,
      expressions(
        emotion_name,
        confidence_score,
        detected_at,
        image_path
      )
    `)
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions with user profile details
export async function getUserEmotionsWithProfiles() {
  const { data, error } = await supabase
    .from('User_emotion')
    .select(`
      *,
      user_profiles(
        *,
        profiles(first_name, last_name, email, date_of_birth)
      )
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get emotion statistics for a user profile
export async function getEmotionStatsByProfile(profile_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('emotion_id, intensity, created_at')
    .eq('profile_id', profile_id);
  return { data, error };
}

// Get recent user emotions (last N entries)
export async function getRecentUserEmotions(profile_id, limit = 10) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select(`
      *,
      expressions(emotion_name, confidence_score, detected_at)
    `)
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
}

// Get high intensity emotions (intensity >= 4)
export async function getHighIntensityEmotions(profile_id = null) {
  let query = supabase
    .from('User_emotion')
    .select(`
      *,
      expressions(emotion_name, confidence_score),
      user_profiles(
        profiles(first_name, last_name)
      )
    `)
    .gte('intensity', 4);
  
  if (profile_id) {
    query = query.eq('profile_id', profile_id);
  }
  
  const { data, error } = await query.order('intensity', { ascending: false })
                                   .order('created_at', { ascending: false });
  return { data, error };
}

// Get negative emotions (for monitoring purposes)
export async function getNegativeEmotions(profile_id = null) {
  let query = supabase
    .from('User_emotion')
    .select(`
      *,
      expressions(emotion_name, confidence_score, detected_at),
      user_profiles(
        profiles(first_name, last_name)
      )
    `);
  
  if (profile_id) {
    query = query.eq('profile_id', profile_id);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  // Filter for negative emotions on the client side
  if (data) {
    const negativeEmotions = data.filter(emotion => {
      const emotionName = emotion.expressions?.emotion_name?.toLowerCase();
      return emotionName && ['sad', 'angry', 'fear', 'disgust'].includes(emotionName);
    });
    return { data: negativeEmotions, error };
  }
  
  return { data, error };
}

// Get emotion trends for a user (grouped by date)
export async function getEmotionTrends(profile_id, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('User_emotion')
    .select(`
      *,
      expressions(emotion_name)
    `)
    .eq('profile_id', profile_id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });
  return { data, error };
}

// Get emotion count for a user
export async function getUserEmotionCount(profile_id) {
  const { count, error } = await supabase
    .from('User_emotion')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profile_id);
  return { count, error };
}

// Get emotion count by intensity level
export async function getEmotionCountByIntensity(profile_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('intensity')
    .eq('profile_id', profile_id);
  return { data, error };
}

// Get average emotion intensity for a user
export async function getAverageEmotionIntensity(profile_id) {
  const { data, error } = await supabase
    .rpc('get_average_emotion_intensity', { user_profile_id: profile_id });
  return { data, error };
}

// Update user emotion entry
export async function updateUserEmotion(entry_id, updates) {
  const { data, error } = await supabase
    .from('User_emotion')
    .update(updates)
    .eq('entry_id', entry_id);
  return { data, error };
}

// Update emotion intensity
export async function updateEmotionIntensity(entry_id, intensity) {
  const { data, error } = await supabase
    .from('User_emotion')
    .update({ intensity })
    .eq('entry_id', entry_id);
  return { data, error };
}

// Delete user emotion entry
export async function deleteUserEmotion(entry_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .delete()
    .eq('entry_id', entry_id);
  return { data, error };
}

// Delete all user emotions for a profile
export async function deleteUserEmotionsByProfile(profile_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .delete()
    .eq('profile_id', profile_id);
  return { data, error };
}

// Delete old emotion entries (cleanup)
export async function deleteOldEmotionEntries(daysOld = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const { data, error } = await supabase
    .from('User_emotion')
    .delete()
    .lt('created_at', cutoffDate.toISOString());
  return { data, error };
}

// Bulk create user emotions
export async function createBulkUserEmotions(emotions) {
  const { data, error } = await supabase
    .from('User_emotion')
    .insert(emotions);
  return { data, error };
}

// Get emotion pattern analysis (requires custom SQL function)
export async function getEmotionPatterns(profile_id, timeframe = '30 days') {
  const { data, error } = await supabase
    .rpc('analyze_emotion_patterns', { 
      user_profile_id: profile_id,
      time_period: timeframe 
    });
  return { data, error };
}
