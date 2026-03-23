import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'owner' | 'employee';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'owner') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
