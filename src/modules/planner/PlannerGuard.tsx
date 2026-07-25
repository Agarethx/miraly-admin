import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/shared/providers/SessionProvider';
import { LoadingPage } from '@/shared/components/LoadingPage';
import { AccessDenied } from '@/modules/auth/AccessDenied';

/**
 * PlannerGuard — gates the /planner tree to wedding planners.
 *
 *   - session/roles resolving -> loading (no flash)
 *   - no session              -> /login
 *   - admin (not planner)     -> / (the Backoffice is their home)
 *   - neither role            -> AccessDenied
 *   - planner                 -> the planner portal (Outlet)
 * (If someone is both admin and planner, the Backoffice takes priority.)
 */
export function PlannerGuard() {
  const { isAuthenticated, isLoading, isResolvingRoles, isPlatformAdmin, isPlanner } = useSession();
  const location = useLocation();

  if (isLoading || isResolvingRoles) return <LoadingPage label="Verificando acceso…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (isPlatformAdmin) return <Navigate to="/" replace />;
  if (!isPlanner) return <AccessDenied />;

  return <Outlet />;
}
