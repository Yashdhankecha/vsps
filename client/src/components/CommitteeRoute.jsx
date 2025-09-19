import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CommitteeRoute = ({ children }) => {
  const { user, loading, hasCommitteeAccess } = useAuth();

  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500\"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to=\"/auth\" replace />;
  }

  if (!hasCommitteeAccess()) {
    return <Navigate to=\"/\" replace />;
  }

  return children;
};

export default CommitteeRoute;