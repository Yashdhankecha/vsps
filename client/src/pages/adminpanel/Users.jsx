
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationCircleIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  TrashIcon,
  PencilIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: '',
    isVerified: false
  });
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and filters - with safety check
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'verified' && user.isVerified) ||
                         (filterStatus === 'pending' && !user.isVerified);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get user statistics - with safety check
  const userStats = {
    total: (users || []).length,
    verified: (users || []).filter(u => u.isVerified).length,
    pending: (users || []).filter(u => !u.isVerified).length,
    admins: (users || []).filter(u => u.role === 'admin').length,
    committee: (users || []).filter(u => u.role === 'committee').length,
    regularUsers: (users || []).filter(u => u.role === 'user').length
  };

  // Function to show notification with modern styling
  const showNotification = (message, type = 'error', action = null, actionLabel = '') => {
    const id = Date.now().toString();
    
    setNotifications(prev => [
      ...prev,
      {
        id,
        message,
        type,
        action,
        actionLabel
      }
    ]);
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      closeNotification(id);
    }, 5000);
  };
  
  // Function to close notification
  const closeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Function to export users data
  const exportUsers = () => {
    const csvContent = [
      ['Username', 'Email', 'Role', 'Status', 'Join Date'],
      ...filteredUsers.map(user => [
        user.username,
        user.email,
        user.role,
        user.isVerified ? 'Verified' : 'Pending',
        new Date(user.createdAt || Date.now()).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Users data exported successfully', 'success');
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axiosInstance.get('/api/users/all');
      
      // Ensure response.data is an array
      const userData = Array.isArray(response.data) ? response.data : [];
      setUsers(userData);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response && error.response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        navigate('/auth');
      } else {
        setError(error.response?.data?.message || 'Failed to load users. Please try again later.');
        setUsers([]); // Ensure users is always an array
      }
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Authentication token not found', 'error');
        return;
      }

      await axiosInstance.delete(`/api/users/${userId}`);

      // If we get here, the request was successful
      setUsers(prevUsers => (prevUsers || []).filter(user => user._id !== userId));
      showNotification(
        'User deleted successfully', 
        'success', 
        () => fetchUsers(), 
        'Refresh List'
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification(
        error.response?.data?.message || error.message || 'Failed to delete user', 
        'error',
        () => fetchUsers(),
        'Try Again'
      );
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Authentication token not found', 'error');
        return;
      }

      const response = await axiosInstance.put(`/api/users/${editingUser._id}`, editForm);

      // Axios automatically throws an error for non-2xx responses
      // If we get here, the request was successful
      const data = response.data;

      setUsers(prevUsers => (prevUsers || []).map(user => 
        user._id === editingUser._id ? data.user : user
      ));
      setEditingUser(null);
      showNotification(
        `User ${editForm.role === 'committee' ? 'promoted to Committee Member' : 'updated'} successfully`, 
        'success', 
        () => fetchUsers(), 
        'Refresh Users'
      );
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification(
        error.response?.data?.message || error.message || 'Failed to update user', 
        'error',
        () => setEditingUser(null),
        'Close Form'
      );
    }
  };

  const promoteToCommittee = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to Committee Member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Authentication token not found', 'error');
        return;
      }

      await axiosInstance.put(`/api/users/${userId}`, { role: 'committee' });

      setUsers(prevUsers => (prevUsers || []).map(user => 
        user._id === userId ? { ...user, role: 'committee' } : user
      ));
      showNotification(
        'User promoted to Committee Member successfully', 
        'success', 
        () => fetchUsers(), 
        'Refresh List'
      );
    } catch (error) {
      console.error('Error promoting user:', error);
      showNotification(
        error.response?.data?.message || error.message || 'Failed to promote user', 
        'error',
        () => fetchUsers(),
        'Try Again'
      );
    }
  };

  const demoteFromCommittee = async (userId) => {
    if (!window.confirm('Are you sure you want to demote this Committee Member to regular user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Authentication token not found', 'error');
        return;
      }

      await axiosInstance.put(`/api/users/${userId}`, { role: 'user' });

      setUsers(prevUsers => (prevUsers || []).map(user => 
        user._id === userId ? { ...user, role: 'user' } : user
      ));
      showNotification(
        'Committee Member demoted to regular user successfully', 
        'success', 
        () => fetchUsers(), 
        'Refresh List'
      );
    } catch (error) {
      console.error('Error demoting user:', error);
      showNotification(
        error.response?.data?.message || error.message || 'Failed to demote user', 
        'error',
        () => fetchUsers(),
        'Try Again'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-600/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-electric-500 animate-spin"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Loading Users</h3>
            <p className="text-neutral-300">Please wait while we fetch the user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <div className="max-w-md w-full">
          <div className="glass-effect p-8 text-center animate-fade-in-up border border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <XCircleIconSolid className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Users</h3>
            <p className="text-neutral-300 mb-6">{error}</p>
            <button
              onClick={fetchUsers}
              className="btn-primary w-full"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-6">
      {/* Modern Notifications */}
      <div className="fixed top-6 right-6 z-50 space-y-3">
        {notifications.map((notification) => {
          const iconMap = {
            success: CheckCircleIconSolid,
            error: XCircleIconSolid,
            warning: ExclamationTriangleIconSolid
          };
          
          const Icon = iconMap[notification.type] || ExclamationTriangleIconSolid;
          
          return (
            <div 
              key={notification.id}
              className={`notification max-w-sm p-4 animate-slide-left ${
                notification.type === 'success' ? 'notification-success' :
                notification.type === 'error' ? 'notification-error' :
                'notification-warning'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  notification.type === 'success' ? 'bg-accent-100' :
                  notification.type === 'error' ? 'bg-red-100' :
                  'bg-secondary-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    notification.type === 'success' ? 'text-accent-600' :
                    notification.type === 'error' ? 'text-red-600' :
                    'text-secondary-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notification.message}</p>
                  {notification.action && notification.actionLabel && (
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          notification.action();
                          closeNotification(notification.id);
                        }}
                        className={`text-xs font-medium px-3 py-1 rounded-md ${
                          notification.type === 'success' ? 'bg-accent-600 hover:bg-accent-700 text-white' :
                          notification.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                          'bg-secondary-600 hover:bg-secondary-700 text-white'
                        } transition-colors duration-200`}
                      >
                        {notification.actionLabel === 'Refresh List' || notification.actionLabel === 'Refresh Users' ? (
                          <>
                            <ArrowPathIcon className="w-3 h-3 mr-1 inline" />
                            {notification.actionLabel}
                          </>
                        ) : (
                          notification.actionLabel
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => closeNotification(notification.id)}
                  className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Header Section */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">User Management</h1>
            </div>
            <p className="text-neutral-300 text-lg">Manage users, roles, and permissions across your platform</p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-3">
            <button
              onClick={exportUsers}
              className="btn-secondary flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <div className="card-hover p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-electric opacity-20 rounded-bl-3xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-white">{userStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-electric-500/20 rounded-xl flex items-center justify-center border border-electric-500/30">
              <UserIcon className="w-6 h-6 text-electric-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingUpIcon className="w-4 h-4 text-neon-400 mr-1" />
            <span className="text-neon-400 font-medium">+12%</span>
            <span className="text-neutral-400 ml-1">from last month</span>
          </div>
        </div>

        <div className="card-hover p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-neon opacity-20 rounded-bl-3xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Verified Users</p>
              <p className="text-3xl font-bold text-white">{userStats.verified}</p>
            </div>
            <div className="w-12 h-12 bg-neon-500/20 rounded-xl flex items-center justify-center border border-neon-500/30">
              <CheckCircleIcon className="w-6 h-6 text-neon-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingUpIcon className="w-4 h-4 text-neon-400 mr-1" />
            <span className="text-neon-400 font-medium">+8%</span>
            <span className="text-neutral-400 ml-1">verification rate</span>
          </div>
        </div>

        <div className="card-hover p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-secondary opacity-20 rounded-bl-3xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Pending Verification</p>
              <p className="text-3xl font-bold text-white">{userStats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center border border-secondary-500/30">
              <ExclamationCircleIcon className="w-6 h-6 text-secondary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingDownIcon className="w-4 h-4 text-secondary-400 mr-1" />
            <span className="text-secondary-400 font-medium">-3%</span>
            <span className="text-neutral-400 ml-1">from last week</span>
          </div>
        </div>

        <div className="card-hover p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-electric opacity-20 rounded-bl-3xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Committee Members</p>
              <p className="text-3xl font-bold text-white">{userStats.committee}</p>
            </div>
            <div className="w-12 h-12 bg-electric-500/20 rounded-xl flex items-center justify-center border border-electric-500/30">
              <ShieldCheckIcon className="w-6 h-6 text-electric-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingUpIcon className="w-4 h-4 text-neon-400 mr-1" />
            <span className="text-neon-400 font-medium">+2</span>
            <span className="text-neutral-400 ml-1">new this month</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 py-3"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Role Filter */}
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input-field pr-10 appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="committee">Committee</option>
                <option value="user">User</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-neutral-400" />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field pr-10 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-neutral-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Showing <span className="font-semibold text-neutral-900">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold text-neutral-900">{users.length}</span> users
          </p>
          {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
                setFilterStatus('all');
              }}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Modern Edit Modal */}
      {editingUser && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-scale-in max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <PencilIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Edit User</h2>
                    <p className="text-sm text-neutral-600">Update user information and permissions</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="user">User</option>
                    <option value="committee">Committee Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={editForm.isVerified}
                    onChange={(e) => setEditForm({...editForm, isVerified: e.target.checked})}
                    className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <label htmlFor="isVerified" className="text-sm font-medium text-neutral-700">
                    Email Verified
                  </label>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modern Users Table */}
      <div className="card animate-fade-in-up" style={{animationDelay: '0.3s'}}>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No users found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no users in the system yet.'}
            </p>
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            ) : (
              <button className="btn-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add First User
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">User</th>
                    <th className="table-header-cell">Role</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Join Date</th>
                    <th className="table-header-cell text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id} className="table-row group" style={{animationDelay: `${index * 0.05}s`}}>
                      {/* User Info */}
                      <td className="table-cell">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                            <p className="text-sm text-neutral-300 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Role */}
                      <td className="table-cell">
                        <span className={`status-badge ${
                          user.role === 'admin' ? 'bg-electric-500/20 text-electric-300 border border-electric-500/30' : 
                          user.role === 'committee' ? 'bg-secondary-500/20 text-secondary-300 border border-secondary-500/30' : 
                          'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30'
                        }`}>
                          {user.role === 'committee' ? 'Committee Member' : 
                           user.role === 'admin' ? 'Administrator' : 'User'}
                        </span>
                      </td>
                      
                      {/* Status */}
                      <td className="table-cell">
                        <span className={`status-badge ${
                          user.isVerified ? 'bg-neon-500/20 text-neon-300 border border-neon-500/30' : 'bg-sunset-500/20 text-sunset-300 border border-sunset-500/30'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            user.isVerified ? 'bg-neon-400' : 'bg-sunset-400'
                          }`}></div>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      
                      {/* Join Date */}
                      <td className="table-cell">
                        <div className="text-sm text-white">
                          {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {new Date(user.createdAt || Date.now()).toLocaleTimeString()}
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-neutral-400 hover:text-electric-400 hover:bg-electric-500/10 rounded-lg transition-all duration-200"
                            title="Edit user"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          
                          <button
                            className="p-2 text-neutral-400 hover:text-neon-400 hover:bg-neon-500/10 rounded-lg transition-all duration-200"
                            title="View details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          
                          {user.role === 'user' && (
                            <button
                              onClick={() => promoteToCommittee(user._id)}
                              className="p-2 text-neutral-400 hover:text-secondary-400 hover:bg-secondary-500/10 rounded-lg transition-all duration-200"
                              title="Promote to Committee Member"
                            >
                              <ArrowTrendingUpIcon className="w-4 h-4" />
                            </button>
                          )}
                          
                          {user.role === 'committee' && (
                            <button
                              onClick={() => demoteFromCommittee(user._id)}
                              className="p-2 text-neutral-400 hover:text-sunset-400 hover:bg-sunset-500/10 rounded-lg transition-all duration-200"
                              title="Demote to regular user"
                            >
                              <ArrowTrendingDownIcon className="w-4 h-4" />
                            </button>
                          )}
                          
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                              title="Delete user"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;