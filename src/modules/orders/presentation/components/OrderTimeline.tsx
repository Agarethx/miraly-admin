import { CheckCircle2, Clock, Ban, XCircle, CircleDot } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Order } from '../../domain';
import { formatDate } from '../order-format';

interface TimelineEntry {
  icon: LucideIcon;
  label: string;
  at: string;
}

/** OrderTimeline — the lifecycle events of an order, in order. */
export function OrderTimeline({ order }: { order: Order }) {
  const entries: TimelineEntry[] = [{ icon: CircleDot, label: 'Creada', at: order.createdAt }];
  if (order.expiresAt) entries.push({ icon: Clock, label: 'Expira', at: order.expiresAt });
  if (order.paidAt) entries.push({ icon: CheckCircle2, label: 'Pagada', at: order.paidAt });
  if (order.cancelledAt) entries.push({ icon: Ban, label: 'Cancelada', at: order.cancelledAt });
  if (order.status === 'EXPIRED' && order.updatedAt) entries.push({ icon: XCircle, label: 'Expirada', at: order.updatedAt });

  return (
    <ol className="space-y-3">
      {entries.map((e, i) => (
        <li key={`${e.label}-${i}`} className="flex items-center gap-3 text-sm">
          <e.icon className="size-4 text-muted-foreground" />
          <span className="font-medium">{e.label}</span>
          <span className="ml-auto tabular-nums text-muted-foreground">{formatDate(e.at)}</span>
        </li>
      ))}
    </ol>
  );
}
