import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

export const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, accessToken } = useAuthStore();
  const location = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
