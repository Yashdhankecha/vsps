import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        
        if (!decodedToken._id && !decodedToken.id && !decodedToken.userId) {
          console.error('Token does not contain user ID');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Normalize user data and ensure role is valid
          const normalizedUser = {
            ...decodedToken,
            _id: decodedToken._id || decodedToken.id || decodedToken.userId,
            role: decodedToken.role || 'user' // Default to 'user' if no role
          };
          
          // Validate role
          if (!['user', 'committee', 'admin'].includes(normalizedUser.role)) {
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
  const isAdmin = () => user?.role === 'admin';
  const isCommittee = () => user?.role === 'committee';
  const isUser = () => user?.role === 'user';
  const hasAdminAccess = () => user?.role === 'admin';
  const hasCommitteeAccess = () => ['committee', 'admin'].includes(user?.role);
  const hasUserAccess = () => ['user', 'committee', 'admin'].includes(user?.role);

  const value = {
    user,
    loading,
    setUser,
    isAdmin,
    isCommittee,
    isUser,
    hasAdminAccess,
    hasCommitteeAccess,
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