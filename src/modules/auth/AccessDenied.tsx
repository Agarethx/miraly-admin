import { ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useSession } from '@/shared/providers/SessionProvider';

/**
 * AccessDenied — shown when a user is signed in but is NOT a platform admin.
 * The Backoffice is never rendered for them (no flash); they can only sign out.
 * (A dedicated planner portal will route here later; for now, a clean denial.)
 */
export function AccessDenied() {
  const { session, signOut } = useSession();
  const email = session?.user?.email;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <ShieldAlert className="size-10 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Acceso denegado</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {email ? (
            <>
              La cuenta <span className="font-medium text-foreground">{email}</span> no tiene acceso
              al panel de administración.
            </>
          ) : (
            'Tu cuenta no tiene acceso al panel de administración.'
          )}
        </p>
      </div>
      <Button variant="outline" onClick={() => void signOut()}>
        Cerrar sesión
      </Button>
    </div>
  );
}
