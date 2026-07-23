import { Layers } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Badge } from '@/shared/components/ui/badge';
import type { PlanOption } from '../../domain';

/**
 * AddonCompatiblePlans — read-only view of the plans an addon applies to. Resolves
 * ids to labels via the loaded plan options; shows "Todos los planes" when the
 * addon covers every plan.
 */
export function AddonCompatiblePlans({
  planIds,
  options,
  variant = 'count',
  className,
}: {
  planIds: string[];
  options: PlanOption[];
  variant?: 'count' | 'list';
  className?: string;
}) {
  const coversAll = options.length > 0 && planIds.length === options.length;

  if (variant === 'count') {
    return (
      <span className={cn('flex items-center gap-1.5 text-sm text-muted-foreground', className)}>
        <Layers className="size-3.5" />
        {coversAll ? (
          <span className="text-foreground">Todos los planes</span>
        ) : (
          <>
            <span className="tabular-nums text-foreground">{planIds.length}</span> planes
          </>
        )}
      </span>
    );
  }

  if (planIds.length === 0) {
    return <span className="text-sm text-muted-foreground">No aplica a ningún plan.</span>;
  }

  if (coversAll) {
    return <Badge tone="accent">Todos los planes</Badge>;
  }

  const byId = new Map(options.map((o) => [o.id, o.label]));
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {planIds.map((id) => (
        <Badge key={id} tone="solid">
          {byId.get(id) ?? id.slice(0, 8)}
        </Badge>
      ))}
    </div>
  );
}
