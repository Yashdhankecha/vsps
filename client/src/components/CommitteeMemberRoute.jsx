import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function CommitteeMemberRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Allow access to committee members and super admins
  const allowedRoles = ['committeemember', 'superadmin'];
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default CommitteeMemberRoute;