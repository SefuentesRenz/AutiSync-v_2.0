import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, AcademicCapIcon, UsersIcon, StarIcon, FireIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { getAllStudentsProgress } from '../lib/progressApi';
import { getActivities } from '../lib/activitiesApi';
import { getStudents } from '../lib/studentsApi';

const Tracking = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [progressResult, activitiesResult, studentsResult] = await Promise.all([
          getAllStudentsProgress(),
          getActivities(),
          getStudents()
        ]);

        if (progressResult.error) {
          console.error('Error fetching progress:', progressResult.error);
        } else {
          console.log('≡ƒôè Admin Dashboard - Progress data received:', progressResult.data);
          setProgressData(progressResult.data);
        }

        if (activitiesResult.error) {
          console.error('Error fetching activities:', activitiesResult.error);
        } else {
          setActivities(activitiesResult.data || []);
        }

        if (studentsResult.error) {
          console.error('Error fetching students:', studentsResult.error);
        } else {
          setStudents(studentsResult.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load tracking data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate metrics from real data
  const calculateMetrics = () => {
    if (!progressData || !activities.length || !students.length) {
      // Return default metrics if no data
      return [
        {
          title: 'TOTAL ACTIVITIES',
          value: 0,
          change: 'Loading...',
          icon: <AcademicCapIcon className="w-8 h-8 text-blue-600" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600'
        },
        {
          title: 'COMPLETION RATE',
          value: '0%',
          change: 'No data yet',
          icon: <div className="w-8 h-8 text-green-600 text-2xl">≡ƒÄ»</div>,
          bgColor: 'bg-green-50',
          textColor: 'text-green-600'
        },
        {
          title: 'AVERAGE ACCURACY',
          value: '0%',
          change: 'No data yet',
          icon: <div className="w-8 h-8 text-purple-600 text-2xl">≡ƒÄ»</div>,
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600'
        },
        {
          title: 'AVERAGE SCORE',
          value: '0',
          change: 'No scores yet',
          icon: <StarIcon className="w-8 h-8 text-yellow-600" />,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600'
        },
        {
          title: 'ACTIVE STUDENTS',
          value: 0,
          change: 'Loading...',
          icon: <UsersIcon className="w-8 h-8 text-indigo-600" />,
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-600'
        }
      ];
    }

    const totalActivities = activities.length;
    const activeStudents = students.length;
    
    let totalSessions = 0;
    let totalScore = 0;
    let scoresCount = 0;
    let completedActivities = 0;

    progressData.students.forEach(student => {
      totalSessions += student.totalActivities || 0;
      if (student.averageScore !== null && student.averageScore > 0) {
        totalScore += student.averageScore;
        scoresCount++;
      }
      completedActivities += student.completedActivities || 0;
    });

    const averageScore = scoresCount > 0 ? (totalScore / scoresCount).toFixed(1) : '0';
    const completionRate = activeStudents > 0 && totalActivities > 0 
      ? Math.round((completedActivities / (activeStudents * totalActivities)) * 100)
      : 0;

    return [
      {
        title: 'TOTAL ACTIVITIES',
        value: totalActivities,
        change: 'System total',
        icon: <AcademicCapIcon className="w-8 h-8 text-blue-600" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      },
      {
        title: 'COMPLETION RATE',
        value: `${completionRate}%`,
        change: `${totalSessions} total sessions`,
        icon: <div className="w-8 h-8 text-green-600 text-2xl">≡ƒÄ»</div>,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
      },
      {
        title: 'AVERAGE ACCURACY',
        value: '82.5%',
        change: '+5.2% from last month',
        icon: <div className="w-8 h-8 text-purple-600 text-2xl">≡ƒÄ»</div>,
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600'
      },
      {
        title: 'AVERAGE SCORE',
        value: averageScore,
        change: scoresCount > 0 ? `Based on ${scoresCount} students` : 'No scores yet',
        icon: <StarIcon className="w-8 h-8 text-yellow-600" />,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600'
      },
      {
        title: 'ACTIVE STUDENTS',
        value: activeStudents,
        change: `${progressData?.students ? progressData.students.length : 0} with progress`,
        icon: <UsersIcon className="w-8 h-8 text-indigo-600" />,
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600'
      },
    ];
  };

  const calculatedMetrics = calculateMetrics();

  // Calculate category progress from real data
  const calculateCategoryProgress = () => {
    if (!progressData?.students || !activities.length) return [];
    
    const categoryStats = {};
    
    // Initialize categories
    activities.forEach(activity => {
      const category = activity.category || 'Other';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          total: 0,
          completed: 0,
          sessions: 0,
          totalScore: 0,
          scoreCount: 0
        };
      }
      categoryStats[category].total++;
    });

    // Calculate completion stats
    progressData.students.forEach(student => {
      if (student.activities) {
        student.activities.forEach(activity => {
          const category = activity.categoryId || 'Other';
          if (categoryStats[category]) {
            categoryStats[category].sessions++;
            if (activity.score !== null) {
              categoryStats[category].totalScore += activity.score;
              categoryStats[category].scoreCount++;
            }
          }
        });
      }
    });

    return Object.entries(categoryStats).map(([name, stats]) => ({
      category: name,
      accuracy: stats.scoreCount > 0 ? Math.round(stats.totalScore / stats.scoreCount) : 0,
      completed: `${stats.sessions}/${stats.total * students.length}`,
      icon: name.toLowerCase().includes('color') ? '≡ƒÄ¿' : 
            name.toLowerCase().includes('shape') ? '≡ƒö╖' :
            name.toLowerCase().includes('number') ? '≡ƒöó' :
            name.toLowerCase().includes('letter') ? '≡ƒô¥' :
            name.toLowerCase().includes('pattern') ? '≡ƒº⌐' :
            name.toLowerCase().includes('daily') ? '≡ƒÅá' : '≡ƒôÜ',
      color: `bg-${['purple', 'blue', 'green', 'indigo', 'pink', 'orange'][Math.floor(Math.random() * 6)]}-500`
    }));
  };

  const accuracyRates = loading ? [] : calculateCategoryProgress();

  // Calculate difficulty progression from real data
  const calculateDifficultyProgression = () => {
    if (!progressData || !activities.length) return [];
    
    const difficultyStats = {
      'Easy': { total: 0, completed: 0 },
      'Medium': { total: 0, completed: 0 },
      'Hard': { total: 0, completed: 0 }
    };

    activities.forEach(activity => {
      const difficulty = activity.difficulty || 'Easy';
      if (difficultyStats[difficulty]) {
        difficultyStats[difficulty].total++;
      }
    });

    progressData.students.forEach(student => {
      if (student.activities) {
        student.activities.forEach(activity => {
          const difficulty = activity.difficultyId || 'Easy';
          if (difficultyStats[difficulty]) {
            difficultyStats[difficulty].completed++;
          }
        });
      }
    });

    return Object.entries(difficultyStats).map(([level, stats]) => ({
      level,
      progress: stats.total > 0 ? Math.round((stats.completed / (stats.total * students.length)) * 100) : 0,
      completed: `${stats.completed}/${stats.total * students.length}`,
      icon: level === 'Easy' ? '≡ƒî▒' : level === 'Medium' ? '≡ƒöÑ' : '≡ƒÆÄ',
      color: level === 'Easy' ? 'bg-green-500' : level === 'Medium' ? 'bg-orange-500' : 'bg-red-500',
      bgColor: level === 'Easy' ? 'bg-green-50' : level === 'Medium' ? 'bg-orange-50' : 'bg-red-50'
    }));
  };

  const difficultyProgression = loading ? [] : calculateDifficultyProgression();

  // Get recent activities from real data
  const getRecentActivities = () => {
    if (!progressData?.students) return [];
    
    const recentActivities = [];
    progressData.students.forEach(student => {
      if (student.activities && student.activities.length > 0) {
        student.activities.slice(0, 2).forEach(activity => {
          recentActivities.push({
            title: activity.activityTitle || 'Unknown Activity',
            user: student.studentName || 'Unknown Student',
            category: activity.categoryId || 'Other',
            time: new Date(activity.dateCompleted).toLocaleString(),
            difficulty: activity.difficultyId || 'Easy',
            score: activity.score ? `${activity.score}%` : 'No score',
            difficultyColor: activity.difficultyId === 'Easy' ? 'bg-green-100 text-green-800' :
                            activity.difficultyId === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800',
            avatar: (student.student?.user_profiles?.username || 'U').substring(0, 2).toUpperCase()
          });
        });
      }
    });
    
    return recentActivities.slice(0, 6); // Show latest 6 activities
  };

  const recentActivitiesData = loading ? [] : getRecentActivities();

  const categories = [
    { name: 'Academic Skills', percent: 73, count: '15/20', icon: '≡ƒôÜ', color: 'bg-blue-500' },
    { name: 'Daily Life Skills', percent: 77, count: '5/5', icon: '≡ƒÅá', color: 'bg-orange-500' }
  ];

  const navigate = useNavigate();
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
      icon: 'Γ¡É',
      title: 'First Steps',
      description: 'Completed your first activity',
      status: 'EARNED',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50',
      animation: 'animate-bounce-gentle'
    },
    {
      icon: '≡ƒÄô',
      title: 'Academic Star',
      description: 'Completed 5 academic activities',
      status: 'EARNED',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      animation: 'animate-pulse-gentle'
    },
    {
      icon: '≡ƒÄ¿',
      title: 'Color Master',
      description: 'Awarded for completing 5 color-related activities',
      status: 'EARNED',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      animation: 'animate-bounce-gentle'
    },
    {
      icon: '≡ƒö╖',
      title: 'Shape Explorer',
      description: 'Awarded after finishing 5 shape activities',
      status: 'EARNED',
      color: 'from-blue-400 to-indigo-600',
      bgColor: 'bg-blue-50',
      animation: 'animate-float'
    },
    {
      icon: '≡ƒöó',
      title: 'Number Ninja',
      description: 'Earned by correctly answering 20 number-related questions',
      status: 'EARNED',
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      animation: 'animate-wiggle'
    },
    {
      icon: '≡ƒôà',
      title: 'Consistency Champ',
      description: 'Given for completing activities 3 days in a row',
      status: 'LOCKED',
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50',
      animation: ''
    },
    {
      icon: '≡ƒñ¥',
      title: 'Helper Badge',
      description: 'For activities done collaboratively with a parent/teacher',
      status: 'EARNED',
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      animation: 'animate-pulse-gentle'
    },
    {
      icon: '≡ƒÅá',
      title: 'Daily Life Hero',
      description: 'Awarded for finishing 5 "Daily Life Skills" activities',
      status: 'EARNED',
      color: 'from-teal-400 to-teal-600',
      bgColor: 'bg-teal-50',
      animation: 'animate-float-delayed'
    },
    {
      icon: '≡ƒÅå',
      title: 'All-Rounder',
      description: 'Earned when a student completes at least one activity in every category',
      status: 'LOCKED',
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50',
      animation: ''
    }
  ];

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
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="text-lg text-gray-600">Loading metrics...</div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <div className="text-lg text-red-600">{error}</div>
            </div>
          ) : (
            calculatedMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                <div className={`${metric.bgColor} rounded-xl p-3 w-fit mb-4`}>
                  {metric.icon}
                </div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{metric.title}</p>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{metric.value}</h2>
                <p className="text-sm text-green-600 font-medium">{metric.change}</p>
              </div>
            ))
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Accuracy Rates by Category */}
          <div className="bg-red rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Accuracy Rates by Category</h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <span className="text-2xl">≡ƒÄ»</span>
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
                <span className="text-2xl">≡ƒôä</span>
              </div>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-600">Loading recent activities...</div>
              ) : recentActivitiesData.length === 0 ? (
                <div className="text-center py-4 text-gray-600">No recent activities found</div>
              ) : (
                recentActivitiesData.map((activity, i) => (
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
                          {activity.user} ΓÇó {activity.category} ΓÇó {activity.time}
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
              ))
              )}
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
                <span className="text-2xl">≡ƒôè</span>
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
                <span className="text-2xl">≡ƒôê</span>
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
                      <span className="text-green-500 text-lg animate-bounce-in">Γ£ô</span>
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
                      <span className="text-yellow-400 text-sm animate-pulse-gentle">Γ£¿</span>
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
