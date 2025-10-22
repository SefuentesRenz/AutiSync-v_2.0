// src/lib/streaksApi.js
import { supabase } from './supabase';

// Get or create streak record for a student
export async function getStudentStreak(studentId) {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', studentId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No streak record exists, create one
      const { data: newStreak, error: createError } = await supabase
        .from('streaks')
        .insert([{
          user_id: studentId,
          current_streak: 0,
          longest_streak: 0,
          last_active_date: null,
          last_login: new Date().toISOString()
        }])
        .select()
        .single();

      return { data: newStreak, error: createError };
    }

    return { data, error };
  } catch (error) {
    console.error('Error getting student streak:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Check if it's a new day since last login (24-hour period)
function isNewDay(lastLoginTimestamp) {
  if (!lastLoginTimestamp) return true;
  
  const lastLogin = new Date(lastLoginTimestamp);
  const now = new Date();
  
  // Check if at least 24 hours have passed
  const hoursDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
  return hoursDiff >= 24;
}

// Check if it's consecutive day (within 48 hours but after 24 hours)
function isConsecutiveDay(lastLoginTimestamp) {
  if (!lastLoginTimestamp) return false;
  
  const lastLogin = new Date(lastLoginTimestamp);
  const now = new Date();
  
  const hoursDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
  
  // Consecutive if between 24 and 48 hours
  return hoursDiff >= 24 && hoursDiff <= 48;
}

// Check if streak should be broken (more than 48 hours)
function shouldBreakStreak(lastLoginTimestamp) {
  if (!lastLoginTimestamp) return false;
  
  const lastLogin = new Date(lastLoginTimestamp);
  const now = new Date();
  
  const hoursDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
  
  // Break streak if more than 48 hours
  return hoursDiff > 48;
}

// Update streak when student logs in
export async function updateStreakOnLogin(studentId) {
  try {
    console.log('🔥 Updating streak on login for student:', studentId);

    const { data: currentStreak, error: getError } = await getStudentStreak(studentId);
    if (getError) {
      console.error('Error getting current streak:', getError);
      return { data: null, error: getError };
    }

    const now = new Date();
    const lastLogin = currentStreak.last_login;
    const today = now.toISOString().split('T')[0]; // Get YYYY-MM-DD format

    let newCurrentStreak = currentStreak.current_streak;
    let newLongestStreak = currentStreak.longest_streak;
    let shouldUpdate = false;

    console.log('🔥 Current streak data:', {
      currentStreak: currentStreak.current_streak,
      lastLogin,
      lastActiveDate: currentStreak.last_active_date
    });

    if (!lastLogin) {
      // First time login
      console.log('🔥 First time login - starting streak');
      newCurrentStreak = 1;
      shouldUpdate = true;
    } else if (isConsecutiveDay(lastLogin)) {
      // Consecutive day login (24-48 hours)
      console.log('🔥 Consecutive day login - incrementing streak');
      newCurrentStreak += 1;
      shouldUpdate = true;
    } else if (shouldBreakStreak(lastLogin)) {
      // More than 48 hours - reset streak
      console.log('🔥 Breaking streak - more than 48 hours since last login');
      newCurrentStreak = 1;
      shouldUpdate = true;
    } else if (isNewDay(lastLogin)) {
      // New day but not consecutive (more than 48 hours) - already handled above
      console.log('🔥 New day but not consecutive - resetting to 1');
      newCurrentStreak = 1;
      shouldUpdate = true;
    } else {
      // Same 24-hour period - no update needed
      console.log('🔥 Same 24-hour period - no streak update needed');
      shouldUpdate = false;
    }

    // Update longest streak if current streak is higher
    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }

    // Only update if there's a change
    if (shouldUpdate) {
      const { data, error } = await supabase
        .from('streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_active_date: today,
          last_login: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', studentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating streak:', error);
        return { data: null, error };
      }

      console.log('🔥 Streak updated successfully:', {
        newCurrentStreak,
        newLongestStreak,
        lastLogin: now.toISOString()
      });
      return { data, error: null };
    } else {
      // Just update last_login timestamp
      const { data, error } = await supabase
        .from('streaks')
        .update({
          last_login: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', studentId)
        .select()
        .single();

      console.log('🔥 Updated login timestamp only');
      return { data: currentStreak, error: null };
    }
  } catch (error) {
    console.error('Unexpected error updating streak:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Legacy function for backward compatibility
export async function updateStreak(studentId) {
  return updateStreakOnLogin(studentId);
}

// Get streak statistics for dashboard
export async function getStreakStats(studentId) {
  try {
    const { data: streak, error } = await getStudentStreak(studentId);
    if (error) {
      return { data: null, error };
    }

    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = streak.last_active_date;
    
    let isActiveToday = false;
    if (lastActiveDate) {
      isActiveToday = lastActiveDate === today;
    }

    // Calculate days until perfect week badge (7 days)
    const daysTowards7Day = Math.min(streak.current_streak, 7);
    const daysUntilPerfectWeek = Math.max(0, 7 - streak.current_streak);

    return {
      data: {
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        isActiveToday,
        lastActiveDate: streak.last_active_date,
        daysTowards7Day,
        daysUntilPerfectWeek,
        streakEmoji: getStreakEmoji(streak.current_streak)
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting streak stats:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Helper function to get appropriate emoji for streak
function getStreakEmoji(streakDays) {
  if (streakDays >= 30) return '🔥🔥🔥';
  if (streakDays >= 14) return '🔥🔥';
  if (streakDays >= 7) return '🔥';
  if (streakDays >= 3) return '⚡';
  if (streakDays >= 1) return '💪';
  return '🌟';
}