import { Badge } from '@/shared/components/ui/badge';
import type { ResolvedEntitlement } from '../../domain';
import { formatResolvedValue, valueTypeLabel } from '../billing-format';

/** Read-only list of the resolved (final) entitlements of an event. */
export function ResolvedEntitlementsList({ entitlements }: { entitlements: ResolvedEntitlement[] }) {
  if (entitlements.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin entitlements resueltos (elige un plan).</p>;
  }
  return (
    <ul className="divide-y">
      {entitlements.map((e) => (
        <li key={e.featureCode} className="flex items-center justify-between gap-3 py-2 text-sm">
          <code className="font-mono text-xs">{e.featureCode}</code>
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{valueTypeLabel(e.valueType)}</Badge>
            <span className="tabular-nums font-medium">{formatResolvedValue(e)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
