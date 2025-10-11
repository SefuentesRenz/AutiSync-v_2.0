import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getStudentProgressStats } from '../lib/progressApi';
import { getStudentBadges } from '../lib/badgesApi';
import { getStreakStats } from '../lib/streaksApi';
import { 
  AcademicCapIcon, 
  UsersIcon, 
  StarIcon, 
  HeartIcon, 
  TrophyIcon, 
  LightBulbIcon,
  HomeIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FireIcon,
  CheckIcon,
  LockClosedIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';
import SystemInformation from './SystemInformation';
import MotivationTips from './MotivationTips';
import ParentProfileModal from '../components/ParentProfileModal';
import LinkChildModal from '../components/LinkChildModal';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [showLinkChild, setShowLinkChild] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [childEmotions, setChildEmotions] = useState([]);
  const [loadingEmotions, setLoadingEmotions] = useState(false);
  const [childProgress, setChildProgress] = useState(null);
  const [childBadges, setChildBadges] = useState([]);
  const [childStreak, setChildStreak] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Load children data when component mounts
  useEffect(() => {
    if (user?.id) {
      loadChildrenData();
    }
  }, [user?.id]);

  // Load emotions when selected child changes
  useEffect(() => {
    if (selectedChild?.user_id && currentView === 'emotions') {
      loadChildEmotions(selectedChild.user_id);
    }
    if (selectedChild?.user_id && currentView === 'overview') {
      loadChildProgressData(selectedChild.user_id);
    }
  }, [selectedChild, currentView]);

  const loadChildrenData = async () => {
    try {
      setLoading(true);
      console.log('ParentDashboard: Loading children for parent user_id:', user?.id);
      
      // Get children linked to this parent - using manual join
      const { data: relations, error: relationsError } = await supabase
        .from('parent_child_relations')
        .select('*')
        .eq('parent_user_id', user.id);

      console.log('ParentDashboard: Relations query result:', { relations, relationsError });

      if (relationsError) {
        console.error('ParentDashboard: Error loading relations:', relationsError);
        setChildrenData([]);
        return;
      }

      if (!relations || relations.length === 0) {
        console.log('ParentDashboard: No relations found');
        setChildrenData([]);
        return;
      }

      // Get user profiles for each child
      const childUserIds = relations.map(rel => rel.child_user_id);
      const { data: childProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', childUserIds);

      console.log('ParentDashboard: Child profiles result:', { childProfiles, profilesError });
      
      if (profilesError) {
        console.error('ParentDashboard: Error loading child profiles:', profilesError);
        setChildrenData([]);
        return;
      }

      if (childProfiles && childProfiles.length > 0) {
        // Combine relations with profiles
        const transformedData = relations.map(relation => {
          const childProfile = childProfiles.find(profile => profile.user_id === relation.child_user_id);
          if (!childProfile) return null;
          
          return {
            id: childProfile.user_id,
            user_id: childProfile.user_id,
            full_name: `${childProfile.first_name || ''} ${childProfile.last_name || ''}`.trim() || childProfile.username,
            username: childProfile.username,
            age: childProfile.age,
            email: childProfile.email,
            grade: childProfile.grade,
            gender: childProfile.gender,
            profile_picture: childProfile.profile_picture || "/src/assets/kidprofile1.jpg",
            relation_id: relation.id,
            linked_at: relation.linked_at
          };
        }).filter(Boolean);
        
        console.log('ParentDashboard: Transformed children data:', transformedData);
        setChildrenData(transformedData);
        if (transformedData.length > 0) {
          setSelectedChild(transformedData[0]);
        }
      } else {
        console.log('ParentDashboard: No child profiles found');
        setChildrenData([]);
      }
    } catch (error) {
      console.error('Error loading children data:', error);
      setChildrenData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadChildEmotions = async (childUserId) => {
    try {
      setLoadingEmotions(true);
      console.log('ParentDashboard: Loading emotions for child user_id:', childUserId);
      // Get the child's profile_id from user_profiles
      const { data: childProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', childUserId)
        .single();

      console.log('ParentDashboard: Child profile lookup result:', { childProfile, profileError });

      if (profileError || !childProfile) {
        console.error('ParentDashboard: Error loading child profile:', profileError);
        setChildEmotions([]);
        setLoadingEmotions(false);
        return;
      }

      // Get emotions from Expressions table for this child profile
      // First find student record that matches this child's profile
      const { data: studentRecord, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', childProfile.id)
        .single();

      console.log('ParentDashboard: Student record lookup:', { studentRecord, studentError });

      if (studentError || !studentRecord) {
        console.log('ParentDashboard: No student record found, checking Expressions with profile_id...');
        // Try using profile_id directly in case Expressions table uses profile_id instead of student_id
        const { data: directEmotions, error: directError } = await supabase
          .from('Expressions')
          .select('*')
          .eq('profile_id', childProfile.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (directError) {
          console.error('ParentDashboard: Error loading emotions with profile_id:', directError);
          setChildEmotions([]);
          return;
        }

        const transformedEmotions = directEmotions?.map(expr => ({
          ...expr,
          emotion_name: expr.emotion?.charAt(0).toUpperCase() + expr.emotion?.slice(1) || 'Unknown',
          emotion_description: expr.note || '',
          time: expr.created_at
        })) || [];

        console.log('ParentDashboard: Direct emotions found:', transformedEmotions);
        console.log('ParentDashboard: Sample emotion data:', directEmotions?.[0]);
        setChildEmotions(transformedEmotions);
        return;
      }

      // Get emotions using student_id
      const { data: emotions, error } = await supabase
        .from('Expressions')
        .select('*')
        .eq('student_id', studentRecord.id)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('ParentDashboard: Expressions query result:', { emotions, error });

      if (error) {
        console.error('ParentDashboard: Error loading child emotions:', error);
        setChildEmotions([]);
        return;
      }

      // Transform the data to match expected format
      const transformedEmotions = emotions?.map(expr => ({
        ...expr,
        emotion_name: expr.emotion?.charAt(0).toUpperCase() + expr.emotion?.slice(1) || 'Unknown',
        emotion_description: expr.note || '',
        time: expr.created_at
      })) || [];

      console.log('ParentDashboard: Transformed emotions:', transformedEmotions);
      console.log('ParentDashboard: Sample emotion data:', emotions?.[0]);
      setChildEmotions(transformedEmotions);
    } catch (error) {
      console.error('ParentDashboard: Error fetching child emotions:', error);
      setChildEmotions([]);
    } finally {
      setLoadingEmotions(false);
    }
  };

  const loadChildProgressData = async (childUserId) => {
    try {
      setLoadingProgress(true);
      console.log('ParentDashboard: Loading progress data for child:', childUserId);

      // Get child's profile_id from user_profiles
      const { data: childProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, user_id')
        .eq('user_id', childUserId)
        .single();

      if (profileError || !childProfile) {
        console.error('ParentDashboard: Error loading child profile for progress:', profileError);
        setChildProgress(null);
        setChildBadges([]);
        setChildStreak(null);
        setLoadingProgress(false);
        return;
      }

      const studentProfileId = childProfile.id;
      console.log('ParentDashboard: Profile found - profile.id:', studentProfileId, 'profile.user_id:', childProfile.user_id);

      // Load progress summary (try with profile.id first as it matches your test data)
      const { data: progressData, error: progressError } = await getStudentProgressStats(studentProfileId);
      if (progressError) {
        console.error('Error loading progress summary:', progressError);
      } else {
        console.log('ParentDashboard: Progress data received:', progressData);
        setChildProgress(progressData);
      }

      // Load badges (uses auth user_id)
      const { data: badgesData, error: badgesError } = await getStudentBadges(childUserId);
      if (badgesError) {
        console.error('Error loading badges:', badgesError);
        setChildBadges([]); // Set empty array instead of leaving undefined
      } else {
        setChildBadges(badgesData || []);
      }

      // Load streak (uses auth user_id)
      const { data: streakData, error: streakError } = await getStreakStats(childUserId);
      if (streakError) {
        console.error('Error loading streak:', streakError);
        setChildStreak({ currentStreak: 0, longestStreak: 0 }); // Set default values instead of null
      } else {
        setChildStreak(streakData);
      }

    } catch (error) {
      console.error('ParentDashboard: Error loading child progress data:', error);
      setChildProgress(null);
      setChildBadges([]);
      setChildStreak({ currentStreak: 0, longestStreak: 0 });
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    // Clear emotions when switching children
    setChildEmotions([]);
  };

  const handleChildLinked = (linkedChild) => {
    setShowLinkChild(false);
    loadChildrenData(); // Refresh children list
  };

  const getEmotionIcon = (emotionName) => {
    const emotions = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      excited: '🤩',
      calm: '😌',
      anxious: '😰',
      confused: '😕'
    };
    // Convert to lowercase to match the keys
    const lowerEmotionName = emotionName?.toLowerCase();
    return emotions[lowerEmotionName] || '😐';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Dashboard...</h2>
          <p className="text-gray-600">Preparing your child's learning insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutiSync Dashboard
                </h1>
              </div>
              
              {/* Child Selector - Show only if multiple children */}
              {childrenData.length > 1 && (
                <div className="ml-6">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Viewing Child:
                  </label>
                  <select
                    value={selectedChild?.id || ''}
                    onChange={(e) => {
                      const child = childrenData.find(c => c.id === e.target.value);
                      handleChildSelect(child);
                    }}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {childrenData.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.full_name || child.username} ({child.age ? `Age ${child.age}` : 'Student'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* Navigation Bar - EXACT ORDER: Overview, Children, Emotions, Badges, Tips */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setCurrentView('overview')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'overview' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setCurrentView('children')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'children' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Children
              </button>
              <button 
                onClick={() => setCurrentView('emotions')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'emotions' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Emotions
              </button>
              <button 
                onClick={() => setCurrentView('badges')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'badges' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Badges
              </button>
              <button 
                onClick={() => setCurrentView('tips')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'tips' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Tips
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-gradient-to-r cursor-pointer from-blue-500 to-purple-600 text-white p-1 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
            <p className="text-lg text-gray-600">
              {selectedChild ? 
                `Monitoring ${selectedChild.full_name || selectedChild.username}'s learning journey` : 
                'Monitor your child\'s learning journey and progress'
              }
            </p>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['overview', 'children', 'emotions', 'badges', 'tips'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`text-lg font-semibold cursor-pointer transition-colors whitespace-nowrap px-4 py-2 rounded-lg ${
                  currentView === view ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        
        {/* Overview Section - REAL DATA */}
        {currentView === 'overview' && (
          <div className="space-y-8">
            {loadingProgress ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading progress data...</p>
              </div>
            ) : selectedChild ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Overall Accuracy */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-violet-100 to-blue-100 rounded-2xl">
                        <div className="text-2xl">🎯</div>
                      </div>
                      <span className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-1 rounded-full">ACCURACY</span>
                    </div>
                    <div className="text-3xl font-bold text-violet-600 mb-2">
                      {childProgress?.averageScore ? `${childProgress.averageScore}%` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Average score across all activities</div>
                  </div>

                  {/* Activities Completed */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                        <div className="text-2xl">📚</div>
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">COMPLETED</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {childProgress ? `${childProgress.completedActivities}/${childProgress.totalActivities}` : '0/0'}
                    </div>
                    <div className="text-sm text-gray-600">Activities completed ({childProgress?.completionRate || 0}%)</div>
                  </div>

                  {/* Current Streak */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl">
                        <div className="text-2xl">{childStreak?.streakEmoji || '🔥'}</div>
                      </div>
                      <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">STREAK</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {childStreak?.currentStreak || 0}
                    </div>
                    <div className="text-sm text-gray-600">Days in a row</div>
                  </div>

                  {/* Badges Earned */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl">
                        <div className="text-2xl">🏆</div>
                      </div>
                      <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">BADGES</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {childBadges?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Badges earned</div>
                  </div>
                </div>

                {/* Progress by Category */}
                {childProgress?.categoryStats && Object.keys(childProgress.categoryStats).length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Progress by Category</h3>
                    <div className="space-y-4">
                      {Object.entries(childProgress.categoryStats).map(([categoryName, stats]) => (
                        <div key={categoryName} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{categoryName.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{categoryName}</div>
                              <div className="text-sm text-gray-500">{stats.completed}/{stats.total} activities</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {stats.completed > 0 ? Math.round((stats.totalScore / stats.completed) * 100) / 100 : 0}%
                            </div>
                            <div className="text-sm text-gray-500">Avg Score</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Please select a child to view their progress</div>
              </div>
            )}
          </div>
        )}

        {/* Children Section - REAL DATA */}
        {currentView === 'children' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <UsersIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Linked Children
                </h2>
                <button
                  onClick={() => setShowLinkChild(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                  <span>+ Link Child</span>
                </button>
              </div>

              {childrenData.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Children Linked Yet</h3>
                  <p className="text-gray-500 mb-4">Start by linking your child's account to monitor their progress.</p>
                  <button
                    onClick={() => setShowLinkChild(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Link Child Account
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {childrenData.map((child) => (
                    <div 
                      key={child.id} 
                      className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 cursor-pointer ${
                        selectedChild?.id === child.id 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-100 hover:border-blue-300'
                      }`}
                      onClick={() => handleChildSelect(child)}
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={child.profile_picture}
                          alt={child.full_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{child.full_name}</h3>
                          <p className="text-sm text-gray-500">@{child.username} • Age {child.age}</p>
                        </div>
                        {selectedChild?.id === child.id && (
                          <CheckIcon className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Grade:</span>
                          <span className="font-medium">{child.grade || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-xs">{child.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Linked:</span>
                          <span className="font-medium">
                            {child.linked_at ? new Date(child.linked_at).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emotions Section - REAL DATA */}
        {currentView === 'emotions' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <HeartIcon className="w-6 h-6 mr-3 text-pink-600" />
                Emotion Tracking
                {selectedChild && (
                  <span className="ml-3 text-lg text-gray-600">
                    - {selectedChild.full_name || selectedChild.username}
                  </span>
                )}
              </h2>
              
              {!selectedChild ? (
                <div className="text-center py-12">
                  <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Child Selected</h3>
                  <p className="text-gray-500">Please select a child from the Children section to view their emotional data.</p>
                </div>
              ) : loadingEmotions ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading emotional data...</p>
                </div>
              ) : childEmotions.length === 0 ? (
                <div className="text-center py-12">
                  <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Emotional Data Yet</h3>
                  <p className="text-gray-500">
                    {selectedChild.full_name || selectedChild.username} hasn't recorded any emotions yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {childEmotions.map((emotion, index) => (
                    <div key={emotion.entry_id || index} className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">
                            {getEmotionIcon(emotion.emotion_name)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 capitalize">
                              {emotion.emotion_name || 'Unknown'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(emotion.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-blue-600 font-semibold">
                              {selectedChild.username}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            Level {emotion.intensity || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Badges Section - STATIC DATA (DO NOT CHANGE) */}
        {currentView === 'badges' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <TrophyIcon className="w-6 h-6 mr-3 text-yellow-600" />
                Achievement Badges
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🏆</div>
                    <h3 className="font-bold text-gray-800 mb-2">First Achievement</h3>
                    <p className="text-sm text-gray-600">Completed first learning activity</p>
                    <div className="mt-3 text-xs text-yellow-600 font-semibold">EARNED</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="text-center">
                    <div className="text-4xl mb-3">⭐</div>
                    <h3 className="font-bold text-gray-800 mb-2">Star Student</h3>
                    <p className="text-sm text-gray-600">Maintained 90% accuracy for a week</p>
                    <div className="mt-3 text-xs text-blue-600 font-semibold">EARNED</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🔥</div>
                    <h3 className="font-bold text-gray-800 mb-2">On Fire</h3>
                    <p className="text-sm text-gray-600">10-day learning streak</p>
                    <div className="mt-3 text-xs text-green-600 font-semibold">EARNED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {currentView === 'tips' && (
          <div className="space-y-8">
            <MotivationTips />
          </div>
        )}
      </div>

      {/* Modals */}
      <LinkChildModal 
        isOpen={showLinkChild}
        onClose={() => setShowLinkChild(false)}
        onChildLinked={handleChildLinked}
      />
      
      <ParentProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default ParentDashboard;
