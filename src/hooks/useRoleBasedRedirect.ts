
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useRoleBasedRedirect = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || !profile) return;

    // After login, redirect based on role
    if (location.pathname === '/auth' || location.pathname === '/') {
      if (profile.role === 'creator') {
        navigate('/dashboard/creator');
      } else {
        navigate('/dashboard/buyer');
      }
      return;
    }

    // Protect creator-only routes
    const creatorRoutes = ['/dashboard/creator', '/create', '/products/create'];
    const isCreatorRoute = creatorRoutes.some(route => location.pathname.startsWith(route));
    
    if (isCreatorRoute && profile.role !== 'creator') {
      navigate('/dashboard/buyer');
      return;
    }

    // Protect buyer-only routes  
    const buyerRoutes = ['/dashboard/buyer', '/purchases'];
    const isBuyerRoute = buyerRoutes.some(route => location.pathname.startsWith(route));
    
    if (isBuyerRoute && profile.role !== 'buyer') {
      navigate('/dashboard/creator');
      return;
    }
  }, [user, profile, location.pathname, navigate]);
};
