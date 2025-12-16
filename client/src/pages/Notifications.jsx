import { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaFilter, FaClipboardList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../services/notificationService';
import axios from '../utils/axiosConfig';
import { Card, Button } from '../components';

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    // Set up periodic refresh
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching notifications...');
      
      const notifications = await getNotifications();
      console.log('Raw notifications response:', notifications);
      
      if (!Array.isArray(notifications)) {
        throw new Error('Invalid notifications data format');
      }
      
      // Filter out any invalid notifications
      const validNotifications = notifications.filter(notification => 
        notification && 
        notification.id && 
        notification.message && 
        notification.type
      );
      
      console.log('Valid notifications:', validNotifications);
      setNotifications(validNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type and formType
    if (notification.type === 'form') {
      switch (notification.formType) {
        case 'samuhLagan':
          navigate('/samuh-lagan');
          break;
        case 'studentAward':
          navigate('/student-awards');
          break;
        default:
          break;
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const getNotificationIcon = (type, formType) => {
    switch (type) {
      case 'form':
        return <FaClipboardList className="text-electric-400 text-xl" />;
      default:
        return <FaBell className="text-neutral-400 text-xl" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-mesh py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
            <FaBell className="mr-3 text-electric-400" />
            Notifications
          </h1>
          <p className="text-neutral-300">Stay updated with the latest announcements and alerts</p>
        </div>
        
        <Card className="glass-effect border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 px-6 py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">
                Your Notifications
              </h2>
              {notifications.some(n => !n.read) && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="secondary"
                  size="sm"
                >
                  <FaCheck className="mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-4">
              <FaFilter className="text-neutral-400" />
              <div className="flex flex-wrap gap-2">
                {['all', 'unread', 'form'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      filter === filterType
                        ? 'bg-gradient-electric text-white shadow-lg'
                        : 'text-neutral-300 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-white/10">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-2 border-electric-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-6 cursor-pointer transition-all duration-300 ${
                    notification.read 
                      ? 'bg-neutral-800/30 hover:bg-neutral-800/50' 
                      : 'bg-gradient-electric/10 hover:bg-gradient-electric/20 border-l-4 border-electric-500'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.formType)}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${notification.read ? 'text-neutral-300' : 'text-white font-semibold'}`}>
                          {notification.message}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="text-neutral-400 hover:text-red-400 transition-colors ml-2"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-neutral-400">
                        <span>{formatTimestamp(notification.createdAt)}</span>
                        {!notification.read && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-electric-500/20 text-electric-300 border border-electric-500/30">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-neutral-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBell className="text-neutral-400 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
                <p className="text-neutral-400">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications." 
                    : "You don't have any notifications at the moment."}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Notifications;