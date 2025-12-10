import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import { 
  UserPlusIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

const AddVillageMember = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    village: user?.village || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.username || !formData.email) {
        throw new Error('Username and email are required');
      }

      // For committee members, use their own village
      const requestData = {
        ...formData,
        village: user?.village || formData.village
      };

      const response = await axiosInstance.post('/api/committee/members/add', requestData);
      
      setSuccess(response.data.message);
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        phone: '',
        village: user?.village || ''
      });
    } catch (err) {
      console.error('Error adding member:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      <div className="card-glass animate-fade-in-up">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
              <UserPlusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Add Village Member</h1>
              <p className="text-neutral-300 text-sm sm:text-base">
                Register a new member from your village
              </p>
              {user?.village && (
                <p className="text-electric-300 text-sm font-medium mt-1">
                  Village: {user.village}
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="glass-effect border border-red-500/30 bg-red-500/10 text-red-300 px-6 py-4 rounded-xl mb-6 animate-fade-in-up">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="glass-effect border border-neon-500/30 bg-neon-500/10 text-neon-300 px-6 py-4 rounded-xl mb-6 animate-fade-in-up">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-neon-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Add Member Form */}
        <div className="card-glass animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter username"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Village (readonly for committee members) */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <BuildingLibraryIcon className="w-4 h-4" />
                  <span>Village</span>
                </label>
                <input
                  type="text"
                  name="village"
                  value={user?.village || formData.village}
                  readOnly={!!user?.village}
                  onChange={handleChange}
                  className={`input-field ${user?.village ? 'bg-neutral-700/50 cursor-not-allowed' : ''}`}
                  placeholder="Enter village name"
                />
                {user?.village && (
                  <p className="text-xs text-neutral-400 mt-1">
                    Village is automatically set to your committee village
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full sm:w-auto sm:min-w-[200px] flex items-center justify-center space-x-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Adding Member...</span>
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="w-4 h-4" />
                    <span>Add Member</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div className="card-glass mt-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <h3 className="text-lg font-semibold text-white mb-3">Instructions</h3>
          <ul className="space-y-2 text-neutral-300 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-electric-400 mt-1">•</span>
              <span>Fill in the member's details to register them on the platform</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-electric-400 mt-1">•</span>
              <span>The member will receive an email with their login credentials</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-electric-400 mt-1">•</span>
              <span>You can only add members from your assigned village</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-electric-400 mt-1">•</span>
              <span>All fields except phone number are required</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddVillageMember;