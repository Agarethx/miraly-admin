import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/shared/providers/SessionProvider';
import { LoadingPage } from '@/shared/components/LoadingPage';

/**
 * ProtectedRoute — gates the authenticated app. While the persisted session is
 * being restored it shows a loading page (avoids a login flash); once resolved,
 * unauthenticated visitors are sent to /login, preserving where they were going.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) return <LoadingPage label="Restaurando sesión…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
