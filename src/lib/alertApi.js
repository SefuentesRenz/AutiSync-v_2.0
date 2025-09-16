// src/lib/alertApi.js
import { supabase } from './supabase';
import { createEmotionAlertNotification } from './notificationsApi.js';

// Create a new alert
export async function createAlert({
  expression_id,
  student_id,
  intensity,
  status = 'active'
}) {
  const { data, error } = await supabase
    .from('alert')
    .insert([{
      expression_id,
      student_id,
      intensity,
      status
    }]);
  return { data, error };
}

// Create alert with admin notification for negative emotions
export async function createAlertWithNotification({
  expression_id,
  student_id,
  emotion_name,
  intensity,
  status = 'active'
}) {
  // Create the alert
  const { data: alert, error } = await createAlert({
    expression_id, student_id, intensity, status
  });
  
  // Check if notification is needed for negative emotions with intensity 3-5
  if (!error && alert && shouldNotifyAdmin(emotion_name, intensity)) {
    // Get student name from user_profile for notification
    const { data: student } = await supabase
      .from('students')
      .select(`
        *,
        user_profiles(full_name)
      `)
      .eq('id', student_id)
      .single();
    
    const studentName = student?.user_profiles?.full_name || 'Student';
    
    await notifyAdminOfNegativeEmotion({
      ...alert[0],
      student_name: studentName
    }, emotion_name);
  }
  
  return { data: alert, error };
}

// Check if admin should be notified
function shouldNotifyAdmin(emotion_name, intensity) {
  const negativeEmotions = ['sad', 'angry'];
  const alertIntensityLevels = [3, 4, 5];
  
  return negativeEmotions.includes(emotion_name.toLowerCase()) && 
         alertIntensityLevels.includes(intensity);
}

