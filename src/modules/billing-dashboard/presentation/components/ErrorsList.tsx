import { AlertTriangle, XCircle, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DashboardError } from '../../domain';
import { dateTime } from '../format';

const ICON: Record<DashboardError['kind'], LucideIcon> = {
  payment_failed: XCircle,
  payment_expired: Clock,
  webhook_unmatched: AlertTriangle,
};

/** The "errores" list (failed/expired payments, unmatched webhooks). */
export function ErrorsList({ errors }: { errors: DashboardError[] }) {
  if (errors.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin errores recientes.</p>;
  }
  return (
    <ul className="space-y-2">
      {errors.map((e) => {
        const Icon = ICON[e.kind];
        return (
          <li key={e.id} className="flex items-start gap-2 text-sm">
            <Icon className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="min-w-0">
              <p>{e.message}</p>
              <span className="text-xs text-muted-foreground">{dateTime(e.at)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
