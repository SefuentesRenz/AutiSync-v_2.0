import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  AcademicCapIcon, 
  UsersIcon, 
  StarIcon, 
  HeartIcon, 
  TrophyIcon, 
  LightBulbIcon,
  HomeIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FireIcon,
  CheckIcon,
  LockClosedIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';
import SystemInformation from './SystemInformation';
import MotivationTips from './MotivationTips';
import ParentProfileModal from '../components/ParentProfileModal';
import AddChildModal from '../components/AddChildModal';
import LinkChildModal from '../components/LinkChildModal';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [showAddChild, setShowAddChild] = useState(false);
  const [showLinkChild, setShowLinkChild] = useState(false);
  const [error, setError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  console.log('ParentDashboard render - showAddChild:', showAddChild);

  // Enhanced mock data matching student and admin page structures
  const mockChildrenData = [
    {
      id: 1,  
      name: "Emma Johnson",
      username: "emma_explorer",
      age: 8,
      email: "emma.student@example.com",
      profilePicture: "/src/assets/kidprofile1.jpg",
      recentActivities: [
        {
          id: 1,
          title: "Numbers - Easy Level",
          category: "Academic",
          difficulty: "Easy",
          completedAt: "2 hours ago",
          score: 95,
          timeSpent: "15 min",
          emotion: "happy"
        },
        {
          id: 2,
          title: "Daily Life Skills",
          category: "Daily Life",
          difficulty: "Medium",
          completedAt: "1 day ago",
          score: 88,
          timeSpent: "20 min",
          emotion: "excited"
        },
        {
          id: 3,
          title: "Shape Recognition",
          category: "Academic",
          difficulty: "Easy",
          completedAt: "2 days ago",
          score: 92,
          timeSpent: "12 min",
          emotion: "happy"
        }
      ],
      // Enhanced progress data matching student pages
      progress: {
        overallAccuracy: 78.5,
        totalActivities: 20,
        completedActivities: 16,
        completionRate: 80,
        streakRecord: 7,
        averageScore: 87.3,
        skillsBreakdown: [
          { skill: 'Numbers', progress: 82, accuracy: 82, activities: '2/3', icon: '🔢', color: 'from-green-400 to-green-600' },
          { skill: 'Shapes', progress: 78, accuracy: 78, activities: '2/3', icon: '🔷', color: 'from-blue-400 to-blue-600' },
          { skill: 'Colors', progress: 85, accuracy: 85, activities: '3/3', icon: '🎨', color: 'from-purple-400 to-purple-600' },
          { skill: 'Letters', progress: 74, accuracy: 74, activities: '2/3', icon: '🔤', color: 'from-indigo-400 to-indigo-600' },
          { skill: 'Patterns', progress: 69, accuracy: 69, activities: '1/3', icon: '🧩', color: 'from-pink-400 to-pink-600' },
          { skill: 'Daily Life', progress: 77, accuracy: 77, activities: '4/5', icon: '🏠', color: 'from-orange-400 to-orange-600' }
        ],
        difficultyProgression: [
          { level: 'Easy', progress: 85, completed: '7/8', icon: '🌱', color: 'bg-green-500', bgColor: 'bg-green-50' },
          { level: 'Medium', progress: 72, completed: '6/8', icon: '🔥', color: 'bg-orange-500', bgColor: 'bg-orange-50' },
          { level: 'Hard', progress: 63, completed: '3/4', icon: '💎', color: 'bg-red-500', bgColor: 'bg-red-50' }
        ],
        accuracyRates: [
          { category: 'Colors', accuracy: 85, completed: '3/3', icon: '🎨', color: 'bg-purple-500' },
          { category: 'Shapes', accuracy: 78, completed: '2/3', icon: '🔷', color: 'bg-blue-500' },
          { category: 'Numbers', accuracy: 82, completed: '2/3', icon: '🔢', color: 'bg-green-500' },
          { category: 'Letters', accuracy: 74, completed: '2/3', icon: '🔤', color: 'bg-indigo-500' },
          { category: 'Patterns', accuracy: 69, completed: '1/3', icon: '🧩', color: 'bg-pink-500' },
          { category: 'Daily Life', accuracy: 77, completed: '4/5', icon: '🏠', color: 'bg-orange-500' }
        ]
      },
      // Enhanced emotions data with levels matching admin Expression Wall
      emotions: [
        { date: '2025-09-04', emotion: 'happy', level: 5, priority: 'Positive', username: 'emma_explorer' },
        { date: '2025-09-03', emotion: 'excited', level: 5, priority: 'Positive', username: 'emma_explorer' },
        { date: '2025-09-02', emotion: 'happy', level: 4, priority: 'Positive', username: 'emma_explorer' },
        { date: '2025-09-01', emotion: 'calm', level: 3, priority: 'Neutral', username: 'emma_explorer' },
        { date: '2025-08-31', emotion: 'happy', level: 5, priority: 'Positive', username: 'emma_explorer' },
        { date: '2025-08-30', emotion: 'excited', level: 4, priority: 'Positive', username: 'emma_explorer' },
        { date: '2025-08-29', emotion: 'calm', level: 3, priority: 'Neutral', username: 'emma_explorer' }
      ],
      // Enhanced badges matching student page structure
      badges: [
        { id: 1, icon: '⭐', title: 'First Steps', description: 'Completed your first activity', status: 'EARNED', color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-50', points: 10 },
        { id: 2, icon: '🎓', title: 'Academic Star', description: 'Completed 5 academic activities', status: 'EARNED', color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50', points: 25 },
        { id: 3, icon: '🎨', title: 'Color Master', description: 'Awarded for completing 5 color-related activities', status: 'EARNED', color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50', points: 75 },
        { id: 4, icon: '🔷', title: 'Shape Explorer', description: 'Awarded after finishing 5 shape activities', status: 'EARNED', color: 'from-blue-400 to-indigo-600', bgColor: 'bg-blue-50', points: 75 },
        { id: 5, icon: '🔢', title: 'Number Ninja', description: 'Earned by correctly answering 20 number-related questions', status: 'EARNED', color: 'from-green-400 to-green-600', bgColor: 'bg-green-50', points: 100 },
        { id: 6, icon: '📅', title: 'Consistency Champ', description: 'Given for completing activities 3 days in a row', status: 'LOCKED', color: 'from-gray-400 to-gray-500', bgColor: 'bg-gray-50', points: 0 },
        { id: 7, icon: '🤝', title: 'Helper Badge', description: 'For activities done collaboratively with a parent/teacher', status: 'EARNED', color: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-50', points: 50 },
        { id: 8, icon: '🏠', title: 'Daily Life Hero', description: 'Awarded for finishing 5 "Daily Life Skills" activities', status: 'LOCKED', color: 'from-gray-400 to-gray-500', bgColor: 'bg-gray-50', points: 0 }
      ]
    }
  ];

  useEffect(() => {
    if (user) {
      fetchChildrenData();
    }
  }, [user]);

  const fetchChildrenData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch children whose parent_email matches the logged-in parent's email
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('parent_email', user.email)
        .eq('user_type', 'student');

      if (error) {
        console.error('Error fetching children:', error);
        console.error('Error details:', error.message);
        setError(`Failed to load children data: ${error.message}`);
        setChildrenData([]);
        setSelectedChild(null);
      } else if (data && data.length > 0) {
        // Transform database data to match expected format
        const transformedData = data.map(child => ({
          id: child.id,
          name: `${child.first_name} ${child.last_name}`.trim() || child.username,
          username: child.username,
          age: child.age,
          email: child.email || 'No email provided',
          profilePicture: "/src/assets/kidprofile1.jpg",
          // Add mock activity data for now
          recentActivities: [
            {
              id: 1,
              title: "Numbers - Easy Level",
              category: "Academic", 
              difficulty: "Easy",
              completedAt: "2 hours ago",
              score: 95,
              timeSpent: "15 min",
              emotion: "happy"
            }
          ],
          // Add mock progress data
          progress: mockChildrenData[0].progress,
          emotions: mockChildrenData[0].emotions.map(emotion => ({
            ...emotion,
            username: child.username
          })),
          badges: mockChildrenData[0].badges
        }));
        
        setChildrenData(transformedData);
        setSelectedChild(transformedData[0]);
      } else {
        // No children found
        setChildrenData([]);
        setSelectedChild(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load children data');
      setChildrenData([]);
      setSelectedChild(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/loginpage');
  };

  const handleChildAdded = (newChild) => {
    // Close the add child modal
    setShowAddChild(false);
    // Refresh children data from database
    fetchChildrenData();
    // Small delay then select the new child
    setTimeout(() => {
      if (newChild && newChild.id) {
        setSelectedChild(newChild);
      }
    }, 500);
  };

  const handleChildLinked = (linkedChild) => {
    // Close the link child modal
    setShowLinkChild(false);
    // Refresh children data from database
    fetchChildrenData();
    // Small delay then select the linked child
    setTimeout(() => {
      if (linkedChild && linkedChild.id) {
        setSelectedChild(linkedChild);
      }
    }, 500);
  };

  const getEmotionIcon = (emotion) => {
    const emotions = {
      happy: '😊',
      excited: '🤩',
      calm: '😌',
      sad: '😢',
      angry: '😠'
    };
    return emotions[emotion] || '😐';
  };

  const getLevelColor = (level) => {
    if (level >= 5) return 'bg-green-500';
    if (level >= 4) return 'bg-blue-500'; 
    if (level >= 3) return 'bg-yellow-500';
    if (level >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getLevelBgColor = (level) => {
    if (level >= 5) return 'bg-green-50 border-green-200';
    if (level >= 4) return 'bg-blue-50 border-blue-200'; 
    if (level >= 3) return 'bg-yellow-50 border-yellow-200';
    if (level >= 2) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Positive': return 'bg-green-100 text-green-800 border-green-300';
      case 'Neutral': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Concerning': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <UsersIcon className="w-6 h-6 mr-2 text-indigo-600" />
            Loading Parent Dashboard
          </h2>
          <div className="text-gray-600">Preparing your child's learning insights...</div>
          <div className="mt-6">
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
        
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
            <p className="text-gray-600">Manage and track your children's learning progress</p>
          </div>

          {/* No Children Found / Search Section */}
          <div className="max-w-4xl mx-auto">
            {/* Current Children - Full Width */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <UsersIcon className="w-6 h-6 mr-2 text-blue-600" />
                  My Children
                </h2>
                <button
                  onClick={() => {
                    console.log('Add Child button clicked!');
                    console.log('Current showAddChild state:', showAddChild);
                    setShowAddChild(true);
                    console.log('After setting state to true');
                  }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Add Child</span>
                </button>
              </div>
              
              {childrenData.length === 0 ? (
                <div className="text-center py-12">
                  {/* Modern Icon */}
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-12 h-12 text-blue-600" />
                  </div>
                  
                  {/* Main Message */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Children Connected Yet</h3>
                  <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                    Start monitoring your child's learning journey by creating an account or connecting an existing one.
                  </p>
                  
                  {/* Action Cards */}
                  <div className="grid gap-6 max-w-2xl mx-auto">
                    {/* Create Account Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full">
                        <UserIcon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-blue-800 mb-3">Create New Account</h4>
                      <p className="text-blue-700 mb-4 leading-relaxed">
                        Create a learning account for your child instantly. No email required - we'll handle everything!
                      </p>
                      <button
                        onClick={() => setShowAddChild(true)}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span>👶</span>
                          <span>Create Child Account</span>
                        </span>
                      </button>
                    </div>
                    
                    {/* Connect Existing Account Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100 hover:border-green-200 transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full">
                        <ChevronRightIcon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-green-800 mb-3">Link Existing Account</h4>
                      <p className="text-green-700 mb-4 leading-relaxed">
                        If your child already has a student account, you can link it to your parent account using their credentials.
                      </p>
                      <button
                        onClick={() => setShowLinkChild(true)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span>🔗</span>
                          <span>Link Existing Account</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {childrenData.map((child) => (
                    <div key={child.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={child.profilePicture} 
                        alt={child.name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{child.name}</h3>
                        <p className="text-sm text-gray-500">@{child.username} • Age {child.age}</p>
                      </div>
                      <button
                        onClick={() => setSelectedChild(child)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Progress
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={fetchChildrenData}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                🔄 Refresh Children List
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Need Help?</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setShowAddChild(true)}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  📝 Create Child Account
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header with Navbar */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <div className="">
                <img
                  src="/src/assets/logo.png"
                  alt="Parent Profile"
                  className="w-15 h-15 -my-4 rounded-xl object-cover border-2 border-white"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutiSync 
                </h1>
                {/* <p className="text-sm text-gray-600">Monitor {selectedChild?.name || 'your child'}'s progress</p> */}
              </div>
              
              {/* Child Selector - Show only if multiple children */}
              {childrenData.length > 1 && (
                <div className="ml-6">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Viewing Child:
                  </label>
                  <select
                    value={selectedChild?.id || ''}
                    onChange={(e) => {
                      const child = childrenData.find(c => c.id.toString() === e.target.value);
                      setSelectedChild(child);
                    }}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {childrenData.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name} (@{child.username})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <nav className="hidden md:flex space-x-8">
            
              <button 
                onClick={() => setCurrentView('overview')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'overview' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setCurrentView('emotions')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'emotions' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Emotions
              </button>
              <button 
                onClick={() => setCurrentView('badges')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'badges' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Badges
              </button>
              <button 
                onClick={() => setCurrentView('tips')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'tips' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Tips
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-gradient-to-r cursor-pointer from-blue-500 to-purple-600 text-white p-1 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <img
                  src="/src/assets/kidprofile1.jpg"
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto sm:px-6 py-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
            <p className="text-lg text-gray-600">Monitor your child's learning journey and progress</p>
          </div>
          
          {/* Child Selector */}
          <div className="bg-white rounded-2xl -mb-3 p-4 shadow-lg border border-gray-100 min-w-[280px]">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Child</h3>
              <UserIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="space-y-2">
              {mockChildrenData.map((child) => (
                <div
                  key={child.id}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedChild?.id === child.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                  onClick={() => setSelectedChild(child)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={child.profilePicture}
                      alt={child.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{child.name}</h4>
                      <p className="text-xs text-gray-600">Age: {child.age}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">
                        {child.progress.overallAccuracy}%
                      </div>
                      <div className="text-xs text-gray-500">Accuracy</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

       

        {currentView === 'overview' && (
          <div className="space-y-8">

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">{/* Overall Accuracy */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-violet-100 to-blue-100 rounded-2xl">
                    <div className="text-2xl">🎯</div>
                  </div>
                  <span className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-1 rounded-full">ACCURACY</span>
                </div>
                <div className="text-3xl font-bold text-violet-600 mb-2">
                  {selectedChild.progress.overallAccuracy}%
                </div>
                <div className="text-sm text-gray-600">
                  Average accuracy across all activities
                </div>
              </div>

              {/* Activities Completed */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                    <div className="text-2xl">📚</div>
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">COMPLETED</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {selectedChild.progress.completedActivities}/{selectedChild.progress.totalActivities}
                </div>
                <div className="text-sm text-gray-600">
                  Activities completed
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl">
                    <div className="text-2xl">📈</div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">PROGRESS</span>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {selectedChild.progress.completionRate}%
                </div>
                <div className="text-sm text-gray-600">
                  Overall completion rate
                </div>
              </div>

              {/* Average Score */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl">
                    <StarIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">SCORE</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {selectedChild.progress.averageScore}
                </div>
                <div className="text-sm text-gray-600">
                  Average score across activities
                </div>
              </div>

              {/* Current Streak */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl">
                    <div className="text-2xl">🔥</div>
                  </div>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">STREAK</span>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {selectedChild.progress.streakRecord}
                </div>
                <div className="text-sm text-gray-600">
                  Days learning streak
                </div>
              </div>
            </div>
    

            {/* Recent Activities and Accuracy Rates */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              {/* Recent Activities */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Recent Activities</h3>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <span className="text-2xl">📄</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedChild.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getEmotionIcon(activity.emotion)}</div>
                          <div>
                            <p className="font-semibold text-gray-800">{activity.title}</p>
                            <p className="text-sm text-gray-500">
                              {activity.category} • {activity.completedAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyColor(activity.difficulty)}`}>
                            {activity.difficulty}
                          </span>
                          <div className="text-right">
                            <div className="font-bold text-green-600 text-lg">{activity.score}%</div>
                            <div className="text-xs text-gray-500">{activity.timeSpent}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accuracy Rates by Category */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Accuracy Rates by Category</h3>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedChild.progress.accuracyRates.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <span className="font-semibold text-gray-700">{item.category}</span>
                            <p className="text-sm text-gray-500">{item.completed} completed</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-gray-800">{item.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${item.color} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${item.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty Progression */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Difficulty Progression</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {selectedChild.progress.difficultyProgression.map((level, index) => (
                  <div key={index} className={`p-6 rounded-xl ${level.bgColor}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{level.icon}</span>
                        <h3 className="font-bold text-gray-800">{level.level}</h3>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{level.completed}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-semibold">{level.progress}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-3">
                        <div
                          className={`${level.color} h-3 rounded-full`}
                          style={{ width: `${level.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'emotions' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <HeartIcon className="w-6 h-6 mr-3 text-pink-600" />
                Emotion Tracking
              </h2>
              
              {/* Emotion Level Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {selectedChild.emotions.map((emotion, index) => (
                  <div key={index} className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${getLevelBgColor(emotion.level)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{getEmotionIcon(emotion.emotion)}</div>
                        <div>
                          <h3 className="font-bold text-gray-800 capitalize">{emotion.emotion}</h3>
                          <p className="text-sm text-gray-600">{new Date(emotion.date).toLocaleDateString()}</p>
                          <p className="text-xs text-blue-600 font-semibold">@{emotion.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(emotion.priority)}`}>
                          {emotion.priority}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Emotion Level</span>
                        <span className="text-lg font-bold text-gray-800">Level {emotion.level}</span>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level}
                            className={`h-3 flex-1 rounded ${
                              level <= emotion.level 
                                ? getLevelColor(emotion.level)
                                : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {emotion.level >= 4 ? 'High positive emotion' : 
                       emotion.level >= 3 ? 'Moderate emotion level' : 
                       'Lower emotion intensity'}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Weekly Overview Chart */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Weekly Emotion Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="text-2xl mb-2">😊</div>
                    <div className="text-sm text-gray-600">Happy Days</div>
                    <div className="text-xl font-bold text-green-600">5/7</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="text-2xl mb-2">🤩</div>
                    <div className="text-sm text-gray-600">Excited Days</div>
                    <div className="text-xl font-bold text-blue-600">3/7</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="text-2xl mb-2">😌</div>
                    <div className="text-sm text-gray-600">Calm Days</div>
                    <div className="text-xl font-bold text-yellow-600">2/7</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm text-gray-600">Avg Level</div>
                    <div className="text-xl font-bold text-purple-600">4.2</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2">Weekly Insights</h4>
                  <p className="text-blue-700 text-sm">
                    Your child has shown consistently positive emotion levels this week, with an average level of 4.2 out of 5. 
                    Most learning activities were completed in happy or excited states, indicating strong engagement and enjoyment.
                  </p>
                </div>
              </div>
              
              {/* Professional Analysis */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-green-600" />
                  Professional Recommendations
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-green-800">Maintain Positive Environment</h4>
                      <p className="text-sm text-green-700">Continue providing supportive learning experiences as your child shows high positive engagement levels.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-blue-800">Emotional Awareness</h4>
                      <p className="text-sm text-blue-700">Help your child identify and express their emotions to build emotional intelligence and self-awareness.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-purple-800">Celebrate Progress</h4>
                      <p className="text-sm text-purple-700">Acknowledge and celebrate the positive emotional responses to learning activities to reinforce engagement.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'badges' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <TrophyIcon className="w-6 h-6 mr-3 text-yellow-600" />
                Achievement Badges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedChild.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                      badge.status === 'EARNED'
                        ? `${badge.bgColor} border-transparent shadow-lg hover:shadow-xl transform hover:scale-105`
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    {badge.status === 'EARNED' && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                        <CheckIcon className="w-4 h-4" />
                      </div>
                    )}
                    {badge.status === 'LOCKED' && (
                      <div className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full p-1">
                        <LockClosedIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-4xl mb-4">{badge.icon}</div>
                      <h3 className={`font-bold text-lg mb-2 ${badge.status === 'EARNED' ? 'text-gray-800' : 'text-gray-500'}`}>
                        {badge.title}
                      </h3>
                      <p className={`text-sm mb-4 ${badge.status === 'EARNED' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {badge.description}
                      </p>
                      {badge.status === 'EARNED' && badge.points > 0 && (
                        <div className="bg-white rounded-full px-3 py-1 inline-block">
                          <span className="text-xs font-semibold text-gray-700">
                            +{badge.points} points
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'tips' && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2 flex items-center">
                    <LightBulbIcon className="w-8 h-8 mr-3" />
                    Parenting Tips & Guidance
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Expert strategies to support your child's learning journey
                  </p>
                </div>
                <div className="text-6xl opacity-20">💡</div>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl">🎯</div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Daily Goals</h3>
                  <p className="text-sm text-gray-600">Set achievable learning targets</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl">⭐</div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Celebrate Wins</h3>
                  <p className="text-sm text-gray-600">Acknowledge every achievement</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl">💝</div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Support Emotions</h3>
                  <p className="text-sm text-gray-600">Validate their feelings</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl">🚀</div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Build Confidence</h3>
                  <p className="text-sm text-gray-600">Encourage independence</p>
                </div>
              </div>
            </div>

            {/* Main Tips Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Support Tips */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                    <div className="text-xl">📚</div>
                  </div>
                  Daily Support
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="text-sm">⏰</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Keep Sessions Short</h4>
                      <p className="text-sm text-gray-600 mb-2">15-20 minute sessions maintain focus and prevent overwhelm.</p>
                      <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full inline-block">
                        💡 Tip: Use a visual timer to help them understand time limits
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="text-sm">🏠</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Create Learning Space</h4>
                      <p className="text-sm text-gray-600 mb-2">Set up a quiet, comfortable area free from distractions.</p>
                      <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full inline-block">
                        💡 Tip: Let them help set up their special learning corner
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="text-sm">❤️</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Follow Their Interests</h4>
                      <p className="text-sm text-gray-600 mb-2">Start with activities that match their current interests and preferences.</p>
                      <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full inline-block">
                        💡 Tip: Ask them to choose which activity they want to try first
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emotional Support Tips */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                    <div className="text-xl">💝</div>
                  </div>
                  Emotional Support
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="text-sm">🎭</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Acknowledge All Emotions</h4>
                      <p className="text-sm text-gray-600 mb-2">Use emotion tracking to discuss and validate their feelings during activities.</p>
                      <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full inline-block">
                        💡 Example: "I see you felt happy during colors! What made it fun?"
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="text-sm">🤗</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Embrace Mistakes</h4>
                      <p className="text-sm text-gray-600 mb-2">Create a safe environment where mistakes are learning opportunities.</p>
                      <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full inline-block">
                        💡 Say: "Mistakes help us learn! Let's try again together."
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="text-sm">💪</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Praise the Process</h4>
                      <p className="text-sm text-gray-600 mb-2">Focus on effort and persistence rather than just correct answers.</p>
                      <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full inline-block">
                        💡 Say: "I love how you kept trying even when it was hard!"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Goal Setting Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <TrophyIcon className="w-7 h-7 mr-3 text-orange-600" />
                Weekly Goal Setting
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <div className="text-xs">1</div>
                    </div>
                    Set Together
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">Involve your child in setting achievable weekly learning goals.</p>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="text-xs text-blue-800">"This week, let's complete 3 number activities and try 1 new skill!"</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <div className="text-xs">2</div>
                    </div>
                    Track Progress
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">Use visual charts or check-lists to track daily achievements.</p>
                  <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                    <p className="text-xs text-green-800">Create a fun progress chart with stickers or checkmarks!</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <div className="text-xs">3</div>
                    </div>
                    Celebrate
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">Acknowledge goal completion with special activities or rewards.</p>
                  <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <p className="text-xs text-purple-800">Pizza night, movie time, or badge ceremony!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Insights */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <StarIcon className="w-7 h-7 mr-3 text-indigo-600" />
                Expert Insights
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="text-lg">🧠</div>
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-800 mb-2">Learning Happens Differently</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Every child with autism has unique learning patterns and strengths. Progress may not be linear, 
                        and that's completely normal.
                      </p>
                      <div className="bg-indigo-50 p-2 rounded text-xs text-indigo-700">
                        <strong>Remember:</strong> Small steps forward are still progress worth celebrating!
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="text-lg">⚡</div>
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-800 mb-2">Consistency Over Intensity</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Regular, short practice sessions are more effective than long, infrequent ones. 
                        Even 10 minutes daily makes a difference.
                      </p>
                      <div className="bg-indigo-50 p-2 rounded text-xs text-indigo-700">
                        <strong>Tip:</strong> Build AutiSync time into your daily routine, like after breakfast.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Parent Profile Modal */}
      <ParentProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      
      {/* Add Child Modal */}
      <AddChildModal 
        isOpen={showAddChild} 
        onClose={() => setShowAddChild(false)}
        onChildAdded={handleChildAdded}
      />

      {/* Link Child Modal */}
      <LinkChildModal 
        isOpen={showLinkChild} 
        onClose={() => setShowLinkChild(false)}
        onChildLinked={handleChildLinked}
      />
    </div>
  );
};

export default ParentDashboard;
