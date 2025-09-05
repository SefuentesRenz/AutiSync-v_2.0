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

  // Skills breakdown (based on actual 6 categories)
  const skillsBreakdown = [
    { skill: 'Numbers', progress: 67, accuracy: 82, activities: '19/24', icon: '🔢', color: 'from-green-400 to-green-600' },
    { skill: 'Shapes', progress: 83, accuracy: 78, activities: '20/24', icon: '🔷', color: 'from-blue-400 to-blue-600' },
    { skill: 'Colors', progress: 75, accuracy: 85, activities: '18/24', icon: '🎨', color: 'from-purple-400 to-purple-600' },
    { skill: 'Letters', progress: 71, accuracy: 74, activities: '17/24', icon: '�', color: 'from-indigo-400 to-indigo-600' },
    { skill: 'Patterns', progress: 67, accuracy: 69, activities: '16/24', icon: '🧩', color: 'from-pink-400 to-pink-600' },
    { skill: 'Daily Life', progress: 92, accuracy: 77, activities: '22/24', icon: '🏠', color: 'from-orange-400 to-orange-600' }
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
      title: 'Academic Star',
      description: 'Complete 20 academic activities',
      icon: '⭐',
      earned: true,
    },
    {
      title: 'Color Master',
      description: 'Complete 5 color-related activities',
      icon: '🎨',
      earned: true,
    },
    {
      title: 'Shape Explorer',
      description: 'Finish 5 shape activities',
      icon: '🔷',
      earned: true,
    },
    {
      title: 'Number Ninja',
      description: 'Answer 20 number-related questions correctly',
      icon: '🔢',
      earned: false,
    },
    {
      title: 'Consistency Champ',
      description: 'Complete activities 3 days in a row',
      icon: '📅',
      earned: false,
    },
    {
      title: 'Helper Badge',
      description: 'Activities done collaboratively with parent/teacher',
      icon: '🤝',
      earned: true,
    },
    {
      title: 'Daily Life Hero',
      description: 'Finish 5 Daily Life Skills activities',
      icon: '🏠',
      earned: false,
    },
    {
      title: 'All-Rounder',
      description: 'Complete at least one activity in every category',
      icon: '🏆',
      earned: false,
    },
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
                className="-my-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-1 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
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

        {/* Skills Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Skills Breakdown</h3>
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {skillsBreakdown.map((skill, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${skill.color} rounded-2xl p-6 text-white text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
                <div className="text-4xl mb-3">{skill.icon}</div>
                <h4 className="text-lg font-bold mb-2">{skill.skill}</h4>
                <div className="space-y-2">
                  <div className="bg-white/20 rounded-full p-2">
                    <p className="text-sm font-semibold">Progress: {skill.progress}%</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-2">
                    <p className="text-sm font-semibold">Accuracy: {skill.accuracy}%</p>
                  </div>
                  <p className="text-xs opacity-90">{skill.activities} activities completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Milestones */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Learning Milestones</h3>
            <div className="space-y-4">
              {milestones.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-4 border-2 transition-all duration-200 ${
                    item.completed 
                      ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    {item.completed && (
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{item.percent}% complete</p>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Achievements & Badges</h3>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 ${
                    badge.earned 
                      ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 shadow-md' 
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <div className="text-3xl mb-3">{badge.icon}</div>
                  <p className="font-bold text-sm text-gray-800 mb-1">{badge.title}</p>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  {badge.earned && (
                    <p className="text-xs text-orange-600 font-bold bg-yellow-200 px-2 py-1 rounded-full">
                      Earned! 🎉
                    </p>
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