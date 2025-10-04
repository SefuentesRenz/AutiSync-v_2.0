// src/lib/parentChildApi.js
import { supabase } from './supabase';

// Create a parent-child relationship
export async function linkParentToChild(parentUserId, childUserId, parentEmail, childEmail) {
  try {
    console.log('parentChildApi: Linking parent to child:', { parentUserId, childUserId, parentEmail, childEmail });
    
    // Check if relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('parent_child_relations')
      .select('id')
      .eq('parent_user_id', parentUserId)
      .eq('child_user_id', childUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means "no rows returned" which is fine, any other error needs handling
      if (checkError.message.includes('does not exist') || checkError.message.includes('schema cache')) {
        return { 
          data: null, 
          error: { 
            message: 'Database table not set up. Please run the database setup script first.',
            details: 'The parent_child_relations table does not exist. Check the database folder for setup scripts.'
          } 
        };
      }
      return { data: null, error: checkError };
    }

    if (existing) {
      return { data: existing, error: { message: 'Relationship already exists' } };
    }
    
    // Create the relationship using auth UUIDs directly
    const { data, error } = await supabase
      .from('parent_child_relations')
      .insert([{
        parent_user_id: parentUserId,  // Auth UUID directly
        child_user_id: childUserId,    // Auth UUID directly
        parent_email: parentEmail,
        child_email: childEmail,
        relationship_type: 'parent',
        linked_at: new Date().toISOString()
      }])
      .select();
      
    console.log('parentChildApi: Link result:', { data, error });
    return { data, error };
  } catch (e) {
    console.error('parentChildApi: Unexpected error:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all children for a parent (improved version)
export async function getChildrenByParentId(parentUserId) {
  try {
    console.log('getChildrenByParentId: Looking for children of parent user_id:', parentUserId);
    
    // Direct query using parent_user_id (which should match the auth user.id)
    const { data, error } = await supabase
      .from('parent_child_relations')
      .select(`
        id,
        child_user_id,
        child_email,
        linked_at,
        user_profiles!parent_child_relations_child_user_id_fkey (
          id,
          user_id,
          username,
          first_name,
          last_name,
          email,
          age,
          grade,
          gender,
          profile_picture
        )
      `)
      .eq('parent_user_id', parentUserId);
    
    if (error) {
      console.error('getChildrenByParentId: Database error:', error);
      return { data: [], error };
    }

    if (!data || data.length === 0) {
      console.log('getChildrenByParentId: No children found for parent');
      return { data: [], error: null };
    }

    // Transform the data to the expected format
    const transformedData = data.map(relation => {
      const child = relation.user_profiles;
      return {
        id: child.user_id, // Use user_id as the main ID
        user_id: child.user_id,
        full_name: `${child.first_name || ''} ${child.last_name || ''}`.trim() || child.username,
        username: child.username,
        age: child.age,
        email: child.email || 'No email provided',
        grade: child.grade,
        gender: child.gender,
        profile_picture: child.profile_picture || "/src/assets/kidprofile1.jpg",
        relation_id: relation.id,
        linked_at: relation.linked_at
      };
    });

    console.log('getChildrenByParentId: Successfully found children:', transformedData);
    return { data: transformedData, error: null };
    
  } catch (e) {
    console.error('getChildrenByParentId: Unexpected error:', e);
    return { data: [], error: { message: e.message } };
  }
}

// Check if parent has any linked children (improved version)
export async function hasLinkedChildren(parentUserId) {
  try {
    console.log('hasLinkedChildren: Checking for parent user_id:', parentUserId);
    
    // Direct query to check for any relationships
    const { data: relations, error: relationError } = await supabase
      .from('parent_child_relations')
      .select('id')
      .eq('parent_user_id', parentUserId)
      .limit(1);
    
    if (relationError) {
      console.error('hasLinkedChildren: Database error:', relationError);
      return { hasChildren: false, error: relationError };
    }

    const hasChildren = relations && relations.length > 0;
    console.log('hasLinkedChildren: Result:', hasChildren);
    
    return { 
      hasChildren, 
      error: null 
    };
    
  } catch (e) {
    console.error('hasLinkedChildren: Unexpected error:', e);
    return { hasChildren: false, error: { message: e.message } };
  }
}

// Get all parents for a child
export async function getParentsByStudentId(childUserId) {
  try {
    // First get the student record
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        user_profiles!inner (
          user_id
        )
      `)
      .eq('user_profiles.user_id', childUserId)
      .single();
      
    if (studentError || !studentData) {
      return { data: [], error: studentError };
    }

    const { data, error } = await supabase
      .from('parent_child_relations')
      .select(`
        *,
        parents!inner (
          id,
          user_id,
          full_name,
          email,
          phone_number
        )
      `)
      .eq('child_user_id', studentData.id);
      
    return { data, error };
  } catch (e) {
    return { data: [], error: { message: e.message } };
  }
}

// Check if parent-child relationship exists
export async function checkParentChildRelationship(parentUserId, childUserId) {
  try {
    // Get parent and student IDs first
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', parentUserId)
      .single();
      
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        user_profiles!inner (
          user_id
        )
      `)
      .eq('user_profiles.user_id', childUserId)
      .single();
      
    if (parentError || studentError || !parentData || !studentData) {
      return { data: null, error: parentError || studentError || { message: 'Records not found' } };
    }
    
    const { data, error } = await supabase
      .from('parent_child_relations')
      .select('*')
      .eq('parent_user_id', parentData.id)
      .eq('child_user_id', studentData.id)
      .single();
      
    return { data, error };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
}

// Remove parent-child relationship
export async function unlinkParentFromChild(relationId) {
  const { data, error } = await supabase
    .from('parent_child_relations')
    .delete()
    .eq('id', relationId);
  return { data, error };
}

// Find student by email
export async function findStudentByEmail(email) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();
  return { data, error };
}

// Link parent to child by child's email
export async function linkParentToChildByEmail(parentUserId, childEmail) {
  try {
    console.log('parentChildApi: Linking parent to child by email:', { parentUserId, childEmail });
    
    // First, find the child by email
    const { data: childProfile, error: childError } = await findStudentByEmail(childEmail);
    
    if (childError || !childProfile) {
      console.error('Child not found by email:', childEmail);
      return { 
        data: null, 
        error: { message: 'Child account not found. Please check the email address.' } 
      };
    }

    console.log('Found child profile:', childProfile);

    // Try to get the student record using the child's user_id
    // First try the students table
    let studentData = null;
    const { data: studentRecord, error: studentError } = await supabase
      .from('students')
      .select('id, user_id')
      .eq('user_id', childProfile.user_id)
      .single();
    
    if (studentRecord && !studentError) {
      studentData = studentRecord;
      console.log('Found student record:', studentData);
    } else {
      console.log('Student record not found in students table, checking if user_profiles is sufficient...');
      
      // If no student record, we can still proceed with just the user_profile
      // Use the user_profile data directly
      studentData = {
        id: childProfile.user_id, // Use user_id as the student id
        user_id: childProfile.user_id
      };
      console.log('Using user_profile as student data:', studentData);
    }

    // Now link using the existing function
    const linkResult = await linkParentToChild(
      parentUserId, 
      childProfile.user_id, 
      null, // parentEmail not needed for this function
      childEmail
    );

    if (linkResult.error) {
      return linkResult;
    }

    // Return success with child information
    return {
      data: {
        id: linkResult.data?.[0]?.id,
        childId: studentData.id,
        childUserId: childProfile.user_id,
        childName: childProfile.full_name || childProfile.first_name + ' ' + childProfile.last_name || 'Unknown',
        childEmail: childProfile.email,
        linkedAt: new Date().toISOString()
      },
      error: null
    };

  } catch (e) {
    console.error('parentChildApi: Unexpected error in linkParentToChildByEmail:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get child's emotional data and progress for parent monitoring
export async function getChildEmotionalData(childUserId) {
  try {
    console.log('parentChildApi: Getting emotional data for child:', childUserId);
    
    // First get the user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('profile_id')
      .eq('user_id', childUserId)
      .single();
    
    if (profileError || !profileData) {
      console.error('User profile not found for child:', childUserId);
      return { data: null, error: { message: 'Child profile not found' } };
    }

    // Get recent emotions with expressions
    const { data: emotionsData, error: emotionsError } = await supabase
      .from('User_emotion')
      .select(`
        *,
        emotions (emotion_name, description),
        expressions (expression_name, description)
      `)
      .eq('profile_id', profileData.profile_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (emotionsError) {
      console.error('Error fetching emotions:', emotionsError);
      return { data: null, error: emotionsError };
    }

    return { data: emotionsData || [], error: null };

  } catch (e) {
    console.error('parentChildApi: Unexpected error in getChildEmotionalData:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get child's academic progress
export async function getChildAcademicProgress(childUserId) {
  try {
    console.log('parentChildApi: Getting academic progress for child:', childUserId);
    
    // Get student record
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', childUserId)
      .single();
    
    if (studentError || !studentData) {
      console.error('Student not found for user_id:', childUserId);
      return { data: null, error: { message: 'Student record not found' } };
    }

    // Get activity progress
    const { data: progressData, error: progressError } = await supabase
      .from('student_activity_progress')
      .select(`
        *,
        Activities (
          title,
          category,
          difficulty,
          instructions
        )
      `)
      .eq('student_id', studentData.id)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return { data: null, error: progressError };
    }

    return { data: progressData || [], error: null };

  } catch (e) {
    console.error('parentChildApi: Unexpected error in getChildAcademicProgress:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get comprehensive child monitoring data (emotions + progress)
export async function getChildMonitoringData(childUserId) {
  try {
    console.log('parentChildApi: Getting comprehensive monitoring data for child:', childUserId);
    
    const [emotionsResult, progressResult] = await Promise.all([
      getChildEmotionalData(childUserId),
      getChildAcademicProgress(childUserId)
    ]);

    return {
      data: {
        emotions: emotionsResult.data || [],
        progress: progressResult.data || [],
        emotionsError: emotionsResult.error,
        progressError: progressResult.error
      },
      error: null
    };

  } catch (e) {
    console.error('parentChildApi: Unexpected error in getChildMonitoringData:', e);
    return { data: null, error: { message: e.message } };
  }
}