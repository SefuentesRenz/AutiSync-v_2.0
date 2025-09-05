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
    school: "",
    interests: ["Drawing", "Animals", "Music", "Numbers"],
    achievements: 0,
    day_streak: 0,
    activities_done: 0,
    stars_earned: 0,
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
        .eq('id', user.id)
        .maybeSingle(); 

      if (error) {
        console.error('Error fetching profile:', error);
        setError(`Database error: ${error.message}`);
        return;
      }

      if (data) {
        console.log('Profile data found:', data);
        setUserInfo({
          username: data.username || `${data.first_name} ${data.last_name}`.trim(),
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          birthday: data.birthday || '',
          address: data.address || '',
          gender: data.gender || '',
          grade: data.grade || '',
          school: data.school || '',
          interests: data.interests || ["Drawing", "Animals", "Music", "Numbers"],
          achievements: data.achievements || 0,
          day_streak: data.day_streak || 0,
          activities_done: data.activities_done || 0,
          stars_earned: data.stars_earned || 0,
          favoriteColor: data.favorite_color || "#3B82F6",
          learning_style: data.learning_style || {
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
      const defaultProfile = {
        id: user.id,
        username: user.email?.split('@')[0] || 'student',
        first_name: '',
        last_name: '',
        birthday: '',
        address: '',
        gender: '',
        grade: '',
        school: '',
        interests: ["Drawing", "Animals", "Music", "Numbers"],
        achievements: 0,
        day_streak: 0,
        activities_done: 0,
        stars_earned: 0,
        favorite_color: "#3B82F6",
        learning_style: {
          visual: true,
          goal_oriented: true,
          routine_loving: true,
          step_by_step: true
        }
      };

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
        school: data.school || '',
        interests: data.interests || ["Drawing", "Animals", "Music", "Numbers"],
        achievements: data.achievements || 0,
        day_streak: data.day_streak || 0,
        activities_done: data.activities_done || 0,
        stars_earned: data.stars_earned || 0,
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

      const updateData = {
        username: userInfo.username,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        birthday: userInfo.birthday,
        address: userInfo.address,
        gender: userInfo.gender,
        grade: userInfo.grade,
        school: userInfo.school,
        interests: userInfo.interests,
        achievements: userInfo.achievements,
        day_streak: userInfo.day_streak,
        activities_done: userInfo.activities_done,
        stars_earned: userInfo.stars_earned,
        favorite_color: userInfo.favoriteColor,
        learning_style: userInfo.learning_style,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)
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
    { icon: "🔥", label: "Day Streak", value: userInfo.day_streak, color: "from-red-400 to-pink-500" },
    { icon: "🎯", label: "Activities Done", value: userInfo.activities_done, color: "from-blue-400 to-indigo-500" },
    { icon: "⭐", label: "Stars Earned", value: userInfo.stars_earned, color: "from-purple-400 to-blue-500" }
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
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
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
                onClick={handleEdit}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
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
          <div className="text-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-2xl animate-bounce-gentle">
              {userInfo.first_name ? userInfo.first_name[0].toUpperCase() : userInfo.username[0]?.toUpperCase() || "U"}
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {userInfo.first_name || userInfo.username || "Welcome!"}
            </h1>
            <p className="text-gray-600 text-lg">
              {userInfo.grade && `Grade ${userInfo.grade} • `}
              {userInfo.school || "Student at AutiSync"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className={`bg-gradient-to-r ${stat.color} rounded-2xl p-4 text-white text-center shadow-lg animate-float`} style={{animationDelay: `${index * 0.1}s`}}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Progress Tracking */}
        <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-6 mb-8 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3 animate-bounce-gentle">📊</span>
            My Learning Progress
          </h2>

          {/* Accuracy Rates */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Subject Accuracy Rates
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {studentTrackingData.accuracyRates.map((item, idx) => (
                <div key={idx} className={`${item.color} rounded-xl p-4 text-white text-center shadow-lg animate-float`} style={{animationDelay: `${idx * 0.1}s`}}>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-sm font-bold mb-1">{item.category}</div>
                  <div className="text-lg font-bold">{item.accuracy}%</div>
                  <div className="text-xs opacity-90">{item.completed}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Level Progression */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Difficulty Level Progress
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {studentTrackingData.difficultyProgression.map((level, idx) => (
                <div key={idx} className={`${level.bgColor} rounded-xl p-4 border border-gray-200`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{level.icon}</span>
                      <div>
                        <span className="font-semibold text-gray-700">{level.level}</span>
                        <p className="text-sm text-gray-500">{level.completed}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-800">{level.progress}%</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-3">
                    <div
                      className={`${level.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${level.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Breakdown */}
          <div>
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <span className="text-2xl mr-2">🌟</span>
              Skills Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {studentTrackingData.skillsBreakdown.map((skill, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${skill.color} rounded-2xl p-4 text-white text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
                  <div className="text-3xl mb-2">{skill.icon}</div>
                  <h4 className="text-sm font-bold mb-2">{skill.skill}</h4>
                  <div className="space-y-1">
                    <div className="bg-white/20 rounded-full py-1 px-2">
                      <p className="text-xs font-semibold">Progress: {skill.progress}%</p>
                    </div>
                    <div className="bg-white/20 rounded-full py-1 px-2">
                      <p className="text-xs font-semibold">Accuracy: {skill.accuracy}%</p>
                    </div>
                    <p className="text-xs opacity-90">{skill.activities} done</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Basic Info */}
          <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">👤</span>
              Personal Information
            </h2>
            
            <div className="space-y-4">
              {/* First Name */}
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                <span className="text-2xl mr-4">👋</span>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={userInfo.first_name}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-blue-400 focus:outline-none text-gray-800"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{userInfo.first_name || "Not set"}</p>
                  )}
                </div>
              </div>

              {/* Last Name */}
              <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                <span className="text-2xl mr-4">👨‍👩‍👧‍👦</span>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={userInfo.last_name}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-purple-400 focus:outline-none text-gray-800"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{userInfo.last_name || "Not set"}</p>
                  )}
                </div>
              </div>

              {/* Birthday */}
              <div className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50">
                <span className="text-2xl mr-4">🎂</span>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700">Birthday</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthday"
                      value={userInfo.birthday}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-orange-400 focus:outline-none text-gray-800"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{userInfo.birthday || "Not set"}</p>
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
                    <p className="text-gray-800 font-medium">{userInfo.address}</p>
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
                    <p className="text-gray-800 font-medium">{userInfo.gender || "Not set"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">🎓</span>
              Academic Information
            </h2>
            
            <div className="space-y-4">
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
                    <p className="text-gray-800 font-medium">{userInfo.grade ? `Grade ${userInfo.grade}` : "Not set"}</p>
                  )}
                </div>
              </div>

              {/* School */}
              <div className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/50">
                <span className="text-2xl mr-4">🏫</span>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700">School</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="school"
                      value={userInfo.school}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-emerald-400 focus:outline-none text-gray-800"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{userInfo.school || "Not set"}</p>
                  )}
                </div>
              </div>

              {/* Learning Style */}
              <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200/50">
                <h3 className="flex items-center text-lg font-bold text-gray-700 mb-3">
                  <span className="text-2xl mr-3">🧠</span>
                  Learning Style
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(userInfo.learning_style).map(([key, value]) => (
                    <div key={key} className={`flex items-center p-2 rounded-lg ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                      {value && <span className="ml-2">✓</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200/50">
                <h3 className="flex items-center text-lg font-bold text-gray-700 mb-3">
                  <span className="text-2xl mr-3">❤️</span>
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userInfo.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Gallery */}
        <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3 animate-bounce-gentle">🏆</span>
            My Badges Collection
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: '⭐', title: 'First Steps', color: 'from-yellow-400 to-yellow-600' },
              { icon: '🎓', title: 'Academic Star', color: 'from-blue-400 to-blue-600' },
              { icon: '🎨', title: 'Color Master', color: 'from-purple-400 to-purple-600' },
              { icon: '🔷', title: 'Shape Explorer', color: 'from-blue-400 to-indigo-600' },
              { icon: '🔢', title: 'Number Ninja', color: 'from-green-400 to-green-600' },
              { icon: '📅', title: 'Consistency Champ', color: 'from-gray-400 to-gray-600' },
              { icon: '🤝', title: 'Helper Badge', color: 'from-orange-400 to-orange-600' },
              { icon: '🏠', title: 'Daily Life Hero', color: 'from-teal-400 to-teal-600' },
              { icon: '🏆', title: 'All-Rounder', color: 'from-yellow-400 to-yellow-600' }
            ].map((achievement, index) => (
              <div 
                key={index}
                className={`p-4 rounded-2xl bg-gradient-to-r ${achievement.color} text-white text-center shadow-lg animate-float`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="text-sm font-bold">{achievement.title}</div>
                <div className="text-xs opacity-90 mt-1">EARNED</div>
              </div>
            ))}
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
