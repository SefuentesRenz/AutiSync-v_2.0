// src/lib/badgesApi.js
import { supabase } from './supabase';

// Get all available badges
export async function getAllBadges() {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching badges:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching badges:', error);
    return { data: [], error: { message: error.message } };
  }
}

// Get badges earned by a student
export async function getStudentBadges(studentId) {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (
          id,
          title,
          description,
          icon_url,
          criteria
        )
      `)
      .eq('user_id', studentId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching student badges:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching student badges:', error);
    return { data: [], error: { message: error.message } };
  }
}

// Award a badge to a student
export async function awardBadge(studentId, badgeId) {
  try {
    console.log('Awarding badge:', { studentId, badgeId });

    // Check if student already has this badge
    const { data: existingBadge, error: checkError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', studentId)
      .eq('badge_id', badgeId)
      .single();

    if (existingBadge) {
      console.log('Student already has this badge');
      return { data: existingBadge, error: null };
    }

    // Award the badge
    const { data, error } = await supabase
      .from('user_badges')
      .insert([{
        user_id: studentId,
        badge_id: badgeId,
        earned_at: new Date().toISOString()
      }])
      .select(`
        *,
        badges (
          id,
          title,
          description,
          icon_url
        )
      `);

    if (error) {
      console.error('Error awarding badge:', error);
      return { data: null, error };
    }

    console.log('Badge awarded successfully:', data);
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Unexpected error awarding badge:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Check if student should receive badges based on their progress
export async function checkAndAwardBadges(studentId) {
  try {
    console.log('Checking badges for student:', studentId);

    // Get all badges and their criteria
    const { data: allBadges, error: badgesError } = await getAllBadges();
    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return { data: [], error: badgesError };
    }

    // Get student's existing badges
    const { data: studentBadges, error: studentBadgesError } = await getStudentBadges(studentId);
    if (studentBadgesError) {
      console.error('Error fetching student badges:', studentBadgesError);
      return { data: [], error: studentBadgesError };
    }

    const earnedBadgeIds = studentBadges.map(ub => ub.badge_id);

    // Get student's progress data
    const { data: progress, error: progressError } = await supabase
  .from('user_activity_progress')
      .select(`
        *,
        activities (
          category,
          difficulty
        )
      `)
      .eq('student_id', studentId);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return { data: [], error: progressError };
    }

    const newlyEarnedBadges = [];

    // Check each badge's criteria
    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) {
        continue; // Already has this badge
      }

      const criteria = badge.criteria;
      let shouldAward = false;

      // Example badge criteria checks
      if (criteria.type === 'activities_completed') {
        const completedCount = progress.filter(p => p.completion_status === 'completed').length;
        shouldAward = completedCount >= criteria.count;
      } else if (criteria.type === 'category_mastery') {
        const categoryProgress = progress.filter(p => 
          p.activities?.category === criteria.category && 
          p.completion_status === 'completed'
        );
        shouldAward = categoryProgress.length >= criteria.count;
      } else if (criteria.type === 'high_score') {
        const highScores = progress.filter(p => p.score >= criteria.score);
        shouldAward = highScores.length >= criteria.count;
      } else if (criteria.type === 'perfect_score') {
        const perfectScores = progress.filter(p => p.score === 100);
        shouldAward = perfectScores.length >= criteria.count;
      }

      if (shouldAward) {
        const { data: awardedBadge, error: awardError } = await awardBadge(studentId, badge.id);
        if (awardedBadge && !awardError) {
          newlyEarnedBadges.push(awardedBadge);
        }
      }
    }

    console.log('Newly earned badges:', newlyEarnedBadges);
    return { data: newlyEarnedBadges, error: null };
  } catch (error) {
    console.error('Unexpected error checking badges:', error);
    return { data: [], error: { message: error.message } };
  }
}