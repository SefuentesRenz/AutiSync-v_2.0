// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext';
// import { 
//   AcademicCapIcon, 
//   UsersIcon, 
//   StarIcon, 
//   HeartIcon, 
//   TrophyIcon, 
//   LightBulbIcon,
//   HomeIcon,
//   UserIcon,
//   ChartBarIcon,
//   ClockIcon,
//   ExclamationTriangleIcon,
//   FireIcon,
//   CheckIcon,
//   LockClosedIcon,
//   ChevronRightIcon
// } from '@heroicons/react/24/solid';
// import SystemInformation from './SystemInformation';
// import MotivationTips from './MotivationTips';

// const ParentDashboard = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [childrenData, setChildrenData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedChild, setSelectedChild] = useState(null);
//   const [currentView, setCurrentView] = useState('home');

//   // Enhanced mock data matching student and admin page structures
//   const mockChildrenData = [
//     {
//       id: 1,
//       name: "Emma Johnson",
//       age: 8,
//       email: "emma.student@example.com",
//       profilePicture: "/src/assets/kidprofile1.jpg",
//       recentActivities: [
//         {
//           id: 1,
//           title: "Numbers - Easy Level",
//           category: "Academic",
//           difficulty: "Easy",
//           completedAt: "2 hours ago",
//           score: 95,
//           timeSpent: "15 min",
//           emotion: "happy"
//         },
//         {
//           id: 2,
//           title: "Daily Life Skills",
//           category: "Daily Life",
//           difficulty: "Medium",
//           completedAt: "1 day ago",
//           score: 88,
//           timeSpent: "20 min",
//           emotion: "excited"
//         },
//         {
//           id: 3,
//           title: "Shape Recognition",
//           category: "Academic",
//           difficulty: "Easy",
//           completedAt: "2 days ago",
//           score: 92,
//           timeSpent: "12 min",
//           emotion: "happy"
//         }
//       ],
//       // Enhanced progress data matching student pages
//       progress: {
//         overallAccuracy: 78.5,
//         totalActivities: 20,
//         completedActivities: 16,
//         completionRate: 80,
//         streakRecord: 7,
//         skillsBreakdown: [
//           { skill: 'Numbers', progress: 82, accuracy: 82, activities: '2/3', icon: '🔢', color: 'from-green-400 to-green-600' },
//           { skill: 'Shapes', progress: 78, accuracy: 78, activities: '2/3', icon: '🔷', color: 'from-blue-400 to-blue-600' },
//           { skill: 'Colors', progress: 85, accuracy: 85, activities: '3/3', icon: '🎨', color: 'from-purple-400 to-purple-600' },
//           { skill: 'Letters', progress: 74, accuracy: 74, activities: '2/3', icon: '🔤', color: 'from-indigo-400 to-indigo-600' },
//           { skill: 'Patterns', progress: 69, accuracy: 69, activities: '1/3', icon: '🧩', color: 'from-pink-400 to-pink-600' },
//           { skill: 'Daily Life', progress: 77, accuracy: 77, activities: '4/5', icon: '🏠', color: 'from-orange-400 to-orange-600' }
//         ],
//         difficultyProgression: [
//           { level: 'Easy', progress: 85, completed: '7/8', icon: '🌱', color: 'bg-green-500', bgColor: 'bg-green-50' },
//           { level: 'Medium', progress: 72, completed: '6/8', icon: '🔥', color: 'bg-orange-500', bgColor: 'bg-orange-50' },
//           { level: 'Hard', progress: 63, completed: '3/4', icon: '💎', color: 'bg-red-500', bgColor: 'bg-red-50' }
//         ]
//       },
//       // Simplified emotions data
//       emotions: [
//         { date: '2025-09-04', emotion: 'happy' },
//         { date: '2025-09-03', emotion: 'excited' },
//         { date: '2025-09-02', emotion: 'happy' },
//         { date: '2025-09-01', emotion: 'calm' },
//         { date: '2025-08-31', emotion: 'happy' },
//         { date: '2025-08-30', emotion: 'excited' },
//         { date: '2025-08-29', emotion: 'calm' }
//       ],
//       // Enhanced badges matching student page structure
//       badges: [
//         { id: 1, icon: '⭐', title: 'First Steps', description: 'Completed your first activity', status: 'EARNED', color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-50', points: 10 },
//         { id: 2, icon: '🎓', title: 'Academic Star', description: 'Completed 5 academic activities', status: 'EARNED', color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50', points: 25 },
//         { id: 3, icon: '🎨', title: 'Color Master', description: 'Awarded for completing 5 color-related activities', status: 'EARNED', color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50', points: 75 },
//         { id: 4, icon: '🔷', title: 'Shape Explorer', description: 'Awarded after finishing 5 shape activities', status: 'EARNED', color: 'from-blue-400 to-indigo-600', bgColor: 'bg-blue-50', points: 75 },
//         { id: 5, icon: '🔢', title: 'Number Ninja', description: 'Earned by correctly answering 20 number-related questions', status: 'EARNED', color: 'from-green-400 to-green-600', bgColor: 'bg-green-50', points: 100 },
//         { id: 6, icon: '📅', title: 'Consistency Champ', description: 'Given for completing activities 3 days in a row', status: 'LOCKED', color: 'from-gray-400 to-gray-500', bgColor: 'bg-gray-50', points: 0 },
//         { id: 7, icon: '🤝', title: 'Helper Badge', description: 'For activities done collaboratively with a parent/teacher', status: 'EARNED', color: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-50', points: 50 },
//         { id: 8, icon: '🏠', title: 'Daily Life Hero', description: 'Awarded for finishing 5 "Daily Life Skills" activities', status: 'LOCKED', color: 'from-gray-400 to-gray-500', bgColor: 'bg-gray-50', points: 0 }
//       ]
//     }
//   ];

