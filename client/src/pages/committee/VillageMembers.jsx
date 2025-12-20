import React, { useState, useEffect } from 'react';
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
        <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
            <div className="card-glass animate-fade-in-up">
                {/* Header */}
                <div className="mb-6 sm:mb-8 animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg neon-glow">
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">My Village Members</h1>
                                <p className="text-neutral-300 text-sm sm:text-base">
                                    Manage members registered under {user?.village || 'your village'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.href = '/committee/add-member'}
                            className="btn-primary mt-4 sm:mt-0"
                        >
                            Add New Member
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

                {/* Search Bar */}
                <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
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

                {/* Members List */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {filteredMembers.length === 0 ? (
                        <div className="text-center py-12">
                            <UsersIcon className="mx-auto h-12 w-12 text-neutral-400" />
                            <h3 className="mt-2 text-lg font-medium text-white">No members found</h3>
                            <p className="mt-1 text-neutral-300">
                                {searchTerm ? 'No members match your search criteria.' : 'There are no members registered in your village yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {filteredMembers.map((member) => (
                                <div key={member._id} className="card-hover p-4 sm:p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-electric rounded-full flex items-center justify-center">
                                                <UserIcon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-white truncate">
                                                {member.username}
                                            </h3>
                                            <p className="text-sm text-electric-300 font-medium">
                                                User ID: {member._id.substring(member._id.length - 6)}
                                            </p>

                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center text-sm text-neutral-300">
                                                    <EnvelopeIcon className="flex-shrink-0 mr-2 h-4 w-4 text-secondary-400" />
                                                    <span className="truncate">{member.email}</span>
                                                </div>
                                                {member.phone && (
                                                    <div className="flex items-center text-sm text-neutral-300">
                                                        <PhoneIcon className="flex-shrink-0 mr-2 h-4 w-4 text-sunset-400" />
                                                        <span className="truncate">{member.phone}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center text-sm text-neutral-300">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${member.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
