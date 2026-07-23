import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { useSession } from '@/shared/providers/SessionProvider';

/** Topbar — breadcrumb, theme toggle and the admin menu. Sticky. */
export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { admin, signOut } = useSession();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenSidebar}
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </Button>

      <Breadcrumb />

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Cambiar tema">
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menú de usuario">
              <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                {admin?.email?.charAt(0).toUpperCase() ?? <User className="size-4" />}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{admin?.email ?? 'Admin'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOut()}>
              <LogOut className="size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