//   useEffect(() => {
//     // For now, using mock data
//     setTimeout(() => {
//       setChildrenData(mockChildrenData);
//       setSelectedChild(mockChildrenData[0]); // Select first child by default
//       setLoading(false);
//     }, 1000);
//   }, []);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate('/loginpage');
//   };

//   const getEmotionIcon = (emotion) => {
//     const emotions = {
//       happy: '😊',
//       excited: '🤩',
//       calm: '😌',
//       sad: '😢',
//       angry: '😠'
//     };
//     return emotions[emotion] || '😐';
//   };

//   const getDifficultyColor = (difficulty) => {
//     const colors = {
//       Easy: 'bg-green-100 text-green-800',
//       Medium: 'bg-yellow-100 text-yellow-800',
//       Hard: 'bg-red-100 text-red-800'
//     };
//     return colors[difficulty] || 'bg-gray-100 text-gray-800';
//   };

//   if (loading) {
//     return (
//       <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="relative mb-8">
//             <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
//               <span className="text-white font-bold text-2xl">A</span>
//             </div>
//             <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
//             <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
//             <UsersIcon className="w-6 h-6 mr-2 text-indigo-600" />
//             Loading Parent Dashboard
//           </h2>
//           <div className="text-gray-600">Preparing your child's learning insights...</div>
//           <div className="mt-6">
//             <div className="flex justify-center space-x-2">
//               <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
//               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
//               <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!selectedChild) {
//     return (
//       <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
//         <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md">
//           <div className="text-6xl mb-6">📝</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">No Children Found</h2>
//           <p className="text-gray-600 mb-6">Please ensure your child has registered with your email as their parent email.</p>
//           <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
//             <h3 className="font-semibold text-blue-800 mb-2">Quick Setup Guide:</h3>
//             <ol className="text-sm text-blue-700 text-left space-y-1">
//               <li>1. Ask your child to create a student account</li>
//               <li>2. Use your email as the parent contact</li>
//               <li>3. Refresh this page to see their progress</li>
//             </ol>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
//       {/* Header with Navbar */}
//       <header className="bg-white shadow-lg border-b-4 border-blue-500">
//         <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center space-x-4">
//               <div className="bg-blue-600 text-white rounded-xl p-2">
//                 <AcademicCapIcon className="w-6 h-6" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   AutiSync Parent
//                 </h1>
//                 <p className="text-sm text-gray-600">Monitor {selectedChild?.name || 'your child'}'s progress</p>
//               </div>
//             </div>
            
