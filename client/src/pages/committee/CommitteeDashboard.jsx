import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import {
  UsersIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  UserPlusIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const CommitteeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingBookings: 0,
    upcomingEvents: 0,
    totalEvents: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/committee/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
                <BuildingLibraryIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Committee Dashboard</h1>
                <p className="text-neutral-300 text-sm sm:text-base">
                  Welcome, {user?.username}! Manage your village members and events.
                </p>
                {user?.village && (
                  <p className="text-electric-300 text-sm font-medium mt-1">
                    Village: {user.village}
                  </p>
                )}
              </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Total Members */}
          <div className="card-hover p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-neon opacity-20 rounded-bl-3xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-300 text-sm sm:text-base">Total Members</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.totalMembers}</h3>
              </div>
              <div className="w-12 h-12 bg-neon-500/20 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-neon-400" />
              </div>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="card-hover p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-secondary opacity-20 rounded-bl-3xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-300 text-sm sm:text-base">Pending Bookings</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.pendingBookings}</h3>
              </div>
              <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-secondary-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Add Member Card */}
          <div className="card-glass">
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
                  <UserPlusIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">Add New Member</h3>
              </div>
              <p className="text-neutral-300 mb-4">
                Register a new member from your village to the community platform.
              </p>
              <button
                onClick={() => window.location.href = '/committee/add-member'}
                className="btn-primary w-full"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeDashboard;