import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

export const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children?: React.ReactNode, 
  allowedRoles?: string[] 
}) => {
  const { user, accessToken } = useAuthStore();
  const location = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's correct dashboard if they are in the wrong area
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const FirstLoginGuard = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Don't redirect if already on reset-password page
  if (user?.isFirstLogin && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