//             <nav className="hidden md:flex space-x-8">
//               <button 
//                 onClick={() => setCurrentView('home')}
//                 className={`text-lg font-semibold transition-colors ${currentView === 'home' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
//               >
//                 Home
//               </button>
//               <button 
//                 onClick={() => setCurrentView('overview')}
//                 className={`text-lg font-semibold transition-colors ${currentView === 'overview' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
//               >
//                 Overview
//               </button>
//               <button 
//                 onClick={() => setCurrentView('progress')}
//                 className={`text-lg font-semibold transition-colors ${currentView === 'progress' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
//               >
//                 Progress
//               </button>
//               <button 
//                 onClick={() => setCurrentView('emotions')}
//                 className={`text-lg font-semibold transition-colors ${currentView === 'emotions' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
//               >
//                 Emotions
//               </button>
//               <button 
//                 onClick={() => setCurrentView('badges')}
//                 className={`text-lg font-semibold transition-colors ${currentView === 'badges' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
//               >
//                 Badges
//               </button>
//               <button 
//                 onClick={() => setCurrentView('tips')}
//                 className={`text-lg font-semibold transition-colors ${currentView === 'tips' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
//               >
//                 Tips
//               </button>
//             </nav>
            
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => navigate('/parent-homepage')}
//                 className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-1 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
//               >
//                 <img
//                   src="/src/assets/kidprofile1.jpg"
//                   alt="Profile"
//                   className="h-10 w-10 rounded-full object-cover"
//                 />
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-full mx-auto sm:px-6 py-4">
//         {/* Page Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
//           <div className="mb-4 md:mb-0">
//             <h1 className="text-4xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
//             <p className="text-lg text-gray-600">Monitor your child's learning journey and progress</p>
//           </div>
//         </div>

//         {/* Content based on current view */}
//         {currentView === 'home' && (
//           <div className="space-y-8">
//             {/* Home Dashboard - Overview Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               {/* Overall Accuracy */}
//               <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-violet-100 to-blue-100 rounded-2xl">
//                     <div className="text-2xl">🎯</div>
//                   </div>
//                   <span className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-1 rounded-full">ACCURACY</span>
//                 </div>
//                 <div className="text-3xl font-bold text-violet-600 mb-2">
//                   {selectedChild.progress.overallAccuracy}%
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Average accuracy across all activities
//                 </div>
//               </div>

//               {/* Activities Completed */}
//               <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
//                     <div className="text-2xl">📚</div>
//                   </div>
//                   <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">COMPLETED</span>
//                 </div>
//                 <div className="text-3xl font-bold text-green-600 mb-2">
//                   {selectedChild.progress.completedActivities}/{selectedChild.progress.totalActivities}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Activities completed
//                 </div>
//               </div>

//               {/* Completion Rate */}
//               <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl">
//                     <div className="text-2xl">📈</div>
//                   </div>
//                   <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">PROGRESS</span>
//                 </div>
//                 <div className="text-3xl font-bold text-blue-600 mb-2">
//                   {selectedChild.progress.completionRate}%
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Overall completion rate
//                 </div>
//               </div>

//               {/* Current Streak */}
//               <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl">
//                     <div className="text-2xl">🔥</div>
//                   </div>
//                   <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">STREAK</span>
//                 </div>
//                 <div className="text-3xl font-bold text-orange-600 mb-2">
//                   {selectedChild.progress.streakRecord}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Days learning streak
//                 </div>
//               </div>
//             </div>

//             {/* Quick Navigation */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <button
//                 onClick={() => setCurrentView('overview')}
//                 className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 text-left group"
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl group-hover:scale-110 transition-transform">
//                     <UserIcon className="w-6 h-6 text-blue-600" />
//                   </div>
//                   <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-800 mb-2">Your Children</h3>
//                 <p className="text-gray-600">View and manage your children's profiles and activities</p>
//               </button>

//               <button
//                 onClick={() => setCurrentView('progress')}
//                 className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 text-left group"
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl group-hover:scale-110 transition-transform">
//                     <ChartBarIcon className="w-6 h-6 text-green-600" />
//                   </div>
//                   <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-800 mb-2">Progress Tracking</h3>
//                 <p className="text-gray-600">Monitor learning progress and skill development</p>
//               </button>

