import { Badge, type BadgeTone } from '@/shared/components/ui/badge';
import type { RecentPayment } from '../../domain';
import { dateTime, money } from '../format';

const STATUS: Record<string, { label: string; tone: BadgeTone; dot: boolean }> = {
  paid: { label: 'Pagado', tone: 'accent', dot: true },
  pending: { label: 'Pendiente', tone: 'neutral', dot: false },
  failed: { label: 'Fallido', tone: 'danger', dot: false },
  expired: { label: 'Expirado', tone: 'danger', dot: false },
};

function statusBadge(status: string) {
  const s = STATUS[status] ?? { label: status, tone: 'neutral' as BadgeTone, dot: false };
  return <Badge tone={s.tone} dot={s.dot}>{s.label}</Badge>;
}

/** The "últimos pagos" list. */
export function RecentPaymentsList({ payments }: { payments: RecentPayment[] }) {
  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin pagos recientes.</p>;
  }
  return (
    <ul className="divide-y">
      {payments.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <code className="font-mono text-xs">{p.orderNumber ?? '—'}</code>
              <span className="text-xs text-muted-foreground">{p.provider}</span>
            </div>
            <span className="text-xs text-muted-foreground">{dateTime(p.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            {statusBadge(p.status)}
            <span className="tabular-nums">{money(p.currency, p.amountMinor)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
