import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaVideo, FaUser, FaBars, FaTimes, FaBell } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext'; // Import the useAuth hook

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);

  // Get user data from AuthContext
  const { user } = useAuth();

  // Check authentication status when component mounts or location changes
  useEffect(() => {
    // Close profile dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      label: 'Gallery',
      path: '/gallery'
    },
    {
      label: 'Forms',
      path: '/services'
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

  // Hide auth buttons on auth page
  const isAuthPage = location.pathname === '/auth' ||
    location.pathname === '/ForgotPassword' ||
    location.pathname.startsWith('/ResetPassword');

  return (
    <header className="bg-white/80 backdrop-blur-lg text-gray-800 shadow-soft relative z-50 border-b border-gray-200/60 sticky top-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md border border-gray-100">
              <img
                src="/assets/mainlogo.jpeg"
                alt="VSPS Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-3xl font-bold text-gradient group-hover:text-shimmer transition-all duration-300">
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
                          ? 'bg-electric-50 text-electric-700 shadow-sm border border-electric-200'
                          : 'hover:bg-gray-100 hover:scale-105 text-gray-700 border border-transparent'}`}
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === index ? 'rotate-180' : ''
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
                      className={`absolute left-0 mt-3 w-56 rounded-2xl shadow-lg bg-white border border-gray-200 
                        ${activeDropdown === index ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'} 
                        transition-all duration-300 transform origin-top z-50`}
                    >
                      <div className="py-2">
                        {item.dropdown.map((dropdownItem, dropdownIndex) => (
                          <Link
                            key={dropdownIndex}
                            to={dropdownItem.path}
                            className="block px-6 py-3 text-sm text-gray-600 hover:bg-electric-50 hover:text-electric-700 transition-all duration-200 font-medium border-l-2 border-transparent hover:border-electric-500"
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
                    className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold border
                      ${isActive(item.path)
                        ? 'bg-electric-50 text-electric-700 shadow-sm border-electric-200'
                        : 'hover:bg-gray-100 hover:scale-105 text-gray-700 border-transparent'}`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Profile Dropdown or Sign In button (only show if not on auth page) */}
            {!isAuthPage && (
              <>
                {user ? (
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="ml-4 px-6 py-3 rounded-2xl hover:bg-gray-100 transition-all duration-300 flex items-center space-x-3 font-semibold hover:scale-105 shadow-sm border border-gray-200 hover:border-gray-300 text-gray-700"
                    >
                      <div className="w-8 h-8 bg-gradient-electric rounded-full flex items-center justify-center">
                        <FaUser className="w-4 h-4 text-white" />
                      </div>
                      <span>{user.username || user.name || 'Profile'}</span>
                    </button>
                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-64 rounded-2xl shadow-lg bg-white border border-gray-200 z-50">
                        <div className="py-3">
                          <div className="px-6 py-3 border-b border-gray-100">
                            <p className="text-sm text-gray-500">Welcome back!</p>
                            <p className="font-semibold text-gray-900">{user.username || user.name || 'User Profile'}</p>
                          </div>
                          <Link
                            to="/profile-settings"
                            className="block px-6 py-4 text-sm text-gray-600 hover:bg-electric-50 hover:text-electric-700 font-medium transition-all duration-200"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Profile Settings
                          </Link>
                          <Link
                            to="/recently-booked"
                            className="block px-6 py-4 text-sm text-gray-600 hover:bg-electric-50 hover:text-electric-700 font-medium transition-all duration-200"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Recent Bookings
                          </Link>
                          <div className="border-t border-gray-100 mt-2">
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
                    className="ml-4 px-6 py-3 bg-gradient-electric text-white rounded-2xl hover:shadow-lg hover:shadow-electric-500/10 transition-all duration-300 flex items-center space-x-3 font-semibold hover:scale-105 shadow-md"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaUser className="w-4 h-4" />
                    </div>
                    <span>Sign In</span>
                  </Link>
                )}
              </>
            )}
          </nav>


          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:scale-110 text-gray-700"
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
          <nav className="lg:hidden py-6 border-t border-gray-200 bg-white">
            {/* Mobile Navigation Items */}
            <div className="px-6 space-y-2">
              {navigationItems.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                    <div className="py-2">
                      <div className="font-bold text-lg text-gray-900 mb-3 px-3">{item.label}</div>
                      <div className="ml-4 space-y-2">
                        {item.dropdown.map((dropdownItem, dropdownIndex) => (
                          <Link
                            key={dropdownIndex}
                            to={dropdownItem.path}
                            className="block py-3 px-4 text-gray-600 hover:text-electric-700 hover:bg-electric-50 rounded-xl transition-all duration-300 font-medium"
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
                      className="block py-4 px-4 hover:bg-gray-100 rounded-2xl transition-all duration-300 font-semibold text-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
            {/* Mobile Login/Signup (only show if not on auth page) */}
            {!isAuthPage && (
              <div className="px-6 pt-6 border-t border-gray-200">
                {user ? (
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <p className="text-gray-500 text-sm">Welcome back!</p>
                      <p className="text-gray-900 font-bold">{user.username || user.name || 'User Profile'}</p>
                    </div>
                    <Link
                      to="/profile-settings"
                      className="block text-center px-6 py-4 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold text-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      to="/recently-booked"
                      className="block text-center px-6 py-4 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold text-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Recent Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-center px-6 py-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-all duration-300 font-semibold text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center justify-center px-8 py-4 bg-gradient-electric rounded-2xl transition-all duration-300 font-bold text-gray-900 shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="mr-3 w-5 h-5" />
                    Sign In / Register
                  </Link>
                )}
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;