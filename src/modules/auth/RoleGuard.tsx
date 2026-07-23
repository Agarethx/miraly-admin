import type { ReactNode } from 'react';
import { useSession } from '@/shared/providers/SessionProvider';
import type { AdminRole } from '@/shared/types/admin';

interface RoleGuardProps {
  /** Roles allowed to see the children. Omit to allow any authenticated admin. */
  allow?: AdminRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RoleGuard — PREPARED for RBAC (Billing 3.1) but intentionally permissive now:
 * with no `allow` list it renders for any authenticated admin. The plumbing
 * (role on the Admin, this guard) exists so enabling RBAC later is additive and
 * requires no structural change.
 */
export function RoleGuard({ allow, children, fallback = null }: RoleGuardProps) {
  const { admin } = useSession();
  if (!admin) return <>{fallback}</>;
  if (allow && !allow.includes(admin.role)) return <>{fallback}</>;
  return <>{children}</>;
}
