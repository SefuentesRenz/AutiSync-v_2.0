import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  RocketLaunchIcon, 
  AcademicCapIcon, 
  UsersIcon, 
  ChartBarIcon,
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/solid';
import MotivationTips from '../parents/MotivationTips';

const ParentHomepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    const { supabase } = await import('../lib/supabase');
    await supabase.auth.signOut();
    navigate('/loginpage');
  };

  const goToDashboard = () => {
    navigate('/parent-dashboard');
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('key-features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AutiSync
                </h1>
                <p className="text-sm font-medium text-gray-600">Parent Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-gray-700">Welcome back,</p>
                <p className="text-lg font-bold text-indigo-600">{user?.user_metadata?.full_name || 'Parent'}</p>
              </div>
              <button
                onClick={goToDashboard}
                className="cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>View Dashboard</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <img
                  src="/src/assets/kidprofile1.jpg"
                  alt="Parent Profile"
                  className="h-12 w-12 rounded-xl object-cover border-2 border-indigo-200"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-16 pb-20">
          <div className="text-center">
            {/* Animated Hero Visual */}
            <div className="relative mb-12">
              <div className="flex justify-center items-center space-x-8 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-4xl animate-bounce shadow-lg">
                    👨‍👩‍👧‍👦
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                    <HeartIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-indigo-400 rounded-full animate-pulse"></div>
                </div>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-3xl animate-pulse shadow-lg">
                    🧠
                  </div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-0 left-1/4 w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-float opacity-70"></div>
              <div className="absolute bottom-0 right-1/4 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float-slow opacity-70"></div>
            </div>

            {/* Hero Content */}
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Empower Your Child's
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Learning Journey
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
                Join thousands of parents using AutiSync to unlock their child's potential through 
                <span className="text-indigo-600 font-bold"> personalized learning</span>, 
                <span className="text-purple-600 font-bold"> emotional insights</span>, and 
                <span className="text-pink-600 font-bold"> data-driven progress</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <button
                  onClick={goToDashboard}
                  className="cursor-pointer group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 min-w-[200px]"
                >
                  <ChartBarIcon className="w-6 h-6" />
                  <span>View Dashboard</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={scrollToFeatures}
                  className="group bg-white hover:bg-gray-50 text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 min-w-[200px]"
                >
                  <RocketLaunchIcon className="w-6 h-6" />
                  <span>Learn More</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Evidence-Based Methods</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Real-Time Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Expert Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-indigo-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white">
            <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl mb-6 inline-block group-hover:from-indigo-500 group-hover:to-indigo-600 transition-all duration-300">
              <ChartBarIcon className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Progress Dashboard</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Get real-time insights into your child's learning progress, emotional responses, and achievement milestones with comprehensive analytics.</p>
            <button
              onClick={goToDashboard}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>View Dashboard</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mb-6 inline-block group-hover:from-purple-500 group-hover:to-purple-600 transition-all duration-300">
              <LightBulbIcon className="w-10 h-10 text-purple-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Expert Strategies</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Access evidence-based parenting strategies and motivation techniques tailored specifically for supporting your child's unique learning style.</p>
            <div className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-center transition-all duration-300">
              Explore Below ↓
            </div>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-pink-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white">
            <div className="p-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl mb-6 inline-block group-hover:from-pink-500 group-hover:to-pink-600 transition-all duration-300">
              <AcademicCapIcon className="w-10 h-10 text-pink-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Learning System</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Understand how AutiSync's adaptive learning technology personalizes education to match your child's pace and preferences.</p>
            <button
              onClick={() => navigate('/parent-dashboard')}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Learn More</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Key Features Section */}
        <div id="infos" className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 mb-20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Why Parents Choose AutiSync
            </h2>
            <p className="text-xl text-indigo-100 max-w-4xl mx-auto leading-relaxed">
              Transform your child's learning experience with cutting-edge technology designed specifically for neurodivergent learners
            </p>
          </div>
          
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {[
                {
                  icon: "📊",
                  title: "Real-Time Analytics",
                  description: "Monitor learning progress with detailed insights into skill development, accuracy rates, and completion patterns",
                  color: "from-blue-500 to-indigo-500",
                  bgColor: "from-blue-50 to-indigo-50"
                },
                {
                  icon: "🧠",
                  title: "Emotional Intelligence",
                  description: "Track emotional responses and mood patterns to understand your child's learning triggers and preferences",
                  color: "from-purple-500 to-violet-500",
                  bgColor: "from-purple-50 to-violet-50"
                },
                {
                  icon: "🏆",
                  title: "Achievement System",
                  description: "Celebrate every milestone with our comprehensive badge and reward system that motivates continued learning",
                  color: "from-amber-500 to-orange-500",
                  bgColor: "from-amber-50 to-orange-50"
                },
                {
                  icon: "🎯",
                  title: "Personalized Guidance",
                  description: "Receive expert-backed strategies and tips tailored to your child's unique learning style and progress",
                  color: "from-pink-500 to-rose-500",
                  bgColor: "from-pink-50 to-rose-50"
                }
              ].map((feature, index) => (
                <div key={index} className="group text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <span className="text-4xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className={`w-full h-1 bg-gradient-to-r ${feature.color} rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Motivation Tips Section */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl border border-indigo-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-12 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
              <div className="absolute top-20 right-20 w-16 h-16 border border-white rounded-full"></div>
              <div className="absolute bottom-10 left-1/4 w-12 h-12 border border-white rounded-full"></div>
              <div className="absolute bottom-20 right-1/3 w-8 h-8 border border-white rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-center items-center mb-6">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <RocketLaunchIcon className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Expert Parenting Strategies
              </h2>
              <p className="text-xl text-indigo-100 max-w-4xl mx-auto leading-relaxed">
                Unlock your child's potential with evidence-based strategies designed by learning specialists and neurodevelopment experts
              </p>
            </div>
          </div>
          
          <div className="p-12">
            <MotivationTips />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentHomepage;
