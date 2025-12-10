import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ContentManagerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Allow access to content managers and super admins
  const allowedRoles = ['contentmanager', 'superadmin'];
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default ContentManagerRoute;