//               <button
//                 onClick={() => setCurrentView('tips')}
//                 className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 text-left group"
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl group-hover:scale-110 transition-transform">
//                     <LightBulbIcon className="w-6 h-6 text-purple-600" />
//                   </div>
//                   <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-800 mb-2">Motivation Tips</h3>
//                 <p className="text-gray-600">Get guidance and tips for supporting your child</p>
//               </button>
//             </div>
//           </div>
//         )}

//         {currentView === 'overview' && (
//           <div className="space-y-8">
//             {/* Child Selector */}
//             <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
//               <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
//                 <UserIcon className="w-6 h-6 mr-3 text-blue-600" />
//                 Your Children
//               </h2>
//               <div className="grid grid-cols-1 gap-4">
//                 {mockChildrenData.map((child) => (
//                   <div
//                     key={child.id}
//                     className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
//                       selectedChild?.id === child.id
//                         ? 'border-blue-500 bg-blue-50'
//                         : 'border-gray-200 hover:border-gray-300'
//                     }`}
//                     onClick={() => setSelectedChild(child)}
//                   >
//                     <div className="flex items-center space-x-4">
//                       <img
//                         src={child.profilePicture}
//                         alt={child.name}
//                         className="w-12 h-12 rounded-full object-cover"
//                       />
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-gray-800">{child.name}</h3>
//                         <p className="text-sm text-gray-600">Age: {child.age}</p>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-lg font-bold text-blue-600">
//                           {child.progress.overallAccuracy}%
//                         </div>
//                         <div className="text-sm text-gray-600">Accuracy</div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>


//            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               {/* Overall Accuracy */}
//               <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-violet-100 to-blue-100 rounded-2xl">
//                     <div className="text-2xl">🎯</div>
//                   </div>
//                   <span className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-1 rounded-full">ACCURACY</span>
//                 </div>
//                 <div className="text-3xl font-bold text-violet-600 mb-2">
//                   {selectedChild.progress.overallAccuracy}%
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Average accuracy across all activities
//                 </div>
//               </div>

//               {/* Activities Completed */}
//               <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
//                     <div className="text-2xl">📚</div>
//                   </div>
//                   <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">COMPLETED</span>
//                 </div>
//                 <div className="text-3xl font-bold text-green-600 mb-2">
//                   {selectedChild.progress.completedActivities}/{selectedChild.progress.totalActivities}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Activities completed
//                 </div>
//               </div>

//               {/* Completion Rate */}
//               <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl">
//                     <div className="text-2xl">📈</div>
//                   </div>
//                   <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">PROGRESS</span>
//                 </div>
//                 <div className="text-3xl font-bold text-blue-600 mb-2">
//                   {selectedChild.progress.completionRate}%
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Overall completion rate
//                 </div>
//               </div>

//               {/* Current Streak */}
//               <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl">
//                     <div className="text-2xl">🔥</div>
//                   </div>
//                   <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">STREAK</span>
//                 </div>
//                 <div className="text-3xl font-bold text-orange-600 mb-2">
//                   {selectedChild.progress.streakRecord}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Days learning streak
//                 </div>
//               </div>
//             </div>


