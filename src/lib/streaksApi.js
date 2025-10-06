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
          last_active_date: null
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

// Update streak when student is active
export async function updateStreak(studentId) {
  try {
    console.log('Updating streak for student:', studentId);

    const { data: currentStreak, error: getError } = await getStudentStreak(studentId);
    if (getError) {
      console.error('Error getting current streak:', getError);
      return { data: null, error: getError };
    }

    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const lastActiveDate = currentStreak.last_active_date;

    let newCurrentStreak = currentStreak.current_streak;
    let newLongestStreak = currentStreak.longest_streak;

    if (lastActiveDate) {
      const lastActive = new Date(lastActiveDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastActive.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        newCurrentStreak += 1;
      } else if (diffDays === 0) {
        // Same day - no change to streak
        newCurrentStreak = currentStreak.current_streak;
      } else {
        // Gap in days - reset streak to 1
        newCurrentStreak = 1;
      }
    } else {
      // First time active
      newCurrentStreak = 1;
    }

    // Update longest streak if current streak is higher
    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }

    // Update the streak record
    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_active_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', studentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating streak:', error);
      return { data: null, error };
    }

    console.log('Streak updated successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating streak:', error);
    return { data: null, error: { message: error.message } };
  }
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