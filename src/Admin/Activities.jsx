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
            icon: activity.icon || '📝',
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

  const formatLastCompleted = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Learning Activities</h1>
              <p className="text-gray-600 text-lg">Monitor activity usage and student engagement</p>
            </div>
            <button 
              onClick={AdminProfile}
              className="mt-4 md:mt-0 bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>👤</span>
              <span>Admin Profile</span>
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category</h3>
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
            </div>

            {/* Difficulty Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Difficulty</h3>
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
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-blue-600">{activities.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Completions</p>
                <p className="text-2xl font-bold text-green-600">
                  {activities.reduce((sum, act) => sum + (act.totalCompletions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(activities.reduce((sum, act) => sum + (act.averageScore || 0), 0) / Math.max(activities.length, 1))}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent (24h)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {activities.reduce((sum, act) => sum + (act.recentCompletions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`h-2 bg-gradient-to-r ${activity.color}`}></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{activity.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{activity.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                        {activity.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>

                {/* Usage Statistics */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Completions</span>
                    <span className="font-semibold text-blue-600">{activity.totalCompletions || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="font-semibold text-green-600">{activity.averageScore || 0}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recent (24h)</span>
                    <span className="font-semibold text-purple-600">{activity.recentCompletions || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Completed</span>
                    <span className="font-semibold text-gray-600">{formatLastCompleted(activity.lastCompleted)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{activity.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4" />
                      <span>{activity.points} pts</span>
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedActivity(activity);
                      setIsModalOpen(true);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No activities found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={selectedActivity}
        isViewOnly={true}
      />
    </div>
  );
};

export default ActivitiesPage;