import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AdminHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication only once when component mounts
    // or when location changes
    checkAuth();
  }, [location.pathname]); // Add location.pathname as dependency

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decodedToken.role);
        setIsLoggedIn(true);
        
        // Only redirect if we're not already on an admin route
        if (decodedToken.role !== 'admin' && !location.pathname.startsWith('/admin')) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        handleLogout();
      }
    } else if (!location.pathname.includes('/auth')) {
      // Only redirect to auth if we're not already there
      navigate('/auth');
    }
  };

  const handleLogout = () => {
    // Clear all auth-related state and storage
    localStorage.clear(); // Clear all localStorage items
    setIsLoggedIn(false);
    setUserRole('');
    
    // Force a page reload and redirect to auth
    window.location.href = '/auth';
  };

  // Only render the header if user is logged in and is admin
  if (!isLoggedIn || userRole !== 'admin') {
    return null;
  }

  return (
    <header className="bg-white shadow-md px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">Admin</span>
          <button 
            onClick={handleLogout} 
            className="text-purple-600 hover:text-purple-500 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;