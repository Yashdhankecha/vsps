import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BellIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

const AdminHeader = () => {
  const { user, setUser } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New user registration', message: 'John Doe has registered', time: '2 min ago', unread: true },
    { id: 2, title: 'Booking request', message: 'Wedding booking pending approval', time: '15 min ago', unread: true },
    { id: 3, title: 'Payment received', message: 'Payment confirmed for Event #123', time: '1 hour ago', unread: false },
  ]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user becomes null, navigate to auth page
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    // Clear all auth-related state and storage
    localStorage.clear(); // Clear all localStorage items
    setUser(null);
  };

  const getPageTitle = () => {
    const pathMap = {
      '/admin/dashboard': 'Dashboard Overview',
      '/admin/users': 'User Management',
      '/admin/content-management': 'Content Management',
      '/admin/form-management': 'Form Management',
      '/admin/booking-management': 'Booking Management',
      '/admin/booked-dates': 'Calendar View',
      '/admin/contact-management': 'Contact Management',
      '/admin/live-streams': 'Live Streams',
      '/admin/settings': 'Settings'
    };
    return pathMap[location.pathname] || 'Admin Panel';
  };

  const userName = user?.username || 'Admin';
  const userRole = user?.role || '';

  // Only render the header if user is logged in and has admin access
  const adminRoles = ['admin', 'superadmin'];
  if (!user || !adminRoles.includes(user.role)) {
    return null;
  }

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="glass-effect border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Page Title & Search */}
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
            <p className="text-sm text-neutral-300">Welcome back, {userName}</p>
          </div>
          
          {/* Search Bar */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 bg-neutral-800/50 border border-white/20 text-white placeholder-neutral-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass-effect rounded-2xl shadow-2xl border border-white/20 py-2 z-50 animate-fade-in-down">
                <div className="px-4 py-3 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  <p className="text-sm text-neutral-300">{unreadCount} unread messages</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`px-4 py-3 hover:bg-white/5 transition-colors duration-200 ${notification.unread ? 'bg-electric-500/10' : ''}`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-electric-500' : 'bg-neutral-500'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          <p className="text-sm text-neutral-300">{notification.message}</p>
                          <p className="text-xs text-neutral-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-white/10">
                  <button className="text-sm text-electric-400 hover:text-electric-300 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-electric rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-neutral-300">Administrator</p>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-neutral-400" />
            </button>
            
            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-effect rounded-2xl shadow-2xl border border-white/20 py-2 z-50 animate-fade-in-down">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-neutral-300">admin@vsps.com</p>
                </div>
                
                <div className="py-2">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors duration-200">
                    <UserCircleIcon className="h-4 w-4 mr-3" />
                    Profile Settings
                  </button>
                  <Link to="/admin/settings" className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors duration-200">
                    <CogIcon className="h-4 w-4 mr-3" />
                    Preferences
                  </Link>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors duration-200">
                    <QuestionMarkCircleIcon className="h-4 w-4 mr-3" />
                    Help & Support
                  </button>
                </div>
                
                <div className="border-t border-white/10 py-2">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;