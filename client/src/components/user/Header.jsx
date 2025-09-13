import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaVideo, FaUser, FaBars, FaTimes, FaBell } from 'react-icons/fa';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status when component mounts or location changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notificationId) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const navigationItems = [
    {
      label: 'Home',
      path: '/'
    },
    {
      label: 'Events',
      dropdown: [
        { label: 'Event Categories', path: '/events/categories' },
        { label: 'Book Event', path: '/booking' }
      ]
    },
    {
      label: 'Live',
      dropdown: [
        { label: 'Live Events', path: '/live-streaming' },
        { label: 'Upcoming Broadcasts', path: '/live-streaming' }
      ]
    },
    {
      label: 'Gallery',
      path: '/gallery'
    },
    {
      label: 'Services',
      dropdown: [
        { label: 'Our Services', path: '/services' },
        { label: 'Amenities', path: '/services/amenities' }
      ]
    },
    {
      label: 'Reviews',
      dropdown: [
        { label: 'Testimonials', path: '/testimonials' },
        { label: 'Submit Review', path: '/reviews/submit-review' }
      ]
    },
    {
      label: 'Resources',
      path: '/resources'
    },
    {
      label: 'Contact',
      path: '/contact'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsProfileDropdownOpen(false);
    navigate('/auth');
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white shadow-2xl relative z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
              <FaVideo className="text-xl" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-white transition-all duration-300">
              VSPS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.dropdown ? (
                  <div>
                    <button
                      className={`px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold
                        ${activeDropdown === index 
                          ? 'bg-white/20 text-white shadow-lg transform scale-105' 
                          : 'hover:bg-white/10 hover:scale-105'}`}
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {/* Dropdown */}
                    <div
                      className={`absolute left-0 mt-3 w-56 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm ring-1 ring-white/20 
                        ${activeDropdown === index ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'} 
                        transition-all duration-300 transform origin-top z-50`}
                    >
                      <div className="py-2">
                        {item.dropdown.map((dropdownItem, dropdownIndex) => (
                          <Link
                            key={dropdownIndex}
                            to={dropdownItem.path}
                            className="block px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-600 transition-all duration-200 font-medium"
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold
                      ${isActive(item.path) 
                        ? 'bg-white/20 text-white shadow-lg transform scale-105' 
                        : 'hover:bg-white/10 hover:scale-105'}`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Profile Dropdown */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="ml-4 px-6 py-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-3 font-semibold hover:scale-105 shadow-lg"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <FaUser className="w-4 h-4" />
                  </div>
                  <span>Profile</span>
                </button>
                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm ring-1 ring-white/20 z-50">
                    <div className="py-3">
                      <div className="px-6 py-3 border-b border-gray-200">
                        <p className="text-sm text-gray-500">Welcome back!</p>
                        <p className="font-semibold text-gray-900">User Profile</p>
                      </div>
                      <Link
                        to="/notifications"
                        className="flex px-6 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-600 items-center justify-between transition-all duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <span className="flex items-center font-medium">
                          <FaBell className="mr-3 w-4 h-4" />
                          Notifications
                        </span>
                        {unreadNotificationsCount > 0 && (
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/profile-settings"
                        className="block px-6 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-600 font-medium transition-all duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <Link
                        to="/recently-booked"
                        className="block px-6 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-600 font-medium transition-all duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Recent Bookings
                      </Link>
                      <div className="border-t border-gray-200 mt-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-6 py-4 text-sm text-red-600 hover:bg-red-50 font-medium transition-all duration-200"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="ml-4 px-6 py-3 bg-gradient-to-r from-white/10 to-white/20 rounded-2xl hover:from-white/20 hover:to-white/30 transition-all duration-300 flex items-center space-x-3 font-semibold hover:scale-105 shadow-lg"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <FaUser className="w-4 h-4" />
                </div>
                <span>Sign In</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-110"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden py-6 border-t border-white/20 bg-gradient-to-b from-purple-600/90 to-indigo-600/90 backdrop-blur-sm">
            {/* Notifications Section for Mobile */}
            {isLoggedIn && (
              <div className="px-6 py-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold text-lg text-white">Notifications</div>
                  {unreadNotificationsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                        notification.read ? 'bg-white/5' : 'bg-white/10 border border-white/20'
                      }`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <p className="text-sm text-white/90 font-medium">{notification.message}</p>
                      <p className="text-xs text-white/60 mt-2">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mobile Navigation Items */}
            <div className="px-6 space-y-2">
              {navigationItems.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                    <div className="py-2">
                      <div className="font-bold text-lg text-white mb-3 px-3">{item.label}</div>
                      <div className="ml-4 space-y-2">
                        {item.dropdown.map((dropdownItem, dropdownIndex) => (
                          <Link
                            key={dropdownIndex}
                            to={dropdownItem.path}
                            className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className="block py-4 px-4 hover:bg-white/10 rounded-2xl transition-all duration-300 font-semibold text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
            {/* Mobile Login/Signup */}
            <div className="px-6 pt-6 border-t border-white/20">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <p className="text-white/80 text-sm">Welcome back!</p>
                    <p className="text-white font-bold">User Profile</p>
                  </div>
                  <Link
                    to="/notifications"
                    className="flex items-center justify-center px-6 py-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaBell className="mr-3 w-4 h-4" />
                    Notifications
                    {unreadNotificationsCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/profile-settings"
                    className="block text-center px-6 py-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    to="/recently-booked"
                    className="block text-center px-6 py-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Recent Bookings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center px-6 py-4 bg-red-500/20 rounded-2xl hover:bg-red-500/30 transition-all duration-300 font-semibold text-red-200 hover:text-red-100"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-white/10 to-white/20 rounded-2xl hover:from-white/20 hover:to-white/30 transition-all duration-300 font-bold text-white shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="mr-3 w-5 h-5" />
                  Sign In / Register
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;