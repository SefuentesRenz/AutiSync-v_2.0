// src/scripts/retroactiveBadgeAwardAdmin.js
// Run this script to retroactively award badges to all students for admin-side stats update.
// Usage: Import and call retroactivelyAwardBadgesToAllStudents() from an admin panel or a one-time script.

import { supabase } from '../lib/supabase';
import { checkAndAwardBadges } from '../lib/badgesApi';

export async function retroactivelyAwardBadgesToAllStudents() {
  try {
    console.log('🔄 Fetching all students who have completed activities...');
    // Get all unique user_ids from user_activity_progress
    const { data: progressRecords, error: progressError } = await supabase
      .from('user_activity_progress')
      .select('user_id')
      .neq('user_id', null);

    if (progressError) {
      console.error('❌ Error fetching progress records:', progressError);
      return { error: progressError };
    }

    const uniqueStudentIds = [...new Set(progressRecords.map(r => r.user_id))];
    console.log('👥 Students with activity progress:', uniqueStudentIds);

    let totalAwarded = 0;
    for (const studentId of uniqueStudentIds) {
      console.log(`🏆 Checking and awarding badges for student: ${studentId}`);
      const { data: newBadges, error } = await checkAndAwardBadges(studentId);
      if (error) {
        console.error(`❌ Error awarding badges for student ${studentId}:`, error);
      } else if (newBadges && newBadges.length > 0) {
        console.log(`✅ Awarded ${newBadges.length} new badges to student ${studentId}`);
        totalAwarded += newBadges.length;
      } else {
        console.log(`ℹ️ No new badges to award for student ${studentId}`);
      }
    }
    console.log(`🎉 Retroactive badge awarding complete. Total badges awarded: ${totalAwarded}`);
    return { totalAwarded };
  } catch (error) {
    console.error('❌ Unexpected error in retroactive badge awarding:', error);
    return { error };
  }
}
