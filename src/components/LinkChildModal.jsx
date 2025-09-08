import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
      // Check if a student with this email exists
      const { data: existingStudents, error: searchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', formData.username)
        .eq('user_type', 'student');

      if (searchError) {
        throw new Error('Failed to search for student account');
      }

      if (!existingStudents || existingStudents.length === 0) {
        throw new Error('No student account found with this email');
      }

      const studentProfile = existingStudents[0];

      // Check if this student is already linked to another parent
      if (studentProfile.parent_email && studentProfile.parent_email !== user.email) {
        throw new Error('This student account is already linked to another parent');
      }

      // If already linked to this parent, no need to re-link
      if (studentProfile.parent_email === user.email) {
        onChildLinked(studentProfile);
        setFormData({ username: '' });
        return;
      }

      // Link the account to this parent
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ parent_email: user.email })
        .eq('id', studentProfile.id);

      if (updateError) {
        throw new Error('Failed to link account');
      }

      // Call the callback with the linked child data
      onChildLinked(studentProfile);
      
      // Reset form
      setFormData({ username: '' });
      
    } catch (err) {
      console.error('Error linking child account:', err);
      setError(err.message || 'Failed to link account');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ username: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Link Existing Student Account</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Student Email Address
            </label>
            <input
              type="email"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter student's email address"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Linking...' : 'Link Account'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Enter the email address used for the student account. The student account will be linked to your parent profile for monitoring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinkChildModal;
