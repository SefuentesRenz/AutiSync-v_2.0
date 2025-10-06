import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, PlayIcon, ClockIcon, StarIcon, EyeIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import ActivityDetailsModal from '../components/ActivityDetailsModal';
import { getActivitiesWithDetails, searchActivities } from '../lib/activitiesApi';
import { getCategories } from '../lib/categoriesApi';
import { getDifficulties } from '../lib/difficultiesApi';
import { supabase } from '../lib/supabase';

const ActivitiesPage = ({ isOpen, onClose, activity }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activityStats, setActivityStats] = useState({});

  // Fetch activities and categories on component mount
  useEffect(() => {
    fetchData();
    fetchActivityStats();
  }, []);

  const fetchActivityStatsData = async () => {
    try {
      // Get activity usage statistics
      const { data: progressData, error: progressError } = await supabase
        .from('user_activity_progress')
        .select('activity_id, score, date_completed');

      if (progressError) {
        console.error('Error fetching activity stats:', progressError);
        return {};
      }

      // Calculate stats for each activity
      const stats = {};
      progressData?.forEach(record => {
        const activityId = record.activity_id;
        if (!stats[activityId]) {
          stats[activityId] = {
            totalCompletions: 0,
            totalScore: 0,
            recentCompletions: 0,
            lastCompleted: null
          };
        }
        
        stats[activityId].totalCompletions++;
        stats[activityId].totalScore += record.score || 0;
        
        const completedDate = new Date(record.date_completed);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        if (completedDate > oneDayAgo) {
          stats[activityId].recentCompletions++;
        }
        
        if (!stats[activityId].lastCompleted || completedDate > new Date(stats[activityId].lastCompleted)) {
          stats[activityId].lastCompleted = record.date_completed;
        }
      });

      // Calculate average scores
      Object.keys(stats).forEach(activityId => {
        if (stats[activityId].totalCompletions > 0) {
          stats[activityId].averageScore = Math.round(stats[activityId].totalScore / stats[activityId].totalCompletions);
        }
      });

      return stats;
    } catch (err) {
      console.error('Error in fetchActivityStatsData:', err);
      return {};
    }
  };

  const fetchActivityStats = async () => {
    const stats = await fetchActivityStatsData();
    setActivityStats(stats);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch both activities and stats simultaneously
      const [activitiesResult, statsResult] = await Promise.all([
        getActivitiesWithDetails(),
        fetchActivityStatsData()
      ]);
      
      const { data: activitiesData, error: activitiesError } = activitiesResult;
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        setError('Failed to load activities');
      } else {
        // Transform the data to match the expected format
        const transformedActivities = activitiesData?.map(activity => {
          const stats = statsResult[activity.id] || { 
            totalCompletions: 0, 
            averageScore: 0, 
            recentCompletions: 0, 
            lastCompleted: null 
          };
          
          // Debug: Log the raw difficulty data
          console.log('Activity:', activity.title, 'Raw Difficulties:', activity.Difficulties, 'Difficulty value:', activity.Difficulties?.difficulty);
          
          return {
            id: activity.id,
            title: activity.title,
            description: activity.description,
            category: activity.Categories?.category_name || 'Unknown',
            difficulty: activity.Difficulties?.difficulty || 'Medium',
            duration: activity.duration || '10-15 min',
            participants: activity.participants || 0,
            icon: activity.icon || '📝',
            color: activity.color || 'from-blue-400 to-blue-600',
            points: activity.points || 10,
            // Usage tracking data
            totalCompletions: stats.totalCompletions,
            averageScore: stats.averageScore,
            recentCompletions: stats.recentCompletions,
            lastCompleted: stats.lastCompleted
          };
        }) || [];
        console.log('All transformed activities:', transformedActivities);
        setActivities(transformedActivities);
        setActivityStats(statsResult);
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await getCategories();
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        const transformedCategories = [
          { value: 'all', label: 'All Activities', icon: '📚' },
          ...(categoriesData?.map(cat => ({
            value: cat.category_name,
            label: cat.category_name,
            icon: cat.icon || '📖'
          })) || [])
        ];
        setCategories(transformedCategories);
      }

      // Fetch difficulties
      const { data: difficultiesData, error: difficultiesError } = await getDifficulties();
      if (difficultiesError) {
        console.error('Error fetching difficulties:', difficultiesError);
      } else {
        console.log('Difficulties from database:', difficultiesData);
        setDifficulties(difficultiesData || []);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Handle search with backend API
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const { data, error } = await searchActivities(term);
        if (error) {
          console.error('Search error:', error);
        } else {
          const transformedActivities = data?.map(activity => ({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            category: 'Academic', // You might want to join with Categories table
            difficulty: 'Medium', // You might want to join with Difficulties table
            duration: activity.duration || '10-15 min',
            participants: activity.participants || 0,
            icon: activity.icon || '�',
            color: activity.color || 'from-blue-400 to-blue-600',
            points: activity.points || 10
          })) || [];
          setActivities(transformedActivities);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    } else {
      // If search is empty, reload all activities
      fetchData();
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || activity.difficulty === selectedDifficulty;
    
    // Debug filtering
    if (selectedDifficulty !== 'all') {
      console.log('Filtering for difficulty:', selectedDifficulty, 'Activity:', activity.title, 'Activity difficulty:', activity.difficulty, 'Matches:', matchesDifficulty);
    }
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const AdminProfile = (e) => {
    e.preventDefault();
    navigate("/adminprofile");
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 max-h-screen">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white  rounded-xl">
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Learning Activities</h1>
            <p className="text-lg text-gray-600">View and track activity usage and student progress</p>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => { fetchData(); fetchActivityStats(); }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
              <div className="absolute left-4 top-3.5">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    selectedCategory === category.value
                      ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { value: 'all', label: 'All Levels', icon: '📚' },
                ...(difficulties.map(diff => ({
                  value: diff.difficulty,
                  label: diff.difficulty,
                  icon: diff.difficulty === 'Easy' ? '🟢' : diff.difficulty === 'Medium' ? '🟡' : '🔴'
                })))
              ].map((difficulty) => (
                <button
                  key={difficulty.value}
                  onClick={() => setSelectedDifficulty(difficulty.value)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    selectedDifficulty === difficulty.value
                      ? 'bg-purple-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{difficulty.icon}</span>
                  <span className="hidden sm:inline">{difficulty.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <PlayIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Activities</p>
                <p className="text-2xl font-bold text-gray-800">{activities.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Completions</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.values(activityStats).reduce((sum, stat) => sum + stat.totalCompletions, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <StarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg Score</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.values(activityStats).length > 0 
                    ? Math.round(Object.values(activityStats).reduce((sum, stat) => sum + stat.averageScore, 0) / Object.values(activityStats).length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Recent (24h)</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.values(activityStats).reduce((sum, stat) => sum + stat.recentCompletions, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading activities...</h3>
              <p className="text-gray-500">Please wait while we fetch your activities</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden"
            >
              <div className={`h-32 bg-gradient-to-r ${activity.color} flex items-center justify-center`}>
                <div className="text-6xl">{activity.icon}</div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(activity.difficulty)}`}>
                    {activity.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{activity.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-700">{activity.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium text-gray-700">{activity.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Completions:</span>
                    <span className="font-medium text-green-600">{activity.totalCompletions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Avg Score:</span>
                    <span className="font-medium text-blue-600">{activity.averageScore || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Recent (24h):</span>
                    <span className="font-medium text-purple-600">{activity.recentCompletions || 0}</span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleViewDetails(activity)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {!loading && filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No activities found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      <ActivityDetailsModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        activity={selectedActivity}
      />
    </div>
  );
};

export default ActivitiesPage;