//             {/* Recent Activities */}
//             <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
//               <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//                 <ClockIcon className="w-6 h-6 mr-3 text-green-600" />
//                 Recent Activities
//               </h2>
//               <div className="space-y-4">
//                 {selectedChild.recentActivities.map((activity) => (
//                   <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
//                     <div className="flex items-center space-x-4">
//                       <div className="text-2xl">{getEmotionIcon(activity.emotion)}</div>
//                       <div>
//                         <h3 className="font-semibold text-gray-800">{activity.title}</h3>
//                         <p className="text-sm text-gray-600">{activity.category} • {activity.completedAt}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(activity.difficulty)}`}>
//                         {activity.difficulty}
//                       </span>
//                       <div className="text-right">
//                         <div className="font-bold text-green-600">{activity.score}%</div>
//                         <div className="text-sm text-gray-500">{activity.timeSpent}</div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {currentView === 'progress' && (
//           <div className="space-y-8">
//             {/* Skills Breakdown */}
//             <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
//               <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//                 <ChartBarIcon className="w-6 h-6 mr-3 text-purple-600" />
//                 Skills Breakdown
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {selectedChild.progress.skillsBreakdown.map((skill, index) => (
//                   <div key={index} className="p-4 bg-gray-50 rounded-xl">
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center space-x-2">
//                         <span className="text-xl">{skill.icon}</span>
//                         <h3 className="font-semibold text-gray-800">{skill.skill}</h3>
//                       </div>
//                       <span className="text-sm text-gray-600">{skill.activities}</span>
//                     </div>
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span>Progress</span>
//                         <span className="font-semibold">{skill.progress}%</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div
//                           className={`bg-gradient-to-r ${skill.color} h-2 rounded-full`}
//                           style={{ width: `${skill.progress}%` }}
//                         ></div>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span>Accuracy</span>
//                         <span className="font-semibold">{skill.accuracy}%</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Difficulty Progression */}
//             <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
//               <h2 className="text-2xl font-bold text-gray-800 mb-6">Difficulty Progression</h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 {selectedChild.progress.difficultyProgression.map((level, index) => (
//                   <div key={index} className={`p-6 rounded-xl ${level.bgColor}`}>
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center space-x-2">
//                         <span className="text-2xl">{level.icon}</span>
//                         <h3 className="font-bold text-gray-800">{level.level}</h3>
//                       </div>
//                       <span className="text-sm font-semibold text-gray-600">{level.completed}</span>
//                     </div>
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span>Progress</span>
//                         <span className="font-semibold">{level.progress}%</span>
//                       </div>
//                       <div className="w-full bg-white rounded-full h-3">
//                         <div
//                           className={`${level.color} h-3 rounded-full`}
//                           style={{ width: `${level.progress}%` }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {currentView === 'emotions' && (
//           <div className="space-y-8">
//             <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
//               <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//                 <HeartIcon className="w-6 h-6 mr-3 text-pink-600" />
//                 Emotion Tracking
//               </h2>
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Emotional Levels</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
//                   {selectedChild.emotions.map((emotion, index) => (
//                     <div key={index} className="text-center p-3 bg-gray-50 rounded-xl">
//                       <div className="text-2xl mb-2">{getEmotionIcon(emotion.emotion)}</div>
//                       <div className="text-xs text-gray-600">{new Date(emotion.date).toLocaleDateString()}</div>
//                       <div className="text-sm font-semibold capitalize">{emotion.emotion}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
//                 <h4 className="font-semibold text-blue-800 mb-2">Emotional Level Summary</h4>
//                 <p className="text-blue-700 text-sm">
//                   Your child shows mostly positive emotions during learning activities, with frequent happy and excited levels.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {currentView === 'badges' && (
//           <div className="space-y-8">
//             <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
//               <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//                 <TrophyIcon className="w-6 h-6 mr-3 text-yellow-600" />
//                 Achievement Badges
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {selectedChild.badges.map((badge) => (
//                   <div
//                     key={badge.id}
//                     className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
//                       badge.status === 'EARNED'
//                         ? `${badge.bgColor} border-transparent shadow-lg hover:shadow-xl transform hover:scale-105`
//                         : 'bg-gray-50 border-gray-200 opacity-60'
//                     }`}
//                   >
//                     {badge.status === 'EARNED' && (
//                       <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
//                         <CheckIcon className="w-4 h-4" />
//                       </div>
//                     )}
//                     {badge.status === 'LOCKED' && (
//                       <div className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full p-1">
//                         <LockClosedIcon className="w-4 h-4" />
//                       </div>
//                     )}
//                     <div className="text-center">
//                       <div className="text-4xl mb-4">{badge.icon}</div>
//                       <h3 className={`font-bold text-lg mb-2 ${badge.status === 'EARNED' ? 'text-gray-800' : 'text-gray-500'}`}>
//                         {badge.title}
//                       </h3>
//                       <p className={`text-sm mb-4 ${badge.status === 'EARNED' ? 'text-gray-600' : 'text-gray-400'}`}>
//                         {badge.description}
//                       </p>
//                       {badge.status === 'EARNED' && badge.points > 0 && (
//                         <div className="bg-white rounded-full px-3 py-1 inline-block">
//                           <span className="text-xs font-semibold text-gray-700">
//                             +{badge.points} points
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {currentView === 'tips' && (
//           <div className="space-y-8">
//             <MotivationTips />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ParentDashboard;
