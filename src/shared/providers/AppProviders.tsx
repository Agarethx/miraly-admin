import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { SessionProvider } from './SessionProvider';
import { NotificationProvider } from './NotificationProvider';

/**
 * Composes every app-wide provider in one place. Order matters: Theme wraps
 * everything (it only touches <html>), Query and Session provide data/auth, and
 * Notifications sit innermost so any screen can raise a toast.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
