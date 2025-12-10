import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import { 
  UserGroupIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingLibraryIcon,
  CheckBadgeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const VillagerApproval = () => {
  const { user } = useAuth();
  const [villagers, setVillagers] = useState([]);
  const [filteredVillagers, setFilteredVillagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUnapprovedVillagers();
  }, []);

  useEffect(() => {
    filterVillagers();
  }, [searchTerm, villagers]);

  const fetchUnapprovedVillagers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch unapproved villagers from the same village
      const response = await axiosInstance.get(`/api/users/unapproved`);
      setVillagers(response.data);
    } catch (err) {
      console.error('Error fetching villagers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load villagers');
    } finally {
      setLoading(false);
    }
  };

  const filterVillagers = () => {
    if (!searchTerm) {
      setFilteredVillagers(villagers);
      return;
    }

    const filtered = villagers.filter(villager => 
      villager.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      villager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (villager.phone && villager.phone.includes(searchTerm))
    );
    
    setFilteredVillagers(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const approveVillager = async (userId) => {
    try {
      setApproving(true);
      setError('');
      
      // Approve the villager
      const response = await axiosInstance.put(`/api/users/${userId}/approve`, {
        isVerified: true
      });
      
      setSuccess(response.data.message);
      
      // Remove the approved villager from the list
      setVillagers(prev => prev.filter(v => v._id !== userId));
      setFilteredVillagers(prev => prev.filter(v => v._id !== userId));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error approving villager:', err);
      setError(err.response?.data?.message || err.message || 'Failed to approve villager');
    } finally {
      setApproving(false);
    }
  };

  const rejectVillager = async (userId) => {
    try {
      setApproving(true);
      setError('');
      
      // Delete the villager (reject)
      await axiosInstance.delete(`/api/users/${userId}`);
      
      setSuccess('Villager rejected and removed from the system');
      
      // Remove the rejected villager from the list
      setVillagers(prev => prev.filter(v => v._id !== userId));
      setFilteredVillagers(prev => prev.filter(v => v._id !== userId));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error rejecting villager:', err);
      setError(err.response?.data?.message || err.message || 'Failed to reject villager');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-600/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-electric-500 animate-spin"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Loading Villagers</h3>
            <p className="text-neutral-300">Please wait while we load villagers for approval...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      <div className="card-glass animate-fade-in-up">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
                <CheckBadgeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Villager Approval</h1>
                <p className="text-neutral-300 text-sm sm:text-base">
                  Approve or reject villagers from your village
                </p>
                {user?.village && (
                  <p className="text-electric-300 text-sm font-medium mt-1">
                    Village: {user.village}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={fetchUnapprovedVillagers}
              className="btn-secondary text-sm mt-4 sm:mt-0"
            >
              Refresh List
            </button>
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

        {/* Search Bar */}
        <div className="mb-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="input-field pl-10"
              placeholder="Search by name, email, or phone..."
            />
          </div>
        </div>

        {/* Villagers List */}
        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          {filteredVillagers.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-2 text-lg font-medium text-white">No villagers to approve</h3>
              <p className="mt-1 text-neutral-300">
                {searchTerm ? 'No villagers match your search criteria.' : 'There are no villagers awaiting approval in your village.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredVillagers.map((villager) => (
                <div key={villager._id} className="card-hover p-4 sm:p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-electric rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {villager.username}
                      </h3>
                      <p className="text-sm text-electric-300 font-medium">
                        Unapproved Villager
                      </p>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-sm text-neutral-300">
                          <BuildingLibraryIcon className="flex-shrink-0 mr-2 h-4 w-4 text-neon-400" />
                          <span className="truncate">{villager.village}</span>
                        </div>
                        <div className="flex items-center text-sm text-neutral-300">
                          <EnvelopeIcon className="flex-shrink-0 mr-2 h-4 w-4 text-secondary-400" />
                          <span className="truncate">{villager.email}</span>
                        </div>
                        {villager.phone && (
                          <div className="flex items-center text-sm text-neutral-300">
                            <PhoneIcon className="flex-shrink-0 mr-2 h-4 w-4 text-sunset-400" />
                            <span className="truncate">{villager.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        <button 
                          onClick={() => approveVillager(villager._id)}
                          disabled={approving}
                          className="btn-primary text-sm flex-1 flex items-center justify-center space-x-1"
                        >
                          <CheckBadgeIcon className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => rejectVillager(villager._id)}
                          disabled={approving}
                          className="btn-danger text-sm flex-1 flex items-center justify-center space-x-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p className="text-neutral-300 text-sm">
              Showing {filteredVillagers.length} of {villagers.length} villagers awaiting approval
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillagerApproval;