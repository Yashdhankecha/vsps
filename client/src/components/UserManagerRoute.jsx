import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function UserManagerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Allow access to user managers and super admins
  const allowedRoles = ['usermanager', 'superadmin'];
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default UserManagerRoute;