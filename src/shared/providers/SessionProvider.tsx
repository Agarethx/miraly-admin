import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/shared/services/supabase';
import type { Admin, AdminRole } from '@/shared/types/admin';

/** Backend-derived roles. Never assumed from the session. */
interface Roles {
  resolved: boolean;
  isAdmin: boolean;
  isPlanner: boolean;
}

const EMPTY_ROLES: Roles = { resolved: false, isAdmin: false, isPlanner: false };

interface SessionContextValue {
  session: Session | null;
  /** The platform admin identity, or null. Non-null ONLY for real platform admins. */
  admin: Admin | null;
  /** True until the persisted session has been restored. */
  isLoading: boolean;
  /** True while resolving the user's roles (admin / planner) from the backend. */
  isResolvingRoles: boolean;
  /** There is a signed-in session — NOT the same as having a role. */
  isAuthenticated: boolean;
  /** The signed-in user is a real platform admin (a row in admin_users, via RLS). */
  isPlatformAdmin: boolean;
  /** The signed-in user is a wedding planner (billing_accounts.account_type). */
  isPlanner: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<Roles>(EMPTY_ROLES);

  useEffect(() => {
    // Restore any persisted session on boot.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });
    // Keep in sync with sign-in / sign-out / token refresh.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Resolve roles FROM THE BACKEND (RLS-governed). admin_users returns this
  // user's row only to admins; billing_accounts returns the user's own account
  // (owner_id = auth.uid()). Roles are never inferred from the session/JWT.
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (isLoading) return; // wait until the session restore settles
    if (!userId) {
      setRoles({ resolved: true, isAdmin: false, isPlanner: false });
      return;
    }
    let cancelled = false;
    setRoles(EMPTY_ROLES);
    Promise.all([
      supabase.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle(),
      supabase
        .from('billing_accounts')
        .select('account_type')
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .maybeSingle(),
    ]).then(([adminRes, acctRes]) => {
      if (cancelled) return;
      setRoles({
        resolved: true,
        isAdmin: !adminRes.error && !!adminRes.data,
        isPlanner: !acctRes.error && acctRes.data?.account_type === 'wedding_planner',
      });
    });
    return () => {
      cancelled = true;
    };
  }, [userId, isLoading]);

  const value = useMemo<SessionContextValue>(() => {
    const isPlatformAdmin = roles.resolved && roles.isAdmin;
    const user = session?.user;
    // Identity is exposed ONLY for confirmed platform admins; the role default is
    // therefore honest (they are admins), not fabricated for arbitrary users.
    const admin: Admin | null =
      isPlatformAdmin && user?.email
        ? { id: user.id, email: user.email, role: (user.app_metadata?.role as AdminRole | undefined) ?? 'admin' }
        : null;

    return {
      session,
      admin,
      isLoading,
      isResolvingRoles: !roles.resolved,
      isAuthenticated: !!session?.user,
      isPlatformAdmin,
      isPlanner: roles.resolved && roles.isPlanner,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [session, isLoading, roles]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
