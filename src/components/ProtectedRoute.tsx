
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const location = useLocation();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated but profile doesn't exist, redirect to auth for profile creation
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to role-based dashboard if user is on generic /dashboard
  if (location.pathname === '/dashboard') {
    const redirectPath = profile.role === 'creator' ? '/dashboard/creator' : '/dashboard/buyer';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
