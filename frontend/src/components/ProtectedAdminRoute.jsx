import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * Protected Admin Route Component
 * Redirects non-admin users to homepage
 */
function ProtectedAdminRoute() {
  const user = authService.getCurrentUser();

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Not admin
  if (user.role !== 'admin') {
    alert('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  // Admin - allow access
  return <Outlet />;
}

export default ProtectedAdminRoute;
