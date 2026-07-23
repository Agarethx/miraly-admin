/**
 * Admin — the Backoffice user. Distinct from a mobile Organizer: an admin
 * operates the platform. Backed by Supabase Auth.
 *
 * `role` is prepared for RBAC (Billing 3.1) but NOT enforced yet — the RoleGuard
 * accepts any authenticated admin in this phase. Roles are a forward-looking slot.
 */
export type AdminRole = 'owner' | 'admin' | 'finance' | 'support';

export interface Admin {
  id: string;
  email: string;
  role: AdminRole;
}
