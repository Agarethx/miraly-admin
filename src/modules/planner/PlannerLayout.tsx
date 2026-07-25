import { NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { useSession } from '@/shared/providers/SessionProvider';

/**
 * PlannerLayout — the planner portal shell, deliberately simpler than the
 * Backoffice: a top header with brand + account + sign-out, and a minimal nav.
 * Dark-consistent via the shared tokens. Slice 1 nav is just "Mis eventos".
 */
export function PlannerLayout() {
  const { session, signOut } = useSession();
  const email = session?.user?.email;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          Portal Planner
        </div>

        <nav className="ml-4 hidden items-center gap-1 sm:flex">
          <NavLink
            to="/planner"
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm',
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <CalendarDays className="size-4" />
            Mis eventos
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {email ? <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span> : null}
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
