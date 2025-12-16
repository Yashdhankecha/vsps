import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(window.atob(base64));
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          console.warn('Token has expired');
          localStorage.removeItem('token');
          setUser(null);
        } else if (!decodedToken._id && !decodedToken.id && !decodedToken.userId) {
          console.error('Token does not contain user ID');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Normalize user data and ensure role is valid
          const normalizedUser = {
            ...decodedToken,
            _id: decodedToken._id || decodedToken.id || decodedToken.userId,
            role: decodedToken.role || 'user', // Default to 'user' if no role
            username: decodedToken.username || '' // Extract username from token
          };
          
          // Validate role
          const validRoles = ['user', 'admin', 'superadmin', 'usermanager', 'contentmanager', 'formmanager', 'bookingmanager', 'contactmanager', 'committeemember'];
          if (!validRoles.includes(normalizedUser.role)) {
            console.error('Invalid user role:', normalizedUser.role);
            localStorage.removeItem('token');
            setUser(null);
          } else {
            setUser(normalizedUser);
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Helper functions for role checking
  const isSuperAdmin = () => user?.role === 'superadmin';
  const isAdmin = () => user?.role === 'admin' || user?.role === 'superadmin';
  const isUser = () => user?.role === 'user';
  const isUserManager = () => user?.role === 'usermanager' || user?.role === 'superadmin';
  const isContentManager = () => user?.role === 'contentmanager' || user?.role === 'superadmin';
  const isFormManager = () => user?.role === 'formmanager' || user?.role === 'superadmin';
  const isBookingManager = () => user?.role === 'bookingmanager' || user?.role === 'superadmin';
  const isContactManager = () => user?.role === 'contactmanager' || user?.role === 'superadmin';
  const isCommitteeMember = () => user?.role === 'committeemember' || user?.role === 'superadmin';
  
  // Combined access checks
  const hasAdminAccess = () => ['admin', 'superadmin'].includes(user?.role);
  const hasUserAccess = () => ['user', 'admin', 'superadmin', 'usermanager', 'contentmanager', 'formmanager', 'bookingmanager', 'contactmanager', 'committeemember'].includes(user?.role);

  const value = {
    user,
    loading,
    setUser,
    isSuperAdmin,
    isAdmin,
    isUser,
    isUserManager,
    isContentManager,
    isFormManager,
    isBookingManager,
    isContactManager,
    isCommitteeMember,
    hasAdminAccess,
    hasUserAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}