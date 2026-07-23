import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/shared/services/supabase';
import type { Admin, AdminRole } from '@/shared/types/admin';

interface SessionContextValue {
  session: Session | null;
  admin: Admin | null;
  /** True until the persisted session has been restored. Gate navigation on it. */
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

/** Derive the Admin from a Supabase session. Role comes from user metadata when
 *  present, defaulting to 'admin'. RBAC is prepared but not enforced yet. */
function toAdmin(session: Session | null): Admin | null {
  const user = session?.user;
  if (!user?.email) return null;
  const role = (user.app_metadata?.role as AdminRole | undefined) ?? 'admin';
  return { id: user.id, email: user.email, role };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const value = useMemo<SessionContextValue>(() => {
    const admin = toAdmin(session);
    return {
      session,
      admin,
      isLoading,
      isAuthenticated: !!admin,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [session, isLoading]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
