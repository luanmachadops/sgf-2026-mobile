import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute() {
  const { driver, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="screen-centered">Carregando...</div>;
  }

  if (!driver) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
