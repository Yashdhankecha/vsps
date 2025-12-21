import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import {
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const CommitteeMembersList = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCommitteeMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, members]);

  const fetchCommitteeMembers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/committee/members');
      setMembers(response.data);
      setFilteredMembers(response.data); // Initialize filteredMembers with all members
      setError(null);
    } catch (err) {
      console.error('Error fetching committee members:', err);
      setError('Failed to load committee members');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    if (!searchTerm) {
      setFilteredMembers(members);
      return;
    }

    const filtered = members.filter(member =>
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.village && member.village.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredMembers(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
      <div className="card-glass animate-fade-in-up max-w-7xl mx-auto p-6 sm:p-10">
        {/* Header */}
        <div className="mb-8 sm:mb-10 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-electric rounded-2xl flex items-center justify-center shadow-lg neon-glow">
                <MagnifyingGlassIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Committee Members</h1>
                <p className="text-neutral-300 trace-wide text-sm sm:text-base mt-1">
                  Search and view committee members from different villages
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="glass-effect border border-red-500/30 bg-red-500/10 text-red-300 px-6 py-4 rounded-xl mb-8 animate-fade-in-up shadow-lg">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="input-field pl-12 py-3 w-full bg-black/20 focus:bg-black/30 transition-all duration-300 rounded-xl border-white/10 focus:border-electric-500/50"
              placeholder="Search by name, email, or village..."
            />
          </div>
        </div>

        {/* Members List */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5">
              <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-neutral-500 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No committee members found</h3>
              <p className="text-neutral-400">
                {searchTerm ? 'No members match your search criteria.' : 'There are no committee members to display.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <div key={member._id} className="group relative bg-black/20 hover:bg-black/40 border border-white/5 hover:border-electric-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-neon-glow hover:-translate-y-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-electric-600 to-electric-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UserIcon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-electric-300 transition-colors">
                        {member.username}
                      </h3>
                      <p className="text-sm text-electric-300 font-medium mb-4">
                        {member.role === 'committeemember' ? 'Committee Member' : member.role}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-neutral-300 bg-white/5 p-2 rounded-lg">
                          <BuildingLibraryIcon className="flex-shrink-0 mr-3 h-4 w-4 text-neon-400" />
                          <span className="truncate font-medium">{member.village || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm text-neutral-300 bg-white/5 p-2 rounded-lg">
                          <EnvelopeIcon className="flex-shrink-0 mr-3 h-4 w-4 text-secondary-400" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center text-sm text-neutral-300 bg-white/5 p-2 rounded-lg">
                            <PhoneIcon className="flex-shrink-0 mr-3 h-4 w-4 text-sunset-400" />
                            <span className="truncate">{member.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-white/5 flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/10">
                          Contact
                        </button>
                        <button className="flex-1 px-4 py-2 bg-gradient-electric text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all shadow-md">
                          Details
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
        <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p className="text-neutral-300 text-sm">
              Showing {filteredMembers.length} of {members.length} committee members
            </p>
            <button
              onClick={fetchCommitteeMembers}
              className="btn-secondary text-sm mt-2 sm:mt-0"
            >
              Refresh List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeMembersList;