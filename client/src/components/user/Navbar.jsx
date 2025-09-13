import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaCalendar, FaVideo, FaImage, FaCog, FaStar, FaBook, FaPhone, FaUser, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [userName, setUserName] = useState('');
  const token = localStorage.getItem('token'); // Get token from localStorage
  const userId = localStorage.getItem('ObjectId'); // Get user ID from localStorage

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!token || !userId) {
          return; // Exit if no token or user ID
        }

        const response = await axios.get(
          `http://localhost:5173/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          setUserName(response.data.data.profileData?.name || 'User'); // Set user name
        } else {
          toast.error('Failed to load profile data.');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error(error.response?.data?.message || 'Error loading profile data.');
      }
    };

    fetchProfileData();
  }, [token, userId]); // Fetch data when token or userId changes

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token
    localStorage.removeItem('ObjectId'); // Remove user ID
    navigate('/login'); // Redirect to login page
  };

  const mainCategories = [
    {
      label: 'Home',
      icon: FaHome,
      path: '/'
    },
    {
      label: 'Events',
      icon: FaCalendar,
      dropdown: [
        { path: '/events/categories', label: 'Categories' },
        { path: '/events/booking', label: 'Book Event' }
      ]
    },
    {
      label: 'Live Streaming',
      icon: FaVideo,
      dropdown: [
        { path: '/live/current', label: 'Live Now' },
        { path: '/live/upcoming', label: 'Upcoming Events' }
      ]
    },
    {
      label: 'Gallery',
      icon: FaImage,
      path: '/gallery'
    },
    {
      label: 'Services',
      icon: FaCog,
      dropdown: [
        { path: '/services', label: 'Our Services' },
        { path: '/services/amenities', label: 'Amenities' }
      ]
    },
    {
      label: 'Reviews',
      icon: FaStar,
      dropdown: [
        { path: '/reviews/testimonials', label: 'Testimonials' },
        { path: '/reviews/feedback', label: 'Leave Feedback' }
      ]
    },
    {
      label: 'Resources',
      icon: FaBook,
      path: '/resources'
    },
    {
      label: 'Contact',
      icon: FaPhone,
      path: '/contact'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-purple-600">CommunityWeb</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainCategories.map((category, index) => (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {category.dropdown ? (
                  <button
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors
                      ${activeDropdown === index
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                  >
                    <category.icon className="text-lg" />
                    <span>{category.label}</span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    to={category.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors
                      ${isActive(category.path)
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                  >
                    <category.icon className="text-lg" />
                    <span>{category.label}</span>
                  </Link>
                )}

                {category.dropdown && (
                  <div
                    className={`absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
                      activeDropdown === index ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2'
                    }`}
                  >
                    <div className="py-1">
                      {category.dropdown.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          to={item.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Profile Dropdown (When Logged In) */}
            {token ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <FaUser />
                  <span>{userName || 'Profile'}</span>
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-md ring-1 ring-black ring-opacity-5">
                    <Link
                      to="/profile-settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    >
                      <FaUserCog className="mr-2" />
                      Profile Settings
                    </Link>
                    <Link
                      to="/recently-booked"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    >
                      <FaCalendar className="mr-2" />
                      Recently Booked
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Show Login Button if User Not Logged In
              <Link
                to="/login"
                className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-1"
              >
                <FaUser />
                
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;