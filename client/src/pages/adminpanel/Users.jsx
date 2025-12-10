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
  const [isCreating, setIsCreating] = useState(false); // New state for creating users
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    password: '', // Add password field for creating users
    role: 'user',
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
    admins: (users || []).filter(u => u.role === 'admin' || u.role === 'superadmin').length,
    regularUsers: (users || []).filter(u => u.role === 'user').length,
    userManagers: (users || []).filter(u => u.role === 'usermanager').length,
    contentManagers: (users || []).filter(u => u.role === 'contentmanager').length,
    formManagers: (users || []).filter(u => u.role === 'formmanager').length,
    bookingManagers: (users || []).filter(u => u.role === 'bookingmanager').length,
    contactManagers: (users || []).filter(u => u.role === 'contactmanager').length
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

  const handleCreateUser = () => {
    setIsCreating(true);
    setEditingUser({ _id: null }); // Set a temporary ID to indicate creation mode
    setEditForm({
      username: '',
      email: '',
      password: '',
      role: 'user',
      isVerified: false
    });
  };

  const handleEdit = (user) => {
    setIsCreating(false);
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      password: '', // Don't prefill password for security
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
        setEditingUser(null);
        return;
      }

      let response;
      if (isCreating) {
        // Creating a new user
        if (!editForm.password) {
          showNotification('Password is required for new users', 'error');
          return;
        }
        
        response = await axiosInstance.post('/api/users/create', editForm);
      } else {
        // Updating an existing user
        response = await axiosInstance.put(`/api/users/${editingUser._id}`, editForm);
      }

      // Axios automatically throws an error for non-2xx responses
      // If we get here, the request was successful
      const data = response.data;

      if (isCreating) {
        setUsers(prevUsers => [...(prevUsers || []), data.user]);
        showNotification(
          `User created successfully`, 
          'success', 
          () => fetchUsers(), 
          'Refresh Users'
        );
      } else {
        setUsers(prevUsers => (prevUsers || []).map(user => 
          user._id === editingUser._id ? data.user : user
        ));
        showNotification(
          `User updated successfully`, 
          'success', 
          () => fetchUsers(), 
          'Refresh Users'
        );
      }
      
      setEditingUser(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving user:', error);
      showNotification(
        error.response?.data?.message || error.message || `Failed to ${isCreating ? 'create' : 'update'} user`, 
        'error',
        () => {
          if (isCreating) {
            setIsCreating(false);
          }
          setEditingUser(null);
        },
        'Close Form'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-600/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-electric-500 animate-spin"></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">Loading Users</h3>
            <p className="text-neutral-300">Please wait while we fetch the user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="card-glass p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <XCircleIconSolid className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Users</h3>
            <p className="text-neutral-300 mb-6">{error}</p>
            <button
              onClick={fetchUsers}
              className="btn-primary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      {/* Main Content Container */}
      <div className="card-glass animate-fade-in-up">
        {/* Notifications - Positioned absolutely within the container to avoid layout issues */}
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

        {/* Header Section - Responsive */}
        <div className="border-b border-white/10 pb-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* Title and Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">User Management</h2>
              </div>
              
              {/* Stats Display */}
              <div className="glass-effect px-4 py-2 rounded-lg border border-white/10">
                <div className="text-center">
                  <div className="text-sm font-medium text-neutral-300">Total Users</div>
                  <div className="text-lg font-bold text-electric-400">{userStats.total}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
              <button
                onClick={handleCreateUser}
                className="btn-primary flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create User
              </button>
              <button
                onClick={exportUsers}
                className="btn-secondary flex items-center"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Filter Buttons - Responsive */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filterRole === 'all' 
                    ? 'bg-gradient-electric text-white shadow-lg neon-glow' 
                    : 'glass-effect text-neutral-300 hover:text-white border border-white/10 hover:border-electric-500/50'
                }`}
              >
                <span className="hidden sm:inline">All Users</span>
                <span className="sm:hidden">All</span>
              </button>
              <button
                onClick={() => setFilterRole('admin')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filterRole === 'admin' 
                    ? 'bg-gradient-electric text-white shadow-lg neon-glow' 
                    : 'glass-effect text-neutral-300 hover:text-white border border-white/10 hover:border-electric-500/50'
                }`}
              >
                <span className="hidden sm:inline">Admins</span>
                <span className="sm:hidden">Admin</span>
              </button>
              <button
                onClick={() => setFilterRole('superadmin')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filterRole === 'superadmin' 
                    ? 'bg-gradient-electric text-white shadow-lg neon-glow' 
                    : 'glass-effect text-neutral-300 hover:text-white border border-white/10 hover:border-electric-500/50'
                }`}
              >
                <span className="hidden sm:inline">Super Admins</span>
                <span className="sm:hidden">Super</span>
              </button>
              <button
                onClick={() => setFilterRole('user')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filterRole === 'user' 
                    ? 'bg-gradient-electric text-white shadow-lg neon-glow' 
                    : 'glass-effect text-neutral-300 hover:text-white border border-white/10 hover:border-electric-500/50'
                }`}
              >
                <span className="hidden sm:inline">Regular Users</span>
                <span className="sm:hidden">Users</span>
              </button>
              <button
                onClick={() => setFilterRole('usermanager')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filterRole === 'usermanager' 
                    ? 'bg-gradient-electric text-white shadow-lg neon-glow' 
                    : 'glass-effect text-neutral-300 hover:text-white border border-white/10 hover:border-electric-500/50'
                }`}
              >
                <span className="hidden sm:inline">User Managers</span>
                <span className="sm:hidden">UM</span>
              </button>
              <button
                onClick={() => setFilterRole('contentmanager')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filterRole === 'contentmanager' 
                    ? 'bg-gradient-electric text-white shadow-lg neon-glow' 
                    : 'glass-effect text-neutral-300 hover:text-white border border-white/10 hover:border-electric-500/50'
                }`}
              >
                <span className="hidden sm:inline">Content Managers</span>
                <span className="sm:hidden">CM</span>
              </button>
              <button
                onClick={() => setFilterRole('formmanager')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filterRole === 'formmanager' 
                    ? 'bg-gradient-electric text-white shadow-lg neon-glow' 
                    : 'glass-effect text-neutral-300 hover:text-white border border-white/10 hover:border-electric-500/50'
                }`}
              >
                <span className="hidden sm:inline">Form Managers</span>
                <span className="sm:hidden">FM</span>
              </button>
              <button
                onClick={() => setFilterRole('bookingmanager')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filterRole === 'bookingmanager' 
                    ? 'bg-gradient-electric text-white shadow-lg neon-glow' 
                    : 'glass-effect text-neutral-300 hover:text-white border border-white/10 hover:border-electric-500/50'
                }`}
              >
                <span className="hidden sm:inline">Booking Managers</span>
                <span className="sm:hidden">BM</span>
              </button>
              <button
                onClick={() => setFilterRole('contactmanager')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filterRole === 'contactmanager' 
                    ? 'bg-gradient-electric text-white shadow-lg neon-glow' 
                    : 'glass-effect text-neutral-300 hover:text-white border border-white/10 hover:border-electric-500/50'
                }`}
              >
                <span className="hidden sm:inline">Contact Managers</span>
                <span className="sm:hidden">CM</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table - Responsive */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-neutral-500" />
            <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
            <p className="text-neutral-400">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-neutral-800/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 border-b border-white/10">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 border-b border-white/10">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 border-b border-white/10">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 border-b border-white/10">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr key={user._id} className={`transition-colors duration-200 ${
                      idx % 2 === 0 ? 'bg-transparent' : 'bg-white/5'
                    } hover:bg-white/10`}>
                      <td className="px-6 py-4 border-b border-white/10">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-electric flex items-center justify-center mr-3">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.username}</p>
                            <p className="text-sm text-neutral-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-white/10">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-electric-500/20 text-electric-300 border border-electric-500/30' :
                          user.role === 'superadmin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          user.role === 'usermanager' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          user.role === 'contentmanager' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          user.role === 'formmanager' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          user.role === 'bookingmanager' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          user.role === 'contactmanager' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                          'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30'
                        }`}>
                          {user.role === 'admin' ? 'Admin' :
                           user.role === 'superadmin' ? 'Super Admin' :
                           user.role === 'usermanager' ? 'User Manager' :
                           user.role === 'contentmanager' ? 'Content Manager' :
                           user.role === 'formmanager' ? 'Form Manager' :
                           user.role === 'bookingmanager' ? 'Booking Manager' :
                           user.role === 'contactmanager' ? 'Contact Manager' :
                           'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-white/10">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isVerified ? 'bg-neon-500/20 text-neon-300 border border-neon-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-electric-400 hover:text-electric-300 font-medium transition-colors duration-200"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-400 hover:text-red-300 font-medium transition-colors duration-200"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {(editingUser) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="glass-effect border border-white/10 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fade-in-up">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">
                  {isCreating ? 'Create User' : 'Edit User'}
                </h3>
                <button 
                  onClick={() => setEditingUser(null)} 
                  className="text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="px-6 py-4 space-y-4">
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
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                
                {isCreating && (
                  <div>
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="form-label">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="input-field"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="usermanager">User Manager</option>
                    <option value="contentmanager">Content Manager</option>
                    <option value="formmanager">Form Manager</option>
                    <option value="bookingmanager">Booking Manager</option>
                    <option value="contactmanager">Contact Manager</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={editForm.isVerified}
                    onChange={(e) => setEditForm({...editForm, isVerified: e.target.checked})}
                    className="h-4 w-4 text-electric-500 rounded border-neutral-600 bg-neutral-700 focus:ring-electric-500"
                  />
                  <label htmlFor="isVerified" className="ml-2 block text-sm text-neutral-300">
                    Verified
                  </label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {isCreating ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;