import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedForBlocketOnly?: boolean;
}

export function RoleProtectedRoute({ 
  children, 
  allowedForBlocketOnly = false 
}: RoleProtectedRouteProps) {
  const { isBlocketOnly, loading } = useUserRole();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is blocket-only and tries to access non-blocket routes
  if (isBlocketOnly && !allowedForBlocketOnly) {
    return <Navigate to="/blocket/arenden" replace />;
  }

  return <>{children}</>;
}
