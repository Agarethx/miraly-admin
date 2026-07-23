import { Loader2 } from 'lucide-react';

/** Full-viewport loading state (e.g. while the session is restored). */
export function LoadingPage({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
