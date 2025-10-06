import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, AcademicCapIcon, UsersIcon, StarIcon, FireIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { getStudentProgressStats, getStudentProgress } from '../lib/progressApi';
import { getStudentById } from '../lib/studentsApi';
import { getActivities } from '../lib/activitiesApi';
import { supabase } from '../lib/supabase';

const StudentProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [recentProgress, setRecentProgress] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Since the Students.jsx is passing the student database ID, we need to get the actual student UUID
        // First, let's try to get the student by the profile UUID directly
        const studentUUID = id; // The ID passed from Students.jsx should be the UUID
        
        const [statsResult, progressResult, activitiesResult] = await Promise.all([
          getStudentProgressStats(studentUUID),
          getStudentProgress(studentUUID),
          getActivities()
        ]);

        // Get student profile information - try different approaches due to RLS
        let profileData = null;
        
        // First try direct query using 'user_id' column (which contains Supabase Auth UUIDs)
        const { data: directProfileData, error: directProfileError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, age, gender, address, grade, school, created_at, user_id')
          .eq('user_id', studentUUID)
          .single();

        if (directProfileError) {
          console.error('Direct profile query failed:', directProfileError);
          
          // Try querying from students table with join
          const { data: studentWithProfile, error: studentError } = await supabase
            .from('students')
            .select(`
              id,
              profile_id,
              user_profiles (
                id,
                full_name,
                email,
                age,
                gender,
                address,
                grade,
                school,
                created_at
              )
            `)
            .eq('profile_id', studentUUID)
            .single();

          if (studentError) {
            console.error('Student with profile query failed:', studentError);
            setError('Student not found');
            return;
          } else {
            profileData = studentWithProfile?.user_profiles;
          }
        } else {
          profileData = directProfileData;
        }

        if (profileData) {
          // Transform profile data to match expected student format
          setStudent({
            id: profileData.id,
            name: profileData.full_name || 'Unknown Student',
            email: profileData.email,
            age: profileData.age || 0,
            gender: profileData.gender || 'Not specified',
            address: profileData.address || 'No address provided',
            grade: profileData.grade || '',
            school: profileData.school || '',
            joinDate: new Date(profileData.created_at).toLocaleDateString(),
            status: 'Active'
          });
        } else {
          setError('Student profile not found');
        }

        if (statsResult.error) {
          console.error('Error fetching progress stats:', statsResult.error);
        } else {
          setProgressStats(statsResult.data);
        }

        if (progressResult.error) {
          console.error('Error fetching progress:', progressResult.error);
        } else {
          setRecentProgress(progressResult.data || []);
        }

        if (activitiesResult.error) {
          console.error('Error fetching activities:', activitiesResult.error);
        } else {
          setActivities(activitiesResult.data || []);
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const AdminProfile = (e) => {
    e.preventDefault();
    navigate("/adminprofile");
  };

  const handleBackToStudents = () => {
    navigate('/admin/students');
  };

  // Students database (should match the one in Students.jsx)
  const studentsDatabase = [
    {
      id: 1,
      name: 'Emma Johnson',
      age: 8,
      grade: '2nd Grade',
      address: '123 Main St, Springfield, IL',
      gender: 'Female',
      parentEmail: 'parent.emma@email.com',
      joinDate: '2024-01-15',
      status: 'Active',
      completedActivities: 24,
      averageScore: 87,
      lastActive: '2 hours ago',
      profileColor: 'bg-pink-500',
      profileImage: '/src/assets/kidprofile1.jpg'
    },
    {
      id: 2,
      name: 'Liam Smith',
      age: 7,
      grade: '1st Grade',
      address: '456 Oak Ave, Springfield, IL',
      gender: 'Male',
      parentEmail: 'parent.liam@email.com',
      joinDate: '2024-02-20',
      status: 'Active',
      completedActivities: 18,
      averageScore: 92,
      lastActive: '1 hour ago',
      profileColor: 'bg-blue-500',
      profileImage: '/src/assets/kidprofile1.jpg'
    },
    {
      id: 3,
      name: 'Sophia Davis',
      age: 9,
      grade: '3rd Grade',
      address: '789 Pine Rd, Springfield, IL',
      gender: 'Female',
      parentEmail: 'parent.sophia@email.com',
      joinDate: '2024-01-10',
      status: 'Active',
      completedActivities: 31,
      averageScore: 89,
      lastActive: '3 hours ago',
      profileColor: 'bg-purple-500',
      profileImage: '/src/assets/kidprofile1.jpg'
    },
    {
      id: 4,
      name: 'Noah Wilson',
      age: 6,
      grade: 'Kindergarten',
      address: '321 Elm St, Springfield, IL',
      gender: 'Male',
      parentEmail: 'parent.noah@email.com',
      joinDate: '2024-03-05',
      status: 'Inactive',
      completedActivities: 8,
      averageScore: 75,
      lastActive: '2 days ago',
      profileColor: 'bg-green-500',
      profileImage: '/src/assets/kidprofile1.jpg'
    },
    {
      id: 5,
      name: 'Isabella Brown',
      age: 8,
      grade: '2nd Grade',
      address: '654 Maple Dr, Springfield, IL',
      gender: 'Female',
      parentEmail: 'parent.isabella@email.com',
      joinDate: '2024-02-15',
      status: 'Active',
      completedActivities: 22,
      averageScore: 94,
      lastActive: '30 minutes ago',
      profileColor: 'bg-orange-500',
      profileImage: '/src/assets/kidprofile1.jpg'
    }
  ];

  // Check if student exists and handle redirect in useEffect
  useEffect(() => {
    if (!loading && !student && !error) {
      navigate('/admin/students');
    }
  }, [loading, student, error, navigate]);

  // Generate dynamic data based on real progress stats
  const generateStudentMetrics = () => {
    if (!progressStats) {
      return [
        { title: 'TOTAL ACTIVITIES', value: '0', change: 'Loading...', icon: <AcademicCapIcon className="w-8 h-8 text-blue-600" />, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
        { title: 'COMPLETION RATE', value: '0%', change: 'Loading...', icon: <div className="w-8 h-8 text-green-600 text-2xl">🎯</div>, bgColor: 'bg-green-50', textColor: 'text-green-600' },
        { title: 'AVERAGE SCORE', value: '0%', change: 'Loading...', icon: <StarIcon className="w-8 h-8 text-yellow-600" />, bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
        { title: 'RECENT ACTIVITIES', value: '0', change: 'Loading...', icon: <FireIcon className="w-8 h-8 text-red-600" />, bgColor: 'bg-red-50', textColor: 'text-red-600' },
        { title: 'ACTIVE STREAK', value: '0 days', change: 'Loading...', icon: <FireIcon className="w-8 h-8 text-orange-600" />, bgColor: 'bg-orange-50', textColor: 'text-orange-600' }
      ];
    }

    return [
      {
        title: 'COMPLETED ACTIVITIES',
        value: progressStats.completedActivities || 0,
        change: `${progressStats.totalActivities || 0} total activities`,
        icon: <AcademicCapIcon className="w-8 h-8 text-blue-600" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      },
      {
        title: 'COMPLETION RATE',
        value: `${progressStats.completionRate || 0}%`,
        change: progressStats.completionRate > 75 ? 'Excellent progress!' : progressStats.completionRate > 50 ? 'Good progress' : 'Keep going!',
        icon: <div className="w-8 h-8 text-green-600 text-2xl">🎯</div>,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
      },
      {
        title: 'AVERAGE ACCURACY',
        value: `${progressStats.averageScore || 0}%`,
        change: progressStats.averageScore > 85 ? 'Outstanding!' : progressStats.averageScore > 70 ? 'Great work!' : 'Improving',
        icon: <div className="w-8 h-8 text-purple-600 text-2xl">🎯</div>,
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600'
      },
      {
        title: 'AVERAGE SCORE',
        value: `${progressStats.averageScore || 0}%`,
        change: progressStats.averageScore > 85 ? 'Excellent work!' : progressStats.averageScore > 70 ? 'Good performance' : 'Room for improvement',
        icon: <StarIcon className="w-8 h-8 text-yellow-600" />,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600'
      },
      {
        title: 'RECENT ACTIVITIES',
        value: `${progressStats.recentActivities || 0}`,
        change: 'Last 7 days',
        icon: <FireIcon className="w-8 h-8 text-orange-600" />,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600'
      },
    ];
  };

  // Generate dynamic accuracy rates based on student performance
  const generateAccuracyRates = (student) => {
    const baseAccuracy = student.averageScore;
    return [
      { 
        category: 'Colors', 
        accuracy: Math.min(100, baseAccuracy + Math.floor(Math.random() * 15)), 
        completed: `${Math.floor(Math.random() * 3) + 6}/8`, 
        icon: '🎨', 
        color: 'bg-purple-500' 
      },
      { 
        category: 'Shapes', 
        accuracy: Math.max(60, baseAccuracy - Math.floor(Math.random() * 10)), 
        completed: `${Math.floor(Math.random() * 3) + 5}/8`, 
        icon: '🔷', 
        color: 'bg-blue-500' 
      },
      { 
        category: 'Numbers', 
        accuracy: Math.min(100, baseAccuracy + Math.floor(Math.random() * 10)), 
        completed: `${Math.floor(Math.random() * 3) + 4}/6`, 
        icon: '🔢', 
        color: 'bg-green-500' 
      },
      { 
        category: 'Letters', 
        accuracy: Math.max(65, baseAccuracy - Math.floor(Math.random() * 15)), 
        completed: `${Math.floor(Math.random() * 3) + 3}/6`, 
        icon: '📝', 
        color: 'bg-indigo-500' 
      },
      { 
        category: 'Patterns', 
        accuracy: Math.max(60, baseAccuracy - Math.floor(Math.random() * 20)), 
        completed: `${Math.floor(Math.random() * 3) + 2}/5`, 
        icon: '🧩', 
        color: 'bg-pink-500' 
      },
      { 
        category: 'Daily Life', 
        accuracy: Math.min(100, baseAccuracy + Math.floor(Math.random() * 8)), 
        completed: `${Math.floor(Math.random() * 2) + 4}/5`, 
        icon: '🏠', 
        color: 'bg-orange-500' 
      }
    ];
  };

  // Generate recent activities based on student
  const generateRecentActivities = (student) => {
    const activities = [
      'Numbers - Easy Level', 'Color Recognition', 'Shape Matching', 
      'Daily Routine', 'Letter Recognition', 'Pattern Completion',
      'Counting Objects', 'Emotion Recognition', 'Time Telling'
    ];
    
    return activities.slice(0, 5).map((activity, i) => ({
      title: activity,
      category: i % 2 === 0 ? 'Academic' : 'Daily Life',
      time: `${Math.floor(Math.random() * 12) + 1} hours ago`,
      difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
      score: `${Math.max(60, student.averageScore - Math.floor(Math.random() * 20) + Math.floor(Math.random() * 20))}%`,
      difficultyColor: ['bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800'][Math.floor(Math.random() * 3)],
      duration: `${Math.floor(Math.random() * 8) + 2} min`
    }));
  };

  // Generate difficulty progression based on student level
  const generateDifficultyProgression = (student) => {
    const totalActivities = student.completedActivities;
    const avgScore = student.averageScore;
    
    // Higher performing students have attempted more difficult levels
    const easyCompleted = Math.min(20, totalActivities);
    const mediumCompleted = avgScore > 85 ? Math.min(15, Math.max(0, totalActivities - 15)) : Math.min(10, Math.max(0, totalActivities - 10));
    const hardCompleted = avgScore > 90 ? Math.min(10, Math.max(0, totalActivities - 25)) : 0;

    return [
      { 
        level: 'Easy', 
        progress: Math.floor((easyCompleted / 20) * 100), 
        completed: `${easyCompleted}/20`, 
        icon: '🌱', 
        color: 'bg-green-500', 
        bgColor: 'bg-green-50' 
      },
      { 
        level: 'Medium', 
        progress: Math.floor((mediumCompleted / 15) * 100), 
        completed: `${mediumCompleted}/15`, 
        icon: '🔥', 
        color: 'bg-orange-500', 
        bgColor: 'bg-orange-50' 
      },
      { 
        level: 'Hard', 
        progress: Math.floor((hardCompleted / 10) * 100), 
        completed: `${hardCompleted}/10`, 
        icon: '💎', 
        color: 'bg-red-500', 
        bgColor: 'bg-red-50' 
      }
    ];
  };

  // Generate badges based on student achievements
  const generateBadges = (student) => {
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
        description: 'Completed 10 academic activities',
        status: student.completedActivities >= 10 ? 'EARNED' : 'LOCKED',
        color: student.completedActivities >= 10 ? 'from-blue-400 to-blue-600' : 'from-gray-400 to-gray-500',
        bgColor: student.completedActivities >= 10 ? 'bg-blue-50' : 'bg-gray-50',
        animation: student.completedActivities >= 10 ? 'animate-pulse-gentle' : ''
      },
      {
        icon: '🎨',
        title: 'Color Master',
        description: 'Perfect score on 5 color activities',
        status: student.averageScore >= 90 ? 'EARNED' : 'LOCKED',
        color: student.averageScore >= 90 ? 'from-purple-400 to-purple-600' : 'from-gray-400 to-gray-500',
        bgColor: student.averageScore >= 90 ? 'bg-purple-50' : 'bg-gray-50',
        animation: student.averageScore >= 90 ? 'animate-bounce-gentle' : ''
      },
      {
        icon: '🔢',
        title: 'Number Ninja',
        description: 'Excellent performance in numbers',
        status: student.averageScore >= 85 ? 'EARNED' : 'LOCKED',
        color: student.averageScore >= 85 ? 'from-green-400 to-green-600' : 'from-gray-400 to-gray-500',
        bgColor: student.averageScore >= 85 ? 'bg-green-50' : 'bg-gray-50',
        animation: student.averageScore >= 85 ? 'animate-wiggle' : ''
      },
      {
        icon: '🔥',
        title: 'Streak Master',
        description: 'Learning for 7 days straight',
        status: student.status === 'Active' ? 'EARNED' : 'LOCKED',
        color: student.status === 'Active' ? 'from-orange-400 to-orange-600' : 'from-gray-400 to-gray-500',
        bgColor: student.status === 'Active' ? 'bg-orange-50' : 'bg-gray-50',
        animation: student.status === 'Active' ? 'animate-pulse-gentle' : ''
      },
      {
        icon: '🤝',
        title: 'Helper Badge',
        description: 'Completed activities with help',
        status: 'EARNED',
        color: 'from-pink-400 to-pink-600',
        bgColor: 'bg-pink-50',
        animation: 'animate-float'
      },
      {
        icon: '💎',
        title: 'Challenge Seeker',
        description: 'Attempt 5 hard level activities',
        status: student.completedActivities >= 25 ? 'EARNED' : 'LOCKED',
        color: student.completedActivities >= 25 ? 'from-indigo-400 to-indigo-600' : 'from-gray-400 to-gray-500',
        bgColor: student.completedActivities >= 25 ? 'bg-indigo-50' : 'bg-gray-50',
        animation: student.completedActivities >= 25 ? 'animate-float-delayed' : ''
      },
      {
        icon: '🏆',
        title: 'All-Rounder',
        description: 'Complete activity in every category',
        status: student.completedActivities >= 20 && student.averageScore >= 85 ? 'EARNED' : 'LOCKED',
        color: student.completedActivities >= 20 && student.averageScore >= 85 ? 'from-gold-400 to-gold-600' : 'from-gray-400 to-gray-500',
        bgColor: student.completedActivities >= 20 && student.averageScore >= 85 ? 'bg-yellow-50' : 'bg-gray-50',
        animation: student.completedActivities >= 20 && student.averageScore >= 85 ? 'animate-bounce-gentle' : ''
      }
    ];
    
    return badges;
  };

  // Use real progress data instead of generated data
  const metrics = generateStudentMetrics();
  
  // Create simple fallback data for display sections that haven't been updated yet
  const fallbackStudent = {
    completedActivities: progressStats?.completedActivities || 0,
    averageScore: progressStats?.averageScore || 0
  };
  
  const accuracyRates = generateAccuracyRates(fallbackStudent);
  const difficultyProgression = generateDifficultyProgression(fallbackStudent);
  const badges = generateBadges(fallbackStudent);

  // Use real recent progress data
  const recentActivitiesDisplay = recentProgress?.slice(0, 6).map((progress, index) => {
    // Get activity title from the progress data
    const activityTitle = progress.activityTitle || 'Unknown Activity';
    
    // Get student name - try multiple sources
    const studentName = progress.student_name || 
                       progress.studentName || 
                       student?.name || 
                       `Student ${progress.student_id?.substring(0, 8)}`;
    
    return {
      title: activityTitle,
      user: studentName,
      category: progress.categoryId || progress.category || 'Other',
      time: new Date(progress.dateCompleted || progress.date_completed).toLocaleString(),
      difficulty: progress.difficultyId || progress.difficulty || 'Easy',
      score: progress.score ? `${progress.score}%` : 'No score',
      difficultyColor: (progress.difficultyId || progress.difficulty) === 'Easy' ? 'bg-green-100 text-green-800' :
                      (progress.difficultyId || progress.difficulty) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800',
      avatar: studentName ? studentName.split(' ').map(n => n[0]).join('') : 'S'
    };
  }) || [];

  const categories = [
    { name: 'Academic Skills', percent: Math.min(100, fallbackStudent.averageScore + 5), count: `${Math.floor(fallbackStudent.completedActivities * 0.7)}/${Math.floor(fallbackStudent.completedActivities * 0.8)}`, icon: '📚', color: 'bg-blue-500' },
    { name: 'Daily Life Skills', percent: Math.min(100, fallbackStudent.averageScore + 10), count: `${Math.floor(fallbackStudent.completedActivities * 0.3)}/${Math.floor(fallbackStudent.completedActivities * 0.4)}`, icon: '🏠', color: 'bg-orange-500' }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white rounded-xl p-2">
                <AcademicCapIcon className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutiSync
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/tracking" className="text-gray-600 text-lg hover:text-blue-600 font-semibold transition-colors">
                Dashboard
              </a>
              <a href="/activities" className="text-gray-600 text-lg hover:text-blue-600 font-semibold transition-colors">
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

      {/* INDIVIDUAL STUDENT PROGRESS DASHBOARD */}
      <div className="max-w-full mx-auto sm:px-6 py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600 mb-4">Loading student progress...</div>
            <div className="text-gray-500">Fetching data from backend APIs</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-xl text-red-600 mb-4">{error}</div>
            <button 
              onClick={handleBackToStudents}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Students
            </button>
          </div>
        ) : (
          <>
        {/* Page Header with Student Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className=" md:mb-0">
            <div className="flex items-center space-x-4 mb-2">
              <img
                src="/src/assets/kidprofile1.jpg"
                alt={student?.name || 'Student'}
                className="relative top-2 w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <h1 className="mt-5 text-4xl font-bold text-gray-800">{student?.name || 'Unknown Student'}</h1>
                {/* <p className="text-lg text-gray-600">
                  {student?.grade || 'Grade N/A'} • 
                  Age {student?.age || 'N/A'} • 
                  Individual Progress
                </p>
                <p className="text-sm text-gray-500">Email: {student?.email || 'N/A'}</p>
                <p className="text-sm text-gray-500">
                  Status: <span className="font-semibold text-green-600">{student?.status || 'Active'}</span> • 
                  Joined: {student?.joinDate || 'N/A'}
                </p> */}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            
            <button
              onClick={handleBackToStudents}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Students</span>
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
              {recentActivitiesDisplay.length > 0 ? recentActivitiesDisplay.map((activity, i) => (
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
              )) : (
                <div className="text-center py-4 text-gray-600">No recent activities found</div>
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

        {/* Bottom Section - Personal Badges */}
        <div className="grid xl:grid-cols-1 gap-8">
          {/* Personal Badges */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Achievements & Badges</h3>
            <div className="grid lg:grid-cols-4 gap-4">
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
        </>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;
