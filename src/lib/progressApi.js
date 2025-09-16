// src/lib/progressApi.js
import { supabase } from './supabase';

// Record activity completion
export async function recordActivityCompletion({
  student_id,
  activity_id,
  completed_at = new Date().toISOString(),
  score = null,
  time_spent = null,
  notes = null
}) {
  try {
    console.log('progressApi: Recording activity completion:', {
      student_id,
      activity_id,
      completed_at,
      score,
      time_spent
    });
    
    const { data, error } = await supabase
      .from('student_activity_progress')
      .insert([{
        student_id,
        activity_id,
        completed_at,
        score,
        time_spent,
        notes
      }])
      .select();
      
    console.log('progressApi: Record result:', { data, error });
    return { data, error };
  } catch (e) {
    console.error('progressApi: Unexpected error:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all progress for a student
export async function getStudentProgress(student_id) {
  const { data, error } = await supabase
    .from('student_activity_progress')
    .select(`
      *,
      Activities!inner(*)
    `)
    .eq('student_id', student_id)
    .order('completed_at', { ascending: false });
  return { data, error };
}

// Get progress for a specific student and activity
export async function getStudentActivityProgress(student_id, activity_id) {
  const { data, error } = await supabase
    .from('student_activity_progress')
    .select(`
      *,
      Activities!inner(*)
    `)
    .eq('student_id', student_id)
    .eq('activity_id', activity_id)
    .order('completed_at', { ascending: false });
  return { data, error };
}

// Check if student has completed an activity
export async function hasStudentCompletedActivity(student_id, activity_id) {
  const { data, error } = await supabase
    .from('student_activity_progress')
    .select('id')
    .eq('student_id', student_id)
    .eq('activity_id', activity_id)
    .limit(1);
  
  return { 
    completed: !error && data && data.length > 0,
    error 
  };
}

// Get progress statistics for a student
export async function getStudentProgressStats(student_id) {
  try {
    // Get total activities completed
    const { data: completedData, error: completedError } = await supabase
      .from('student_activity_progress')
      .select('activity_id')
      .eq('student_id', student_id);

    if (completedError) {
      return { data: null, error: completedError };
    }

    // Get unique activities completed (in case student completed same activity multiple times)
    const uniqueCompleted = [...new Set(completedData.map(item => item.activity_id))];

    // Get total available activities
    const { data: totalActivities, error: totalError } = await supabase
      .from('Activities')
      .select('id')
      .eq('is_activity', true);

    if (totalError) {
      return { data: null, error: totalError };
    }

    // Calculate completion percentage
    const completionPercentage = totalActivities.length > 0 
      ? Math.round((uniqueCompleted.length / totalActivities.length) * 100)
      : 0;

    // Get average score
    const { data: scoresData, error: scoresError } = await supabase
      .from('student_activity_progress')
      .select('score')
      .eq('student_id', student_id)
      .not('score', 'is', null);

    let averageScore = null;
    if (!scoresError && scoresData.length > 0) {
      const totalScore = scoresData.reduce((sum, item) => sum + item.score, 0);
      averageScore = Math.round(totalScore / scoresData.length);
    }

    const stats = {
      total_activities_available: totalActivities.length,
      activities_completed: uniqueCompleted.length,
      completion_percentage: completionPercentage,
      average_score: averageScore,
      total_sessions: completedData.length
    };

    return { data: stats, error: null };
  } catch (e) {
    console.error('progressApi: Error getting stats:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get progress for all children of a parent
export async function getChildrenProgressByParentId(parent_id) {
  try {
    // First get all children for this parent
    const { data: relationships, error: relError } = await supabase
      .from('parent_child_relationships')
      .select(`
        student_id,
        students!inner(
          *,
          user_profiles!inner(*)
        )
      `)
      .eq('parent_id', parent_id);

    if (relError) {
      return { data: null, error: relError };
    }

    // Get progress for each child
    const childrenProgress = await Promise.all(
      relationships.map(async (rel) => {
        const { data: stats, error: statsError } = await getStudentProgressStats(rel.student_id);
        const { data: recentProgress, error: recentError } = await supabase
          .from('student_activity_progress')
          .select(`
            *,
            Activities!inner(*)
          `)
          .eq('student_id', rel.student_id)
          .order('completed_at', { ascending: false })
          .limit(5);

        return {
          student: rel.students,
          stats: stats,
          recent_activities: recentProgress || [],
          errors: {
            stats: statsError,
            recent: recentError
          }
        };
      })
    );

    return { data: childrenProgress, error: null };
  } catch (e) {
    console.error('progressApi: Error getting children progress:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all students progress (for admin)
export async function getAllStudentsProgress() {
  try {
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        *,
        user_profiles!inner(*)
      `);

    if (studentsError) {
      return { data: null, error: studentsError };
    }

    const studentsProgress = await Promise.all(
      students.map(async (student) => {
        const { data: stats, error: statsError } = await getStudentProgressStats(student.id);
        return {
          student: student,
          stats: stats,
          error: statsError
        };
      })
    );

    return { data: studentsProgress, error: null };
  } catch (e) {
    console.error('progressApi: Error getting all students progress:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Update activity progress (for editing scores, notes, etc.)
export async function updateActivityProgress(progress_id, updates) {
  const { data, error } = await supabase
    .from('student_activity_progress')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', progress_id)
    .select();
  return { data, error };
}

// Delete activity progress record
export async function deleteActivityProgress(progress_id) {
  const { data, error } = await supabase
    .from('student_activity_progress')
    .delete()
    .eq('id', progress_id);
  return { data, error };
}
