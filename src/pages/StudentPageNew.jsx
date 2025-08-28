import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const StudentPage = () => {
  const navigate = useNavigate();
  const [streakDays, setStreakDays] = useState(4);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const flashcardspage = (e) => {
    e.preventDefault();
    navigate("/flashcardspage");
  };

  const goToProfile = () => {
    navigate('/studentprofile');
  };

  const motivationalMessages = [
    "You're amazing! 🌟",
    "Keep going! 🚀",
    "You're doing great! 💪",
    "You're a star! ⭐",
    "Super job! 🎉"
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
      icon: '🦋',
      title: 'Social Butterfly',
      description: 'Mastered social interactions',
      status: 'EARNED',
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      animation: 'animate-float'
    },
    {
      icon: '🏆',
      title: 'Perfect Week',
      description: 'Complete activities 7 days in a row',
      status: 'LOCKED',
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50',
      animation: ''
    },
    {
      icon: '👂',
      title: 'Communication Champion',
      description: 'Improved communication skills',
      status: 'EARNED',
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      animation: 'animate-wiggle'
    },
    {
      icon: '🧩',
      title: 'Puzzle Master',
      description: 'Completed cognitive activities',
      status: 'EARNED',
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50',
      animation: 'animate-bounce-gentle'
    },
    {
      icon: '🖌️',
      title: 'Creative Artist',
      description: 'Engaged in creative arts',
      status: 'EARNED',
      color: 'from-teal-400 to-teal-600',
      bgColor: 'bg-teal-50',
      animation: 'animate-float-delayed'
    },
    {
      icon: '🎵',
      title: 'Rhythm Master',
      description: 'Completed music activities',
      status: 'LOCKED',
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50',
      animation: ''
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-32 w-48 h-48 bg-purple-200/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-32 h-32 bg-pink-200/20 rounded-full blur-xl animate-bounce-gentle"></div>
      </div>

      {/* Modern Header */}
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
              <a href="/studentpage" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                <span className="mr-2">🏠</span>Home
              </a>
              <a href="/flashcardspage" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                <span className="mr-2">🎯</span>Activity
              </a>
              <a href="/home" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                <span className="mr-2">😊</span>Expression
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 font-medium">
                {currentTime.toLocaleTimeString()}
              </div>
              <div 
                onClick={goToProfile}
                className="cursor-pointer group flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-2 hover:shadow-lg transition-all duration-300"
              >
                <img
                  src="/src/assets/kidprofile1.jpg"
                  alt="Profile"
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
                <span className="hidden sm:block text-sm font-semibold text-gray-700">Chris</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Section */}
      <div className="relative z-10 h-48 sm:h-64 overflow-hidden">
        <img
          src="/src/assets/banner.jpg"
          alt="Learning Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="absolute bottom-4 left-6 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready for Today's Adventure? 🚀</h2>
          <p className="text-lg opacity-90">{motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}</p>
        </div>
      </div>

      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Welcome & Streak Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Welcome Card */}
            <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3 animate-wiggle">👋</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Welcome,</h2>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Chris!
                  </h1>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                These are all your rewards and achievements! You're doing amazing work! 🌟
              </p>
              <div className="mt-4 flex space-x-2">
                {[1,2,3,4,5].map(star => (
                  <span key={star} className="text-2xl animate-bounce-gentle" style={{animationDelay: `${star * 0.1}s`}}>
                    ⭐
                  </span>
                ))}
              </div>
            </div>

            {/* Streak Card */}
            <div className="card-autism-friendly bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 shadow-2xl border-2 border-orange-200/50 relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-4xl font-bold text-orange-600">
                      {streakDays}
                    </span>
                    <span className="text-xl font-bold text-gray-800 ml-2">
                      day Streak!
                    </span>
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                    <span className="text-3xl">🔥</span>
                  </div>
                </div>
                <p className="text-gray-600 font-medium">
                  You're doing Great, Keep Going! 💪
                </p>
                
                {/* Progress bar */}
                <div className="mt-4 w-full bg-orange-200/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full animate-progress-fill"
                    style={{width: `${(streakDays / 7) * 100}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{streakDays}/7 days to Perfect Week badge!</p>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="lg:col-span-2">
            <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <span className="text-4xl mr-3 animate-float">🏆</span>
                    Your Amazing Badges
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Collect badges by completing fun activities!
                  </p>
                </div>
                <button 
                  onClick={flashcardspage} 
                  className="btn-autism-friendly bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
                >
                  <span className="mr-2">🎯</span>
                  Collect More Badges!
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

              {/* Progress summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800">Progress Summary</h4>
                    <p className="text-sm text-gray-600">
                      You've earned {badges.filter(b => b.status === 'EARNED').length} out of {badges.length} badges!
                    </p>
                  </div>
                  <div className="text-3xl animate-bounce-gentle">
                    🎉
                  </div>
                </div>
                <div className="mt-2 w-full bg-blue-200/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-progress-fill"
                    style={{width: `${(badges.filter(b => b.status === 'EARNED').length / badges.length) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-20">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4">
            <div className="flex justify-around">
              <a href="/studentpage" className="flex flex-col items-center p-2 text-blue-600">
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentPage;
