import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import {
    MagnifyingGlassIcon,
    UsersIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';

const VillageMembers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVillageMembers();
    }, []);

    useEffect(() => {
        filterMembers();
    }, [searchTerm, members]);

    const fetchVillageMembers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/committee/members/village');
            setMembers(response.data);
            setFilteredMembers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching village members:', err);
            setError('Failed to load village members');
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
            (member.phone && member.phone.includes(searchTerm))
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
                            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg neon-glow">
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">My Village Members</h1>
                                <p className="text-neutral-300 text-sm sm:text-base mt-1">
                                    Manage members registered under {user?.village || 'your village'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/committee/add-member')}
                            className="btn-primary"
                        >
                            Add New Member
                        </button>
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
                            placeholder="Search by name, email, or phone..."
                        />
                    </div>
                </div>

                {/* Members List */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {filteredMembers.length === 0 ? (
                        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5">
                            <UsersIcon className="mx-auto h-16 w-16 text-neutral-500 mb-4" />
                            <h3 className="text-xl font-medium text-white mb-2">No members found</h3>
                            <p className="text-neutral-400">
                                {searchTerm ? 'No members match your search criteria.' : 'There are no members registered in your village yet.'}
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
                                                User ID: {member._id.substring(member._id.length - 6)}
                                            </p>

                                            <div className="space-y-3">
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
                                                <div className="flex items-center text-sm text-neutral-300">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${member.isVerified ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                        {member.isVerified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                </div>
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
                            Showing {filteredMembers.length} of {members.length} members
                        </p>
                        <button
                            onClick={fetchVillageMembers}
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

export default VillageMembers;
