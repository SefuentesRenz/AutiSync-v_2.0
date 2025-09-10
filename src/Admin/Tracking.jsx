import React, { useState } from 'react';
import { CheckCircleIcon, AcademicCapIcon, UsersIcon, StarIcon, FireIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const Tracking = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  
  const metrics = [
    {
      title: 'TOTAL ACTIVITIES',
      value: 20,
      change: 'System total',
      icon: <AcademicCapIcon className="w-8 h-8 text-blue-600" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'COMPLETION RATE',
      value: '85%',
      change: '+8% from last month',
      icon: <div className="w-8 h-8 text-green-600 text-2xl">🎯</div>,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'AVERAGE ACCURACY',
      value: '82.5%',
      change: '+5.2% from last month',
      icon: <div className="w-8 h-8 text-purple-600 text-2xl">🎯</div>,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'AVERAGE SCORE',
      value: '87.3',
      change: '+4.1 from last month',
      icon: <StarIcon className="w-8 h-8 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'ACTIVE STUDENTS',
      value: 24,
      change: '+3 new students',
      icon: <UsersIcon className="w-8 h-8 text-indigo-600" />,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
  ];

  // Accuracy rates by category (based on actual system: 5 academic + 1 daily life category)
  const accuracyRates = [
    { category: 'Colors', accuracy: 85, completed: '18/24', icon: '🎨', color: 'bg-purple-500' },
    { category: 'Shapes', accuracy: 78, completed: '20/24', icon: '🔷', color: 'bg-blue-500' },
    { category: 'Numbers', accuracy: 82, completed: '19/24', icon: '🔢', color: 'bg-green-500' },
    { category: 'Letters', accuracy: 74, completed: '17/24', icon: '�', color: 'bg-indigo-500' },
    { category: 'Patterns', accuracy: 69, completed: '16/24', icon: '🧩', color: 'bg-pink-500' },
    { category: 'Daily Life', accuracy: 77, completed: '22/24', icon: '🏠', color: 'bg-orange-500' }
  ];

  // Difficulty level progression (across all 20 activities: 15 academic + 5 daily life)
  const difficultyProgression = [
    { level: 'Easy', progress: 85, completed: '20/24', icon: '🌱', color: 'bg-green-500', bgColor: 'bg-green-50' },
    { level: 'Medium', progress: 72, completed: '17/24', icon: '🔥', color: 'bg-orange-500', bgColor: 'bg-orange-50' },
    { level: 'Hard', progress: 63, completed: '15/24', icon: '💎', color: 'bg-red-500', bgColor: 'bg-red-50' }
  ];

  

  const categories = [
    { name: 'Academic Skills', percent: 73, count: '15/20', icon: '📚', color: 'bg-blue-500' },
    { name: 'Daily Life Skills', percent: 77, count: '5/5', icon: '🏠', color: 'bg-orange-500' }
  ];

  const recentActivities = [
    {
      title: 'Numbers - Easy Level',
      user: 'Emma Johnson',
      category: 'Academic',
      time: '2 hours ago',
      difficulty: 'Easy',
      score: '95%',
      difficultyColor: 'bg-green-100 text-green-800',
      avatar: 'EJ'
    },
    {
      title: 'Daily Life Skills Activity',
      user: 'Michael Chen',
      category: 'Daily Life',
      time: '4 hours ago',
      difficulty: 'Medium',
      score: '87%',
      difficultyColor: 'bg-yellow-100 text-yellow-800',
      avatar: 'MC'
    },
    {
      title: 'Shapes - Hard Level',
      user: 'Sarah Williams',
      category: 'Academic',
      time: '6 hours ago',
      difficulty: 'Hard',
      score: '78%',
      difficultyColor: 'bg-red-100 text-red-800',
      avatar: 'SW'
    },
    {
      title: 'Color Recognition - Medium',
      user: 'Alex Rodriguez',
      category: 'Academic',
      time: '1 day ago',
      difficulty: 'Medium',
      score: '92%',
      difficultyColor: 'bg-yellow-100 text-yellow-800',
      avatar: 'AR'
    },
    {
      title: 'Matching Type - Easy',
      user: 'Lisa Park',
      category: 'Academic',
      time: '1 day ago',
      difficulty: 'Easy',
      score: '88%',
      difficultyColor: 'bg-green-100 text-green-800',
      avatar: 'LP'
    }
  ];

  const milestones = [
    {
      title: 'First Steps',
      description: 'Complete first 3 activities',
      percent: 100,
      color: 'bg-green-500',
      completed: true,
    },
    {
      title: 'Academic Explorer',
      description: 'Try all 5 academic activity types',
      percent: 85,
      color: 'bg-blue-500',
      completed: false,
    },
    {
      title: 'Daily Life Champion',
      description: 'Complete all 5 daily life activities',
      percent: 60,
      color: 'bg-orange-500',
      completed: false,
    },
    {
      title: 'System Master',
      description: 'Complete all 20 available activities',
      percent: 45,
      color: 'bg-purple-500',
      completed: false,
    },
  ];

  const badges = [
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
  ];

  const navigate = useNavigate();

  const AdminProfile = (e) => {
    e.preventDefault();
    navigate("/adminprofile");
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
              <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 text-white rounded-xl">
                      <AcademicCapIcon className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AutiSync
                    </h1>
                  </div>
                  
                  <nav className="hidden md:flex space-x-8">
                    <a href="/tracking" className="text-gray-600 text-lg hover:text-blue-600 font-semibold  transition-colors">
                      Dashboard
                    </a>
                    <a href="/activities" className="text-gray-600 text-lg hover:text-blue-600 font-semibold  transition-colors">
                      Activities
                    </a>
                    <a href="/alarmingemotions" className="text-gray-600 text-lg hover:text-blue-600 font-semibold transition-colors">
                      Expression Wall
                    </a>
                  </nav>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={AdminProfile}
                className="cursor-pointer -my-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-1 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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

        {/* OVERALL STUDENTS PROGRESS DASHBOARD */}
        <div className="max-w-full mx-auto sm:px-6  py-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
              <p className="text-lg text-gray-600">Monitor student progress and activity analytics</p>
            </div>

            <div className="flex items-center space-x-4">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              
              <button
                onClick={() => navigate('/admin/students')}
                className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <UsersIcon className="w-5 h-5" />
                <span>Manage Students</span>
              </button>
            </div>
          </div>

          {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
              <div className={`${metric.bgColor} rounded-xl p-3 w-fit mb-4`}>
                {metric.icon}
              </div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{metric.title}</p>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{metric.value}</h2>
              <p className="text-sm text-green-600 font-medium">{metric.change}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Accuracy Rates by Category */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Accuracy Rates by Category</h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="space-y-4">
              {accuracyRates.map((item, idx) => (
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
        

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Recent Activities</h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">📄</span>
              </div>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold">
                        {activity.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{activity.title}</p>
                        <p className="text-sm text-gray-500">
                          {activity.user} • {activity.category} • {activity.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${activity.difficultyColor}`}>
                        {activity.difficulty}
                      </span>
                      <span className="font-bold text-green-600 text-lg">{activity.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New Tracking Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Category Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Learning Categories</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="space-y-6">
              {categories.map((cat, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-semibold text-gray-700">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-600">{cat.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`${cat.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percent}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{cat.percent}% complete</p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Level Progression */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Difficulty Level Progression</h3>
              <div className="bg-orange-100 p-2 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <div className="space-y-4">
              {difficultyProgression.map((level, idx) => (
                <div key={idx} className={`${level.bgColor} rounded-xl p-4 border border-gray-200`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{level.icon}</span>
                      <div>
                        <span className="font-semibold text-gray-700">{level.level} Level</span>
                        <p className="text-sm text-gray-500">{level.completed} activities</p>
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
        </div>

       

        {/* Bottom Section */}
        <div className="grid  xl:grid-cols-1 gap-8">
         

          {/* Badges */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Achievements & Badges</h3>
            <div className="grid lg:grid-cols-5 gap-4">
              {badges.map((badge, index) => (
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
        </div>
    </div>
  );
};

export default Tracking;