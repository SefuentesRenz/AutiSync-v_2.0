import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();
  
  const [userInfo, setUserInfo] = useState({
    username: "",
    first_name: "",
    last_name: "",
    birthday: "",
    address: "",
    gender: "",
    grade: "",
    parent_email: "",
    interests: ["Drawing", "Animals", "Music", "Numbers"],
    achievements: 0,
    day_streak: 0,
    activities_done: 0,
    accuracy_rate: 83,
    favoriteColor: "#3B82F6",
    learning_style: {
      visual: true,
      goal_oriented: true,
      routine_loving: true,
      step_by_step: true
    }
  });

  // Individual student tracking data based on actual system (20 activities: 15 academic + 5 daily life)
  const [trackingData] = useState({
    accuracyRate: 78.5,
    difficultyProgression: {
      easy: 85,
      medium: 72,
      hard: 63
    },
    skillsBreakdown: {
      academic: {
        'Numbers': 82,
        'Shapes': 78,
        'Colors': 85,
        'Letters': 74,
        'Patterns': 69
      },
      dailyLife: {
        'Personal Hygiene': 88,
        'Social Skills': 71,
        'Safety': 76,
        'Communication': 79,
        'Independence': 73
      }
    },
    totalActivities: 20,
    completedActivities: 16,
    averageAccuracy: 78.5,
    streakRecord: 7,
    categoryProgress: {
      Numbers: { total: 3, completed: 2, accuracy: 82 },
      Shapes: { total: 3, completed: 3, accuracy: 78 },
      Colors: { total: 3, completed: 2, accuracy: 85 },
      Letters: { total: 3, completed: 3, accuracy: 74 },
      Patterns: { total: 3, completed: 1, accuracy: 69 },
      'Daily Life': { total: 5, completed: 5, accuracy: 77 }
    }
  });

  const [studentTrackingData] = useState({
    accuracyRates: [
      { category: 'Colors', accuracy: 85, completed: '2/3', icon: '🎨', color: 'bg-purple-500' },
      { category: 'Shapes', accuracy: 78, completed: '3/3', icon: '🔷', color: 'bg-blue-500' },
      { category: 'Numbers', accuracy: 82, completed: '2/3', icon: '🔢', color: 'bg-green-500' },
      { category: 'Letters', accuracy: 74, completed: '3/3', icon: '🔤', color: 'bg-indigo-500' },
      { category: 'Patterns', accuracy: 69, completed: '1/3', icon: '🧩', color: 'bg-pink-500' },
      { category: 'Daily Life', accuracy: 77, completed: '5/5', icon: '🏠', color: 'bg-orange-500' }
    ],
    difficultyProgression: [
      { level: 'Easy', progress: 85, completed: '7/8', icon: '🌱', color: 'bg-green-500', bgColor: 'bg-green-50' },
      { level: 'Medium', progress: 72, completed: '6/8', icon: '🔥', color: 'bg-orange-500', bgColor: 'bg-orange-50' },
      { level: 'Hard', progress: 63, completed: '3/4', icon: '💎', color: 'bg-red-500', bgColor: 'bg-red-50' }
    ],
    skillsBreakdown: [
      { skill: 'Numbers', progress: 67, accuracy: 82, activities: '2/3', icon: '🔢', color: 'from-green-400 to-green-600' },
      { skill: 'Shapes', progress: 100, accuracy: 78, activities: '3/3', icon: '🔷', color: 'from-blue-400 to-blue-600' },
      { skill: 'Colors', progress: 67, accuracy: 85, activities: '2/3', icon: '🎨', color: 'from-purple-400 to-purple-600' },
      { skill: 'Letters', progress: 100, accuracy: 74, activities: '3/3', icon: '🔤', color: 'from-indigo-400 to-indigo-600' },
      { skill: 'Patterns', progress: 33, accuracy: 69, activities: '1/3', icon: '🧩', color: 'from-pink-400 to-pink-600' },
      { skill: 'Daily Life', progress: 100, accuracy: 77, activities: '5/5', icon: '🏠', color: 'from-orange-400 to-orange-600' }
    ],
    overallAccuracy: 78.5,
    totalActivities: 20, // 15 academic (5 categories × 3 difficulties) + 5 daily life
    completionRate: 80 // 16/20 activities completed
  });

  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)  // Fixed: use user_id instead of id
        .maybeSingle(); 

      if (error) {
        console.error('Error fetching profile:', error);
        setError(`Database error: ${error.message}`);
        return;
      }

      if (data) {
        console.log('Profile data found:', data);
        // Map database fields to UI state
        const fullNameParts = (data.full_name || '').split(' ');
        setUserInfo({
          username: data.username || user.user_metadata?.username || user.email?.split('@')[0] || 'student',
          first_name: fullNameParts[0] || '',
          last_name: fullNameParts.slice(1).join(' ') || '',
          birthday: data.birthday || data.age ? `Age: ${data.age}` : '',
          address: data.address || '',
          gender: data.gender || '',
          grade: data.grade || '',
          // Set default values for UI fields that don't exist in database
          interests: ["Drawing", "Animals", "Music", "Numbers"],
          achievements: data.activities_done || 0,
          day_streak: data.day_streak || 0,
          activities_done: data.activities_done || 0,
          accuracy_rate: 83, // Default value
          favoriteColor: "#3B82F6",
          learning_style: {
            visual: true,
            goal_oriented: true,
            routine_loving: true,
            step_by_step: true
          }
        });
      } else {
        console.log('No profile found, creating default profile');
        await createUserProfile();
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`Error loading profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async () => {
    try {
      console.log('Creating profile for user:', user.id, 'email:', user.email);
      
      // First check if profile already exists for this user_id
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error when no rows found
        
      if (existingProfile) {
        console.log('Profile already exists for this user:', existingProfile);
        setUserInfo({
          username: existingProfile.username || existingProfile.full_name?.split(' ')[0] || 'Student',
          first_name: existingProfile.first_name || '',
          last_name: existingProfile.last_name || '',
          birthday: existingProfile.birthday || '',
          address: existingProfile.address || '',
          gender: existingProfile.gender || '',
          grade: existingProfile.grade || '',
          email: existingProfile.email || user.email || ''
        });
        return;
      }
      
      // Create a unique email if needed
      let profileEmail = user.email;
      if (!profileEmail) {
        profileEmail = `student_${user.id}@autisync.local`;
      } else {
        // Check if this email is already used by another user
        const { data: emailCheck, error: emailCheckError } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('email', user.email)
          .maybeSingle();
          
        if (emailCheck && emailCheck.user_id !== user.id) {
          // Email is used by another user, create a unique one
          profileEmail = `${user.email.split('@')[0]}_${user.id}@${user.email.split('@')[1]}`;
          console.log('Email conflict resolved with:', profileEmail);
        }
      }

      // Create the profile with guaranteed unique data
      const defaultProfile = {
        user_id: user.id,
        username: user.user_metadata?.username || 
                 user.user_metadata?.full_name?.split(' ')[0] || 
                 user.email?.split('@')[0] || 
                 `student_${user.id}`,
        full_name: user.user_metadata?.full_name || '',
        email: profileEmail,
        gender: user.user_metadata?.gender || '',
        address: user.user_metadata?.address || '',
        grade: user.user_metadata?.grade || '',
      };

      console.log('Creating new profile with data:', defaultProfile);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setError(`Error creating profile: ${error.message}`);
        return;
      }

      console.log('Profile created successfully:', data);
      setUserInfo({
        username: data.username,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        birthday: data.birthday || '',
        address: data.address || '',
        gender: data.gender || '',
        grade: data.grade || '',
        email: data.email || user.email || ''
      });
    } catch (err) {
      console.error('Error in createUserProfile:', err);
      setError(`Failed to create profile: ${err.message}`);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updateData = {
        username: userInfo.username,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        birthday: userInfo.birthday,
        address: userInfo.address,
        gender: userInfo.gender,
        grade: userInfo.grade,
        email: userInfo.email
      };

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        setError(`Error updating profile: ${error.message}`);
      } else {
        console.log('Profile updated successfully');
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      console.error('Error in handleSave:', err);
      setError(`Failed to save profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
            console.error('Error creating profile:', error);
            setError(`Error creating profile: ${error.message}`);
            return;
          }

          console.log('Profile created without email:', data);
          setUserInfo({
  const handleChange = (e) => {
        grade: user.user_metadata?.grade || '',
      };

      console.log('Creating profile with data:', defaultProfile);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setError(`Error creating profile: ${error.message}`);
        return;
      }

      console.log('Profile created:', data);
      setUserInfo({
        username: data.username,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        birthday: data.birthday || '',
        address: data.address || '',
        gender: data.gender || '',
        grade: data.grade || '',
        interests: data.interests || ["Drawing", "Animals", "Music", "Numbers"],
        achievements: data.achievements || 0,
        day_streak: data.day_streak || 0,
        activities_done: data.activities_done || 0,
        accuracy_rate: data.accuracy_rate || 0,
        favoriteColor: data.favorite_color || "#3B82F6",
        learning_style: data.learning_style || {
          visual: true,
          goal_oriented: true,
          routine_loving: true,
          step_by_step: true
        }
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      setError(`Error creating profile: ${error.message}`);
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setError("");
      setSuccess("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Only include fields that exist in your database schema
      const updateData = {
        username: userInfo.username,
        full_name: `${userInfo.first_name} ${userInfo.last_name}`.trim(),
        gender: userInfo.gender,
        address: userInfo.address,
        grade: userInfo.grade,
        // Remove fields that don't exist in database
        // first_name: userInfo.first_name,
        // last_name: userInfo.last_name,
        // birthday: userInfo.birthday,
        // interests: userInfo.interests,
        // achievements: userInfo.achievements,
        // day_streak: userInfo.day_streak,
        // activities_done: userInfo.activities_done,
        // accuracy_rate: userInfo.accuracy_rate,
        // favorite_color: userInfo.favoriteColor,
        // learning_style: userInfo.learning_style,
        updated_at: new Date().toISOString()
      };

      console.log('Updating student profile with user_id:', user.id);
      console.log('Update data:', updateData);

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id)  // Fixed: use user_id instead of id
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        setError(`Error saving profile: ${error.message}`);
        return;
      }

      console.log('Profile updated:', data);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      setError(`Error saving profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    if (user) {
      fetchUserProfile();
    }
  };

  const stats = [
    { icon: "🏆", label: "Achievements", value: userInfo.achievements, color: "from-yellow-400 to-orange-500" },
    { icon: "🔥", label: "Day Streak", value: userInfo.day_streak, color: "from-red-400 to-pink-500 text-xl" },
    { icon: "🎯", label: "Activities Done", value: userInfo.activities_done, color: "from-blue-400 to-indigo-500" },
    { icon: "⭐", label: "Accuracy Rate", value: userInfo.accuracy_rate, color: "from-purple-400 to-blue-500" },
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
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-32 w-48 h-48 bg-purple-200/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-32 h-32 bg-pink-200/20 rounded-full blur-xl animate-bounce-gentle"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-6 py-1">
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
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/home" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                Home
              </a>
              <a href="/flashcardspage" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                Activities
              </a>
              <a href="/studentpage" className="text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                Learning Hub
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/studentpage')}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Back
              </button>
              
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
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
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl">
            {success}
          </div>
        )}

        {/* Profile Header */}
        <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl animate-bounce-gentle border-4 border-white">
                <img 
                  src="/src/assets/kidprofile1.jpg" 
                  alt="Chris Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gray-800 mr-2">Hi, </span>
                      <input
                        type="text"
                        name="username"
                        value={userInfo.username}
                        onChange={handleChange}
                        placeholder="Username"
                        className="text-2xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 focus:outline-none text-center lg:text-left"
                        minLength="3"
                        maxLength="20"
                      />
                      <span className="text-2xl font-bold text-gray-800 ml-1">! 👋</span>
                    </div>
                  </div>
                ) : (
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                    Hi, {userInfo.username || `${userInfo.first_name} ${userInfo.last_name}`.trim() || 'User'}! 👋
                  </h1>
                )}
                <p className="text-lg text-gray-600">
                  You're doing amazing things every day! 🚀
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className={`bg-gradient-to-r ${stat.color} card-autism-friendly rounded-2xl p-4 text-white text-center shadow-lg `}
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

        {/* Personal Information and Badges Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Personal Information */}
          <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
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
                      className="btn-autism-friendly bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center text-sm"
                    >
                      <span className="mr-1">❌</span>
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-autism-friendly bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
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
                    className="btn-autism-friendly bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6   py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center text-xl cursor-pointer"
                  >
                    <span className="mr-1">✏️</span>
                    Edit
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Full Name */}
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                <span className="text-2xl mr-4">👋</span>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={`${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim()}
                      onChange={(e) => {
                        const names = e.target.value.split(' ');
                        const firstName = names[0] || '';
                        const lastName = names.slice(1).join(' ') || '';
                        setUserInfo(prev => ({
                          ...prev,
                          first_name: firstName,
                          last_name: lastName
                        }));
                      }}
                      className="w-full bg-transparent border-b border-blue-400 focus:outline-none text-gray-800"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">
                      {`${userInfo.first_name || "Chris"} ${userInfo.last_name || "Student"}`.trim()}
                    </p>
                  )}
                </div>
              </div>

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
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-purple-400 focus:outline-none text-gray-800"
                      minLength="3"
                      maxLength="20"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">@{userInfo.username || "chris_explorer"}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-200/50">
                <span className="text-2xl mr-4">🏡</span>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={userInfo.address}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-green-400 focus:outline-none text-gray-800"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{userInfo.address || "123 Learning Street, Education City"}</p>
                  )}
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200/50">
                <span className="text-2xl mr-4">👤</span>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700">Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={userInfo.gender}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-pink-400 focus:outline-none text-gray-800"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  ) : (
                    <p className="text-gray-800 font-medium">{userInfo.gender || "Male"}</p>
                  )}
                </div>
              </div>

              {/* Grade */}
              <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200/50">
                <span className="text-2xl mr-4">📚</span>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700">Grade Level</label>
                  {isEditing ? (
                    <select
                      name="grade"
                      value={userInfo.grade}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-indigo-400 focus:outline-none text-gray-800"
                    >
                      <option value="">Select Grade</option>
                      <option value="K">Kindergarten</option>
                      <option value="1">Grade 1</option>
                      <option value="2">Grade 2</option>
                      <option value="3">Grade 3</option>
                      <option value="4">Grade 4</option>
                      <option value="5">Grade 5</option>
                      <option value="6">Grade 6</option>
                    </select>
                  ) : (
                    <p className="text-gray-800 font-medium">{userInfo.grade ? `Grade ${userInfo.grade}` : "Grade 2"}</p>
                  )}
                </div>
              </div>

              {/* Parent/Guardian Email */}
              <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-200/50">
                <span className="text-2xl mr-4">👨‍👩‍👧‍👦</span>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700">Parent/Guardian Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="parent_email"
                      value={userInfo.parent_email}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-orange-400 focus:outline-none text-gray-800"
                      placeholder="parent@example.com"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">
                      {userInfo.parent_email || "No parent email linked"}
                    </p>
                  )}
                  {!isEditing && (
                    <p className="text-xs text-gray-500 mt-1">
                      This email links your account to a parent dashboard
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* My Badges Collection */}
          <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3 animate-bounce-gentle">🏆</span>
              My Badges Collection
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: '⭐',
                  title: 'First Steps',
                  description: 'Completed your first activity',
                  status: 'EARNED',
                  color: 'from-yellow-400 to-yellow-600',
                  bgColor: 'bg-yellow-50',
                  animation: 'animate-bounce-gentle'
                },
                {
                  icon: '🎓',
                  title: 'Academic Star',
                  description: 'Completed 5 academic activities',
                  status: 'EARNED',
                  color: 'from-blue-400 to-blue-600',
                  bgColor: 'bg-blue-50',
                  animation: 'animate-pulse-gentle'
                },
                {
                  icon: '🎨',
                  title: 'Color Master',
                  description: 'Awarded for completing 5 color-related activities',
                  status: 'EARNED',
                  color: 'from-purple-400 to-purple-600',
                  bgColor: 'bg-purple-50',
                  animation: 'animate-bounce-gentle'
                },
                {
                  icon: '🔷',
                  title: 'Shape Explorer',
                  description: 'Awarded after finishing 5 shape activities',
                  status: 'EARNED',
                  color: 'from-blue-400 to-indigo-600',
                  bgColor: 'bg-blue-50',
                  animation: 'animate-float'
                },
                {
                  icon: '🔢',
                  title: 'Number Ninja',
                  description: 'Earned by correctly answering 20 number-related questions',
                  status: 'EARNED',
                  color: 'from-green-400 to-green-600',
                  bgColor: 'bg-green-50',
                  animation: 'animate-wiggle'
                },
                {
                  icon: '📅',
                  title: 'Consistency Champ',
                  description: 'Given for completing activities 3 days in a row',
                  status: 'LOCKED',
                  color: 'from-gray-400 to-gray-500',
                  bgColor: 'bg-gray-50',
                  animation: ''
                },
                {
                  icon: '🤝',
                  title: 'Helper Badge',
                  description: 'For activities done collaboratively with a parent/teacher',
                  status: 'EARNED',
                  color: 'from-orange-400 to-orange-600',
                  bgColor: 'bg-orange-50',
                  animation: 'animate-pulse-gentle'
                },
                {
                  icon: '🏠',
                  title: 'Daily Life Hero',
                  description: 'Awarded for finishing 5 "Daily Life Skills" activities',
                  status: 'EARNED',
                  color: 'from-teal-400 to-teal-600',
                  bgColor: 'bg-teal-50',
                  animation: 'animate-float-delayed'
                },
                {
                  icon: '🏆',
                  title: 'All-Rounder',
                  description: 'Earned when a student completes at least one activity in every category',
                  status: 'LOCKED',
                  color: 'from-gray-400 to-gray-500',
                  bgColor: 'bg-gray-50',
                  animation: ''
                }
              ].map((badge, index) => (
                <div 
                  key={index}
                  className={`card-autism-friendly ${badge.bgColor} p-4 rounded-2xl text-center relative overflow-hidden border-2 ${
                    badge.status === 'EARNED' 
                      ? 'border-green-200 shadow-lg' 
                      : 'border-gray-200 opacity-75'
                  }`}
                >
                  {/* Status indicator */}
                  {badge.status === 'EARNED' && (
                    <div className="absolute top-2 right-2">
                      <span className="text-green-500 text-lg animate-bounce-in">✓</span>
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 bg-gradient-to-r ${badge.color} rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl text-white shadow-lg ${badge.animation}`}>
                    {badge.icon}
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-sm mb-2">
                    {badge.title}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-2 leading-tight">
                    {badge.description}
                  </p>
                  
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    badge.status === 'EARNED' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {badge.status}
                  </span>
                  
                  {badge.status === 'EARNED' && (
                    <div className="absolute bottom-1 right-1">
                      <span className="text-yellow-400 text-sm animate-pulse-gentle">✨</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Individual Progress Tracking */}
        <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-6 mb-8 shadow-2xl border border-white/20">
          <div classname="grid md:grid-cols-2 gap-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3 animate-bounce-gentle">📊</span>
            My Learning Progress
          </h2>         
          

              
          </div>
        </div>

      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-20">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4">
          <div className="flex justify-around">
            <a href="/studentpage" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
              <span className="text-2xl mb-1">🏠</span>
              <span className="text-xs font-semibold">Home</span>
            </a>
            <a href="/flashcardspage" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
              <span className="text-2xl mb-1">🎯</span>
              <span className="text-xs font-semibold">Activity</span>
            </a>
            <a href="/home" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
              <span className="text-2xl mb-1">😊</span>
              <span className="text-xs font-semibold">Expression</span>
            </a>
            <div className="flex flex-col items-center p-2 text-blue-600">
              <span className="text-2xl mb-1">👤</span>
              <span className="text-xs font-semibold">Profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
