import { Badge, type BadgeTone } from '@/shared/components/ui/badge';
import type { FlowStatus } from '../../domain';
import { dateTime } from '../format';

const TONE: Record<FlowStatus['state'], BadgeTone> = {
  operational: 'accent',
  degraded: 'danger',
  unknown: 'neutral',
};

/** Flow operational status, derived from recent webhook activity. */
export function FlowStatusCard({ status }: { status: FlowStatus }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Estado</span>
        <Badge tone={TONE[status.state]} dot={status.state === 'operational'}>
          {status.label}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Webhooks OK (recientes)</span>
        <span className="tabular-nums">{status.recentSuccess}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Sin match</span>
        <span className="tabular-nums">{status.recentFailures}</span>
      </div>
      <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
        <span>Último evento</span>
        <span>{status.lastEventAt ? dateTime(status.lastEventAt) : '—'}</span>
      </div>
    </div>
  );
}
