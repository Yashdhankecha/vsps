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
  const [isEditing, setIsEditing] = useState(false); // Add missing isEditing state
  const [isRefreshing, setIsRefreshing] = useState(false); // Add missing isRefreshing state
  const [deletingUser, setDeletingUser] = useState(null); // Add missing deletingUser state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // Add missing showDeleteConfirmation state
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
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

  // Update the refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
  };

  // Pagination logic
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Change items per page
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

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
    contactManagers: (users || []).filter(u => u.role === 'contactmanager').length,
    committeeMembers: (users || []).filter(u => u.role === 'committeemember').length
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-500"></div>
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
    <div className="min-h-screen bg-gradient-mesh p-4 sm:p-6">
      {/* Main Content Container */}
      <div className="card-glass animate-fade-in-up p-6">
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
                <p className="text-sm text-neutral-300">
                  Total Users: <span className="font-semibold text-white">{Array.isArray(users) ? users.length : 0}</span>
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCreateUser}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-electric text-white rounded-lg hover:from-electric-600 hover:to-electric-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create User</span>
              </button>
              
              <button
                onClick={exportUsers}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-electric text-white rounded-lg hover:from-electric-600 hover:to-electric-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span>Export CSV</span>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 px-4 py-2 glass-effect rounded-lg border border-white/10 transition-all duration-300 ${
                  isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
                }`}
              >
                {isRefreshing ? (
                  <div className="w-5 h-5 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ArrowPathIcon className="w-5 h-5" />
                )}
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Search and Filter Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>
            
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
                <option value="user">User</option>
                <option value="usermanager">User Manager</option>
                <option value="contentmanager">Content Manager</option>
                <option value="formmanager">Form Manager</option>
                <option value="bookingmanager">Booking Manager</option>
                <option value="contactmanager">Contact Manager</option>
                <option value="committeemember">Committee Member</option>
              </select>
            </div>
            
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-neutral-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Joined</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-neutral-900/30 divide-y divide-white/10">
              {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-electric flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.username}</div>
                          <div className="text-sm text-neutral-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white capitalize">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isVerified 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setIsEditing(true);
                          }}
                          className="text-electric-400 hover:text-electric-300 transition-colors duration-200"
                          title="Edit User"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingUser(user);
                            setShowDeleteConfirmation(true);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          title="Delete User"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserIcon className="w-12 h-12 text-neutral-600 mb-3" />
                      <h3 className="text-lg font-medium text-white mb-1">No users found</h3>
                      <p className="text-neutral-400">
                        {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'There are currently no users in the system'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {Array.isArray(filteredUsers) && filteredUsers.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              Showing <span className="font-medium text-white">{indexOfFirstUser + 1}</span> to{' '}
              <span className="font-medium text-white">
                {Math.min(indexOfLastUser, filteredUsers.length)}
              </span>{' '}
              of <span className="font-medium text-white">{filteredUsers.length}</span> users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'glass-effect border border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === index + 1
                      ? 'bg-gradient-electric text-white'
                      : 'glass-effect border border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'glass-effect border border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-glass p-6 max-w-md w-full animate-fade-in-up">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                  <ExclamationTriangleIconSolid className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Confirm Deletion</h3>
                <p className="text-neutral-300 mb-6">
                  Are you sure you want to delete user <span className="font-semibold text-white">{deletingUser?.username}</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="btn-secondary px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleDelete(deletingUser._id);
                      setShowDeleteConfirmation(false);
                    }}
                    className="btn-danger px-4 py-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Create User Modal */}
        {(editingUser || isCreating) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-glass p-6 max-w-md w-full animate-fade-in-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {isCreating ? 'Create New User' : 'Edit User'}
                </h3>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="input-field w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="input-field w-full"
                      required
                    />
                  </div>
                  
                  {isCreating && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                        className="input-field w-full"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-neutral-300 mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      className="input-field w-full"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                      <option value="usermanager">User Manager</option>
                      <option value="contentmanager">Content Manager</option>
                      <option value="formmanager">Form Manager</option>
                      <option value="bookingmanager">Booking Manager</option>
                      <option value="contactmanager">Contact Manager</option>
                      <option value="committeemember">Committee Member</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={editForm.isVerified}
                      onChange={(e) => setEditForm({...editForm, isVerified: e.target.checked})}
                      className="h-4 w-4 text-electric-500 rounded border-neutral-600 bg-neutral-800 focus:ring-electric-500"
                    />
                    <label htmlFor="isVerified" className="ml-2 block text-sm text-neutral-300">
                      Verified
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setIsCreating(false);
                      setIsEditing(false);
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2"
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