// Notify admin/teacher of negative emotion alert
async function notifyAdminOfNegativeEmotion(alertData, emotionName) {
  try {
    // Get all admins and teachers
    const { data: admins } = await supabase
      .from('admins')
      .select(`
        *,
        profiles(*)
      `);
    
    // Create notification record for each admin
    if (admins && admins.length > 0) {
      // Use the notifications API for each admin
      for (const admin of admins) {
        await createEmotionAlertNotification({
          recipient_id: admin.profile_id,
          alert_id: alertData.alert_id,
          student_name: alertData.student_name || 'Student', // Fallback if no name
          emotion_name: emotionName,
          intensity: alertData.intensity
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to notify admins:', error);
    return { success: false, error };
  }
}

// Get all alerts
export async function getAlerts() {
  const { data, error } = await supabase
    .from('alert')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get an alert by alert_id
export async function getAlertById(alert_id) {
  const { data, error } = await supabase
    .from('alert')
    .select('*')
    .eq('alert_id', alert_id)
    .single();
  return { data, error };
}

// Get alerts by user profile id
export async function getAlertsByUserProfileId(user_profile_id) {
  const { data, error } = await supabase
    .from('alert')
    .select('*')
    .eq('user_profile_id', user_profile_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get alerts by expression id
export async function getAlertsByExpressionId(expression_id) {
  const { data, error } = await supabase
    .from('alert')
    .select('*')
    .eq('expression_id', expression_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get alerts by status
export async function getAlertsByStatus(status) {
  const { data, error } = await supabase
    .from('alert')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get alerts by intensity level
export async function getAlertsByIntensity(intensity) {
  const { data, error } = await supabase
    .from('alert')
    .select('*')
    .eq('intensity', intensity)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get active alerts for a user profile
export async function getActiveAlertsByUserProfile(user_profile_id) {
  const { data, error } = await supabase
    .from('alert')
    .select('*')
    .eq('user_profile_id', user_profile_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get negative emotion alerts (sad/angry with intensity 3-5)
export async function getNegativeEmotionAlerts() {
  const { data, error } = await supabase
    .from('alert')
    .select(`
      *,
      profiles(*)
    `)
    .in('intensity', [3, 4, 5])
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get unresolved negative emotion alerts for admin dashboard
export async function getUnresolvedNegativeAlerts() {
  const { data, error } = await supabase
    .from('alert')
    .select(`
      *,
      profiles(*)
    `)
    .in('intensity', [3, 4, 5])
    .neq('status', 'resolved')
    .order('intensity', { ascending: false })
    .order('created_at', { ascending: false });
  return { data, error };
}

// Mark negative emotion alert as acknowledged by admin
export async function acknowledgeNegativeAlert(alert_id, admin_id) {
  const { data, error } = await supabase
    .from('alert')
    .update({ 
      status: 'acknowledged',
      acknowledged_by: admin_id,
      acknowledged_at: new Date().toISOString()
    })
    .eq('alert_id', alert_id);
  return { data, error };
}

// Get alerts with profile information
export async function getAlertsWithProfiles() {
  const { data, error } = await supabase
    .from('alert')
    .select(`
      *,
      profiles(*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get alerts by profile with profile information
export async function getAlertsByProfileWithInfo(profile_id) {
  const { data, error } = await supabase
    .from('alert')
    .select(`
      *,
      profiles(*)
    `)
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get recent alerts (last 24 hours)
export async function getRecentAlerts(hours = 24) {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hours);
  
  const { data, error } = await supabase
    .from('alert')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });
  return { data, error };
}

// Update an alert by alert_id
export async function updateAlert(alert_id, updates) {
  const { data, error } = await supabase
    .from('alert')
    .update(updates)
    .eq('alert_id', alert_id);
  return { data, error };
}

// Update alert status
export async function updateAlertStatus(alert_id, status) {
  const { data, error } = await supabase
    .from('alert')
    .update({ status })
    .eq('alert_id', alert_id);
  return { data, error };
}

// Mark alert as resolved
export async function resolveAlert(alert_id) {
  const { data, error } = await supabase
    .from('alert')
    .update({ status: 'resolved' })
    .eq('alert_id', alert_id);
  return { data, error };
}

// Update alert intensity
export async function updateAlertIntensity(alert_id, intensity) {
  const { data, error } = await supabase
    .from('alert')
    .update({ intensity })
    .eq('alert_id', alert_id);
  return { data, error };
}

// Delete an alert by alert_id
export async function deleteAlert(alert_id) {
  const { data, error } = await supabase
    .from('alert')
    .delete()
    .eq('alert_id', alert_id);
  return { data, error };
}

// Delete all alerts for a user profile
export async function deleteAlertsByUserProfileId(user_profile_id) {
  const { data, error } = await supabase
    .from('alert')
    .delete()
    .eq('user_profile_id', user_profile_id);
  return { data, error };
}

// Get alert statistics for a user profile
export async function getAlertStats(user_profile_id) {
  const { data, error } = await supabase
    .from('alert')
    .select('status, intensity, expression_id')
    .eq('user_profile_id', user_profile_id);
  return { data, error };
}

// Get alerts with full details (expressions and user profiles)
export async function getAlertsWithFullDetails() {
  const { data, error } = await supabase
    .from('alert')
    .select(`
      *,
      expressions(*),
      user_profiles(
        *,
        profiles(first_name, last_name, email)
      )
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get alerts for a specific user with expression details
export async function getAlertsWithExpressionDetails(user_profile_id) {
  const { data, error } = await supabase
    .from('alert')
    .select(`
      *,
      expressions(
        emotion_name,
        confidence_score,
        detected_at
      )
    `)
    .eq('user_profile_id', user_profile_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get high priority alerts (intensity 4-5) with user details
export async function getHighPriorityAlerts() {
  const { data, error } = await supabase
    .from('alert')
    .select(`
      *,
      expressions(*),
      user_profiles(
        *,
        profiles(first_name, last_name, email)
      )
    `)
    .gte('intensity', 4)
    .eq('status', 'active')
    .order('intensity', { ascending: false })
    .order('created_at', { ascending: false });
  return { data, error };
}
