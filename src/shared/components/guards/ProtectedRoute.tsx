import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/shared/services/apiClient';

export const ProtectedRoute = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redirect to the login page, but save the current location they tried to access
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;