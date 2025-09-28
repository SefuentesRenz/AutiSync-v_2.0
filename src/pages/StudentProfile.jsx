import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const StudentProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [userInfo, setUserInfo] = useState({
    username: 'Student',
    first_name: '',
    last_name: '',
    email: '',
    grade: '',
    gender: '',
    address: '',
    birthday: '',
    achievements: 0,
    day_streak: 0,
    activities_done: 0,
    accuracy_rate: 83
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Mock tracking data for visual appeal
  const [studentTrackingData] = useState({
    accuracyRates: [
      { category: 'Colors', accuracy: 85, completed: '2/3', icon: '🎨', color: 'bg-purple-500' },
      { category: 'Shapes', accuracy: 78, completed: '3/3', icon: '🔷', color: 'bg-blue-500' },
      { category: 'Numbers', accuracy: 82, completed: '2/3', icon: '🔢', color: 'bg-green-500' },
      { category: 'Letters', accuracy: 74, completed: '3/3', icon: '🔤', color: 'bg-indigo-500' },
      { category: 'Patterns', accuracy: 69, completed: '1/3', icon: '🧩', color: 'bg-pink-500' }
    ],
    completionRate: 80
  });

  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading profile...');
      loadProfile();
    } else {
      console.log('No user found, redirecting...');
      setError('Please log in to view your profile');
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('Loading profile for user:', user);
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      console.log('User metadata:', user.user_metadata);

      // First, let's check if we can access the user_profiles table at all
      console.log('Testing database connection...');
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (tableError) {
        console.error('Cannot access user_profiles table:', tableError);
        console.log('Falling back to basic profile creation...');
        await createBasicProfile();
        return;
      }

      console.log('Table access successful, checking for profile...');

      // Check if profile exists using user_id field (database uses int4 primary key)
      console.log('Looking for profile with user_id (int4):', user.id);
      
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      console.log('Profile query result:', { existingProfile, profileError });

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        console.error('Error details:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint
        });
        
        // If the table doesn't exist or there's a schema issue, create a basic profile
        if (profileError.code === '42P01' || profileError.message.includes('does not exist')) {
          console.log('Table does not exist, creating basic profile');
          await createBasicProfile();
          return;
        }
        
        setError('Failed to load profile: ' + profileError.message);
        setLoading(false);
        return;
      }

      if (existingProfile) {
        console.log('Profile found:', existingProfile);
        console.log('User metadata from signup:', user.user_metadata);
        
        // Merge existing profile with signup metadata to fill missing fields
        setUserInfo({
          username: existingProfile.username || user.user_metadata?.username || user.email?.split('@')[0] || 'Student',
          first_name: existingProfile.first_name || user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: existingProfile.last_name || user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          email: existingProfile.email || user.email || '',
          grade: existingProfile.grade || user.user_metadata?.grade || '',
          gender: existingProfile.gender || user.user_metadata?.gender || '',
          address: existingProfile.address || user.user_metadata?.address || '',
          birthday: existingProfile.birthday || user.user_metadata?.birthday || user.user_metadata?.birthdate || '',
          achievements: existingProfile.achievements || 0,
          day_streak: existingProfile.day_streak || 0,
          activities_done: existingProfile.activities_done || 0,
          accuracy_rate: existingProfile.accuracy_rate || 83
        });
      } else {
        console.log('No profile found, creating one...');
        await createProfile();
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      console.error('Error object:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError('Failed to load profile: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const createBasicProfile = async () => {
    // If database is not accessible, create a basic local profile from signup metadata
    const metadata = user.user_metadata || {};
    console.log('Creating basic profile from metadata:', metadata);
    
    // Extract first and last name from full_name if available
    const firstName = metadata.first_name || metadata.full_name?.split(' ')[0] || '';
    const lastName = metadata.last_name || metadata.full_name?.split(' ').slice(1).join(' ') || '';
    
    setUserInfo({
      username: metadata.username || user.email?.split('@')[0] || 'Student',
      first_name: firstName,
      last_name: lastName,
      email: user.email || '',
      grade: metadata.grade || '',
      gender: metadata.gender || '',
      address: metadata.address || '',
      birthday: metadata.birthday || metadata.birthdate || '',
      achievements: 0,
      day_streak: 0,
      activities_done: 0,
      accuracy_rate: 83
    });
    setSuccessMessage('Profile loaded from signup data!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const createProfile = async () => {
    try {
      // Extract information from user metadata (signup data)
      const metadata = user.user_metadata || {};
      const firstName = metadata.first_name || metadata.full_name?.split(' ')[0] || '';
      const lastName = metadata.last_name || metadata.full_name?.split(' ').slice(1).join(' ') || '';
      
      // Create a unique email to avoid duplicates
      let profileEmail = user.email;
      if (!profileEmail) {
        profileEmail = `student_${user.id}@autisync.local`;
      } else {
        // Check if email is already used
        const { data: emailCheck } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('email', user.email)
          .maybeSingle();

        if (emailCheck && emailCheck.user_id !== user.id) {
          profileEmail = `${user.email.split('@')[0]}_${user.id}@${user.email.split('@')[1]}`;
        }
      }

      // Generate a unique username
      let baseUsername = metadata.username || 
                        metadata.full_name?.split(' ')[0] || 
                        user.email?.split('@')[0] || 
                        'student';
      
      let uniqueUsername = baseUsername;
      let counter = 1;
      
      // Keep checking until we find a unique username
      while (true) {
        const { data: usernameCheck } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('username', uniqueUsername)
          .maybeSingle();

        if (!usernameCheck || usernameCheck.user_id === user.id) {
          break; // Username is unique or belongs to current user
        }
        
        // Try next variation
        uniqueUsername = `${baseUsername}_${counter}`;
        counter++;
        
        // Fallback to user ID if counter gets too high
        if (counter > 100) {
          uniqueUsername = `student_${user.id}`;
          break;
        }
      }

      const defaultProfile = {
        user_id: user.id, // Use user_id field for int4 primary key
        username: uniqueUsername,
        first_name: firstName,
        last_name: lastName,
        email: profileEmail,
        gender: metadata.gender || '',
        address: metadata.address || '',
        grade: metadata.grade || '',
        birthday: metadata.birthdate || metadata.birthday || ''
      };

      console.log('Creating profile with user_id (int4):', defaultProfile);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        
        // Handle specific duplicate key errors gracefully
        if (error.message.includes('duplicate key value violates unique constraint')) {
          if (error.message.includes('username_key')) {
            // Try with a more unique username
            defaultProfile.username = `student_${user.id}_${Date.now()}`;
            const { data: retryData, error: retryError } = await supabase
              .from('user_profiles')
              .insert([defaultProfile])
              .select()
              .single();
              
            if (retryError) {
              setError('Error creating profile: Unable to generate unique username. Please try again.');
              return;
            } else {
              // Success on retry
              console.log('Profile created successfully on retry:', retryData);
              setUserInfo({
                username: retryData.username,
                first_name: retryData.first_name || '',
                last_name: retryData.last_name || '',
                email: retryData.email || user.email || '',
                grade: retryData.grade || '',
                gender: retryData.gender || '',
                address: retryData.address || '',
                birthday: retryData.birthday || '',
                achievements: 0,
                day_streak: 0,
                activities_done: 0,
                accuracy_rate: 83
              });
              setSuccessMessage('Profile created successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
              return;
            }
          } else {
            setError('Error creating profile: ' + error.message);
            return;
          }
        } else {
          setError('Error creating profile: ' + error.message);
          return;
        }
      }

      console.log('Profile created successfully:', data);
      setUserInfo({
        username: data.username,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || user.email || '',
        grade: data.grade || '',
        gender: data.gender || '',
        address: data.address || '',
        birthday: data.birthday || '',
        achievements: 0,
        day_streak: 0,
        activities_done: 0,
        accuracy_rate: 83
      });
      setSuccessMessage('Profile created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile: ' + err.message);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Check if username is unique (if it was changed) using user_id field
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      let finalUsername = userInfo.username;
      
      // Only check for uniqueness if username was changed
      if (currentProfile && currentProfile.username !== userInfo.username) {
        const { data: usernameCheck } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('username', userInfo.username)
          .maybeSingle();

        if (usernameCheck && usernameCheck.user_id !== user.id) {
          // Username is taken, generate a unique one
          let baseUsername = userInfo.username;
          let counter = 1;
          finalUsername = `${baseUsername}_${counter}`;
          
          while (true) {
            const { data: nextCheck } = await supabase
              .from('user_profiles')
              .select('user_id')
              .eq('username', finalUsername)
              .maybeSingle();

            if (!nextCheck) {
              break; // Found unique username
            }
            
            counter++;
            finalUsername = `${baseUsername}_${counter}`;
            
            if (counter > 100) {
              finalUsername = `${baseUsername}_${user.id}`;
              break;
            }
          }
          
          // Update the form state with the new unique username
          setUserInfo(prev => ({ ...prev, username: finalUsername }));
          
          // Show a friendly message about the username change
          setError(`Username was changed to "${finalUsername}" to ensure uniqueness.`);
          setTimeout(() => setError(''), 5000); // Clear message after 5 seconds
        }
      }

      const updateData = {
        username: finalUsername,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        email: userInfo.email,
        grade: userInfo.grade,
        gender: userInfo.gender,
        address: userInfo.address,
        birthday: userInfo.birthday
      };

      // Update profile using user_id field (int4)
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        console.error('Update error details:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        
        // If there's a database error, just show success locally
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setError('');
          setSuccessMessage('Profile updated locally (database not available)!');
          setIsEditing(false);
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setError('Error updating profile: ' + error.message);
          setSuccessMessage('');
        }
      } else {
        console.log('Profile updated successfully');
        setError('');
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
    if (user) {
      loadProfile();
    }
  };

  const stats = [
    { icon: "🏆", label: "Achievements", value: userInfo.achievements, color: "from-yellow-400 to-orange-500" },
    { icon: "🔥", label: "Day Streak", value: userInfo.day_streak, color: "from-red-400 to-pink-500" },
    { icon: "🎯", label: "Activities Done", value: userInfo.activities_done, color: "from-blue-400 to-indigo-500" },
    { icon: "⭐", label: "Accuracy Rate", value: `${userInfo.accuracy_rate}%`, color: "from-purple-400 to-blue-500" },
    { icon: "📊", label: "Completion Rate", value: `${studentTrackingData.completionRate}%`, color: "from-green-400 to-teal-500" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile</h1>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-32 w-48 h-48 bg-purple-200/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-32 h-32 bg-pink-200/20 rounded-full blur-xl animate-bounce"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img
                src="/src/assets/logo.png"
                alt="AutiSync Logo"
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutiSync
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/studentpage')}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Back to Learning Hub
              </button>
              
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 relative z-10">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl">
            {successMessage}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white animate-pulse">
                <img 
                  src="/src/assets/kidprofile1.jpg" 
                  alt="Student Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                  Hi, {userInfo.username || `${userInfo.first_name} ${userInfo.last_name}`.trim() || 'Student'}! 👋
                </h1>
                <p className="text-lg text-gray-600">
                  You're doing amazing things every day! 🚀
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className={`bg-gradient-to-r ${stat.color} rounded-2xl p-4 text-white text-center shadow-lg transform hover:scale-105 transition-all duration-200`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">👤</span>
              Personal Information
            </h2>
            
            {/* Edit/Save Button */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center text-sm"
                  >
                    <span className="mr-1">❌</span>
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                  >
                    {saving ? (
                      <>
                        <span className="mr-1">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="mr-1">💾</span>
                        Save
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center text-xl cursor-pointer"
                >
                  <span className="mr-1">✏️</span>
                  Edit
                </button>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
              <span className="text-2xl mr-4">🎮</span>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={userInfo.username}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-purple-400 focus:outline-none text-gray-800 py-1"
                    minLength="3"
                    maxLength="20"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">@{userInfo.username}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
              <span className="text-2xl mr-4">📧</span>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-blue-400 focus:outline-none text-gray-800 py-1"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{userInfo.email || 'No email provided'}</p>
                )}
              </div>
            </div>

            {/* First Name */}
            <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-200/50">
              <span className="text-2xl mr-4">👋</span>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={userInfo.first_name}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-green-400 focus:outline-none text-gray-800 py-1"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{userInfo.first_name || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Last Name */}
            <div className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50">
              <span className="text-2xl mr-4">👤</span>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={userInfo.last_name}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-yellow-400 focus:outline-none text-gray-800 py-1"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{userInfo.last_name || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Grade */}
            <div className="flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200/50">
              <span className="text-2xl mr-4">📚</span>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700">Grade</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="grade"
                    value={userInfo.grade}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-red-400 focus:outline-none text-gray-800 py-1"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{userInfo.grade || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50">
              <span className="text-2xl mr-4">⚧️</span>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700">Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={userInfo.gender}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-indigo-400 focus:outline-none text-gray-800 py-1"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-800 font-medium">{userInfo.gender || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Birthday */}
            <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl border border-pink-200/50">
              <span className="text-2xl mr-4">🎂</span>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700">Birthday</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="birthday"
                    value={userInfo.birthday}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-pink-400 focus:outline-none text-gray-800 py-1"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{userInfo.birthday || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200/50 md:col-span-2">
              <span className="text-2xl mr-4 mt-1">🏠</span>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700">Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={userInfo.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-transparent border-b border-gray-400 focus:outline-none text-gray-800 py-1 resize-none"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{userInfo.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
            <span className="text-3xl mr-3">📊</span>
            Learning Progress
          </h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {studentTrackingData.accuracyRates.map((category, index) => (
              <div 
                key={index} 
                className={`${category.color} rounded-2xl p-4 text-white text-center shadow-lg transform hover:scale-105 transition-all duration-200`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-lg font-bold">{category.accuracy}%</div>
                <div className="text-xs opacity-90">{category.category}</div>
                <div className="text-xs mt-1">{category.completed}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;