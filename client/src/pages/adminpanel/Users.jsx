import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
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

  // Function to show notification
  const showNotification = (message, type = 'error', action = null, actionLabel = '') => {
    const id = Date.now().toString();
    
    // Add new notification to state
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axiosInstance.get('/api/users/all');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response && error.response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        navigate('/auth');
      } else {
        setError(error.response?.data?.message || 'Failed to load users. Please try again later.');
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
      setUsers(users.filter(user => user._id !== userId));
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

      setUsers(users.map(user => 
        user._id === editingUser._id ? data.user : user
      ));
      setEditingUser(null);
      showNotification(
        'User updated successfully', 
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications Container */}
      <div className="fixed top-5 right-5 z-50 max-w-md w-full">
        {notifications.map(notification => {
          const bgColor = notification.type === 'success' ? 'bg-green-50' : notification.type === 'error' ? 'bg-red-50' : 'bg-yellow-50';
          const borderColor = notification.type === 'success' ? 'border-green-500' : notification.type === 'error' ? 'border-red-500' : 'border-yellow-500';
          const textColor = notification.type === 'success' ? 'text-green-800' : notification.type === 'error' ? 'text-red-800' : 'text-yellow-800';
          const iconColor = notification.type === 'success' ? 'text-green-600' : notification.type === 'error' ? 'text-red-600' : 'text-yellow-600';
          const buttonBg = notification.type === 'success' ? 'bg-green-600 hover:bg-green-700' : notification.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700';
          
          return (
            <div 
              key={notification.id}
              className={`p-4 rounded-lg shadow-xl ${bgColor} border-l-4 ${borderColor} mb-3 transform transition-all duration-300 ease-in-out translate-x-0 opacity-100`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`rounded-full ${bgColor.replace('bg-', 'bg-').replace('-50', '-100')} p-1`}>
                    {notification.type === 'success' ? (
                      <CheckCircleIcon className={`h-5 w-5 ${iconColor}`} />
                    ) : notification.type === 'error' ? (
                      <XCircleIcon className={`h-5 w-5 ${iconColor}`} />
                    ) : (
                      <ExclamationCircleIcon className={`h-5 w-5 ${iconColor}`} />
                    )}
                  </div>
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${textColor}`}>
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {notification.type === 'success' ? 'Operation completed successfully' : 'Please try again or contact support'}
                  </p>
                  {notification.action && notification.actionLabel && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        type="button"
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${buttonBg}`}
                        onClick={() => {
                          notification.action();
                          closeNotification(notification.id);
                        }}
                      >
                        {notification.actionLabel === 'Refresh List' || notification.actionLabel === 'Refresh Users' ? (
                          <>
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            {notification.actionLabel}
                          </>
                        ) : (
                          notification.actionLabel
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    type="button"
                    className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => closeNotification(notification.id)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all users in your application
          </p>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.isVerified}
                  onChange={(e) => setEditForm({...editForm, isVerified: e.target.checked})}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Verified</label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {users.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No users found</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-purple-500 hover:text-purple-700 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;