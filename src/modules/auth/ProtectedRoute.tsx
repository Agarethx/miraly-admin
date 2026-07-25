import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/shared/providers/SessionProvider';
import { LoadingPage } from '@/shared/components/LoadingPage';
import { AccessDenied } from './AccessDenied';

/**
 * ProtectedRoute — gates the Backoffice to real PLATFORM ADMINS.
 *
 * While the session is restoring OR roles are resolving, it shows a loading page,
 * so a non-admin never flashes the Backoffice. Then:
 *   - no session               -> /login (preserving intended destination)
 *   - session, planner (not admin) -> /planner (their own portal)
 *   - session, neither role     -> AccessDenied (clean, sign-out only)
 *   - session + admin           -> the Backoffice (Outlet)
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading, isResolvingRoles, isPlatformAdmin, isPlanner } = useSession();
  const location = useLocation();

  if (isLoading || isResolvingRoles) return <LoadingPage label="Verificando acceso…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isPlatformAdmin) {
    if (isPlanner) return <Navigate to="/planner" replace />;
    return <AccessDenied />;
  }

  return <Outlet />;
}
