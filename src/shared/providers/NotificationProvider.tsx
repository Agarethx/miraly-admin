import {
  createContext, useCallback, useContext, useState, type ReactNode,
} from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

type NotificationKind = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  kind: NotificationKind;
  message: string;
}

interface NotificationContextValue {
  notify: (kind: NotificationKind, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info } as const;

/** Lightweight toast system (no external library). Ephemeral, auto-dismissing. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (kind: NotificationKind, message: string) => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value: NotificationContextValue = {
    notify,
    success: (m) => notify('success', m),
    error: (m) => notify('error', m),
    info: (m) => notify('info', m),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {items.map((n) => {
          const Icon = ICONS[n.kind];
          return (
            <div
              key={n.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-md border bg-popover p-3 text-sm shadow-popover animate-fade-in',
                n.kind === 'error' && 'border-destructive/40',
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 size-4 shrink-0',
                  n.kind === 'success' && 'text-foreground',
                  n.kind === 'error' && 'text-destructive',
                  n.kind === 'info' && 'text-muted-foreground',
                )}
              />
              <span className="flex-1 text-foreground">{n.message}</span>
              <button
                onClick={() => dismiss(n.id)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
