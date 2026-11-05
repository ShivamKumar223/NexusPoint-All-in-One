import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, getRole } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedRoles) {
    const role = getRole();
    if (!allowedRoles.includes(role)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
          <h2>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)' }}>You don't have permission to access this page.</p>
          <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
