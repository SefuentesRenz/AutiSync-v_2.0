import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, ExclamationTriangleIcon, ClockIcon, UserIcon } from '@heroicons/react/24/solid';

const AlarmingEmotions = () => {
  const navigate = useNavigate();
  const [emotions, setEmotions] = useState([]);

  // Fetch data from backend API
  useEffect(() => {
    // Mock data for development with more detailed emotion information
    const mockEmotions = [
      // Alarming emotions
      { 
        studentName: "Emma Johnson", 
        time: "2 hours ago", 
        emotion: "Angry", 
        level: 4, 
        image: "src/assets/angry.png",
        priority: "High",
        type: "alarming"
      },
      { 
        studentName: "Liam Smith", 
        time: "30 minutes ago", 
        emotion: "Sad", 
        level: 3, 
        image: "src/assets/sad.png",
        priority: "Medium",
        type: "alarming"
      },
      { 
        studentName: "Noah Wilson", 
        time: "1 hour ago", 
        emotion: "Angry", 
        level: 5, 
        image: "src/assets/angry.png",
        priority: "Critical",
        type: "alarming"
      },
      { 
        studentName: "Sophia Davis", 
        time: "45 minutes ago", 
        emotion: "Sad", 
        level: 2, 
        image: "src/assets/sad.png",
        priority: "Low",
        type: "alarming"
      },
      { 
        studentName: "Isabella Brown", 
        time: "3 hours ago", 
        emotion: "Angry", 
        level: 3, 
        image: "src/assets/angry.png",
        priority: "Medium",
        type: "alarming"
      },
      // Positive emotions
      { 
        studentName: "Mason Garcia", 
        time: "15 minutes ago", 
        emotion: "Happy", 
        level: 4, 
        image: "src/assets/happy.png",
        priority: "Positive",
        type: "positive"
      },
      { 
        studentName: "Olivia Martinez", 
        time: "25 minutes ago", 
        emotion: "Excited", 
        level: 5, 
        image: "src/assets/excited.png",
        priority: "Positive",
        type: "positive"
      },
      { 
        studentName: "Ethan Rodriguez", 
        time: "40 minutes ago", 
        emotion: "Calm", 
        level: 3, 
        image: "src/assets/calm.png",
        priority: "Positive",
        type: "positive"
      },
      { 
        studentName: "Ava Lee", 
        time: "1 hour ago", 
        emotion: "Happy", 
        level: 4, 
        image: "src/assets/happy.png",
        priority: "Positive",
        type: "positive"
      },
      { 
        studentName: "Lucas Kim", 
        time: "2 hours ago", 
        emotion: "Excited", 
        level: 3, 
        image: "src/assets/excited.png",
        priority: "Positive",
        type: "positive"
      },
      { 
        studentName: "Mia Thompson", 
        time: "50 minutes ago", 
        emotion: "Calm", 
        level: 4, 
        image: "src/assets/calm.png",
        priority: "Positive",
        type: "positive"
      },
    ];
    setEmotions(mockEmotions);
  }, []);

  const AdminProfile = (e) => {
    e.preventDefault();
    navigate("/adminprofile");
  };

  const getLevelColor = (level, type = 'alarming') => {
    if (type === 'positive') {
      if (level >= 5) return 'bg-green-500';
      if (level >= 4) return 'bg-emerald-500'; 
      if (level >= 3) return 'bg-teal-500';
      if (level >= 2) return 'bg-cyan-500';
      return 'bg-blue-400';
    }
    // Original alarming colors
    if (level >= 5) return 'bg-red-500';
    if (level >= 4) return 'bg-orange-500'; 
    if (level >= 3) return 'bg-yellow-500';
    if (level >= 2) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Positive': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getLevelEmoji = (level, emotion) => {
    if (emotion === 'Happy') return level >= 4 ? '😄' : '😊';
    if (emotion === 'Excited') return level >= 4 ? '🤩' : '😃';
    if (emotion === 'Calm') return level >= 4 ? '😌' : '🙂';
    
    // Original alarming emojis
    if (level >= 5) return '😡';
    if (level >= 4) return '😠';
    if (level >= 3) return '😔';
    if (level >= 2) return '🙁';
    return '😐';
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

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
              <h1 className="text-4xl font-bold text-gray-800">Expression Wall</h1>
            </div>
            <p className="text-lg text-gray-600">Monitor student emotional expressions and provide timely support</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-xl px-4 py-2 shadow-md border border-gray-200">
              <span className="text-sm font-medium text-gray-500">Total Emotions: </span>
              <span className="text-lg font-bold text-blue-600">{emotions.length}</span>
            </div>
            <button
              onClick={() => navigate('/tracking')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
            >
              <span>← Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-xl">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-600">
                  {emotions.filter(e => e.priority === 'Critical').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-xl">
                <ClockIcon className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent (12hrs)</p>
                <p className="text-3xl font-bold text-orange-600">
                  {emotions.filter(e => e.time.includes('hour') || e.time.includes('minutes')).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Students</p>
                <p className="text-3xl font-bold text-blue-600">
                  {new Set(emotions.map(e => e.studentName)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl">
                <span className="text-2xl">😊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Positive</p>
                <p className="text-3xl font-bold text-green-600">
                  {emotions.filter(e => e.type === 'positive').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emotions Grid - Alarming Emotions Only */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-xl">
                <span className="text-2xl">🚨</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Alarming Emotional Alerts</h2>
            </div>
            <div className="text-sm text-gray-500">
              Expressions requiring immediate attention
            </div>
          </div>

          {emotions.filter(e => e.type === 'alarming').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {emotions.filter(e => e.type === 'alarming').map((emotion, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-red-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-red-300 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {/* Priority Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(emotion.priority)}`}>
                      {emotion.priority} Priority
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{emotion.time}</span>
                  </div>

                  {/* Student Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-red-600 text-white w-12 h-12 flex items-center justify-center rounded-xl text-sm font-bold">
                      {emotion.studentName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{emotion.studentName}</h3>
                      <p className="text-sm text-gray-600">Needs Attention</p>
                    </div>
                  </div>

                  {/* Emotion Display */}
                  <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={emotion.image} 
                          alt={emotion.emotion}
                          className="w-10 h-10 object-contain"
                        />
                        <div>
                          <p className="font-bold text-gray-800">{emotion.emotion}</p>
                          <p className="text-sm text-gray-600">Level {emotion.level}/5</p>
                        </div>
                      </div>
                      <div className="text-3xl">{getLevelEmoji(emotion.level, emotion.emotion)}</div>
                    </div>
                    
                    {/* Level Indicator */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className={`${getLevelColor(emotion.level, emotion.type)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${(emotion.level / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Alerts!</h3>
              <p className="text-gray-500 text-lg">No concerning emotional expressions at this time.</p>
              <p className="text-gray-400 text-sm mt-2">All students are doing well! 🌟</p>
            </div>
          )}
        </div>

        {/* Positive Emotions Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <span className="text-2xl">😊</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Positive Student Emotions</h2>
            </div>
            <div className="text-sm text-gray-500">
              Students sharing positive feelings
            </div>
          </div>

          {emotions.filter(e => e.type === 'positive').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {emotions.filter(e => e.type === 'positive').map((emotion, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-green-300 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {/* Priority Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(emotion.priority)}`}>
                      {emotion.priority}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{emotion.time}</span>
                  </div>

                  {/* Student Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-600 text-white w-12 h-12 flex items-center justify-center rounded-xl text-sm font-bold">
                      {emotion.studentName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{emotion.studentName}</h3>
                      <p className="text-sm text-gray-600">Feeling Great!</p>
                    </div>
                  </div>

                  {/* Emotion Display */}
                  <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={emotion.image} 
                          alt={emotion.emotion}
                          className="w-10 h-10 object-contain"
                        />
                        <div>
                          <p className="font-bold text-gray-800">{emotion.emotion}</p>
                          <p className="text-sm text-gray-600">Level {emotion.level}/5</p>
                        </div>
                      </div>
                      <div className="text-3xl">{getLevelEmoji(emotion.level, emotion.emotion)}</div>
                    </div>
                    
                    {/* Level Indicator */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className={`${getLevelColor(emotion.level, emotion.type)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${(emotion.level / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Positive Emotions Yet</h3>
              <p className="text-gray-500 text-lg">Students haven't shared any positive emotions recently.</p>
              <p className="text-gray-400 text-sm mt-2">Encourage them to express their feelings! 💪</p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-2">Understanding Emotional Levels</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="bg-gray-400 h-3 rounded-full mb-2"></div>
                  <p className="font-medium">Level 1: Very Mild</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-500 h-3 rounded-full mb-2"></div>
                  <p className="font-medium">Level 2: Mild</p>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-500 h-3 rounded-full mb-2"></div>
                  <p className="font-medium">Level 3: Moderate</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-500 h-3 rounded-full mb-2"></div>
                  <p className="font-medium">Level 4: Strong</p>
                </div>
                <div className="text-center">
                  <div className="bg-red-500 h-3 rounded-full mb-2"></div>
                  <p className="font-medium">Level 5: Very Strong</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlarmingEmotions;
