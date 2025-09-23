import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createParent, getParentByUserId } from '../lib/parentsApi';
import { getStudents } from '../lib/studentsApi';
import { linkParentToChild } from '../lib/parentChildApi';

const LinkChildModal = ({ isOpen, onClose, onChildLinked }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username) {
      setError('Please enter the student email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Linking child with email:', formData.username);
      console.log('Parent auth user ID (UUID):', user.id);
      
      // First, find or create the parent profile in the parents table
      let parentProfile = null;
      
      // Look for existing parent profile by auth user ID
      const { data: existingParent, error: parentError } = await getParentByUserId(user.id);
        
      if (!parentError && existingParent) {
        parentProfile = existingParent;
        console.log('Found existing parent profile:', parentProfile);
      } else {
        console.log('Parent not found. Creating parent profile...');
        
        // Create new parent profile in the parents table
        const newParentData = {
          user_id: user.id, // Use the auth UUID directly
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Parent',
          email: user.email,
          phone_number: user.user_metadata?.phone || '',
          address: user.user_metadata?.address || ''
        };
        
        console.log('Attempting to create parent profile with data:', newParentData);
        
        const { data: createdParent, error: createError } = await createParent(newParentData);
          
        if (createError) {
          console.error('Error creating parent profile:', createError);
          setError('Could not create parent profile: ' + createError.message + '. Please save your parent profile first and try again.');
          setLoading(false);
          return;
        }
        
        parentProfile = createdParent[0]; // createParent returns an array
        console.log('Created new parent profile:', parentProfile);
      }
      
      if (!parentProfile) {
        setError('Parent profile not found. Please create your profile first.');
        setLoading(false);
        return;
      }
      
      // Find the student by email - first get their profile, then get their auth info
      const { data: studentProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*, auth_user_id')
        .eq('email', formData.username)
        .single();

      if (profileError) {
        console.error('Student lookup error:', profileError);
        setError('Student not found with this email address');
        setLoading(false);
        return;
      }

      console.log('Student profile found:', studentProfile);

      // We need the student's auth UUID for the relationship
      // If auth_user_id exists, use it; otherwise use a lookup method
      let studentAuthId = studentProfile.auth_user_id;
      
      if (!studentAuthId) {
        // Try to find the auth user by email
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(formData.username);
        if (authError || !authUser.user) {
          setError('Could not find student auth account. Please ensure the student has registered.');
          setLoading(false);
          return;
        }
        studentAuthId = authUser.user.id;
      }

      // Create the parent-child relationship using UUIDs for both
      const { data: relationData, error: relationError } = await linkParentToChild(
        parentProfile.user_id, // Parent auth UUID
        studentAuthId, // Student auth UUID
        user.email,
        studentProfile.email
      );

      if (relationError) {
        console.error('Error creating relationship:', relationError);
        setError('Failed to link child account: ' + relationError.message);
        if (relationError.details) {
          setError(relationError.message + ' - ' + relationError.details);
        }
        setLoading(false);
        return;
      }

      console.log('Child linked successfully:', relationData);

      // Success - call the callback
      if (onChildLinked) {
        onChildLinked({
          id: studentProfile.id,
          name: (studentProfile.first_name && studentProfile.last_name) 
            ? `${studentProfile.first_name} ${studentProfile.last_name}` 
            : studentProfile.username,
          email: studentProfile.email,
          username: studentProfile.username,
          user_id: studentProfile.user_id,
          relation_id: relationData[0]?.id
        });
      }
      
      setFormData({ username: '' });
      onClose();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('An unexpected error occurred: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 hover:scale-[1.02]">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 rounded-t-3xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <h2 className="text-2xl font-bold">Link Child Account</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <p className="text-blue-100 text-sm">Connect your child's existing student account to track their progress</p>
          </div>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center space-x-2">
                  <span className="text-lg">📧</span>
                  <span>Child's Email Address</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  placeholder="Enter your child's email address"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-400">✉️</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Make sure this matches the email your child used to sign up
              </p>
            </div>

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Linking...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>🔗</span>
                    <span>Link Child</span>
                  </span>
                )}
              </button>
            </div>
          </form>
          
          {/* Help text */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 text-lg">💡</span>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-1">Need Help?</h4>
                <p className="text-xs text-blue-600">
                  Your child must have a student account first. If they don't have one, ask them to sign up at the student portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkChildModal;