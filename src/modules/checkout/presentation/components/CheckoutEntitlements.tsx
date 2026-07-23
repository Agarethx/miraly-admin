import { Badge } from '@/shared/components/ui/badge';
import type { CheckoutEntitlement } from '../../domain';
import { formatEntitlement, valueTypeLabel } from '../checkout-format';

/** Resolved (final) entitlements the purchase grants — from the Pricing Engine. */
export function CheckoutEntitlements({ entitlements }: { entitlements: CheckoutEntitlement[] }) {
  if (entitlements.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin entitlements (elige un plan).</p>;
  }
  return (
    <ul className="divide-y">
      {entitlements.map((e) => (
        <li key={e.featureCode} className="flex items-center justify-between gap-3 py-1.5 text-sm">
          <code className="font-mono text-xs">{e.featureCode}</code>
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{valueTypeLabel(e.valueType)}</Badge>
            <span className="tabular-nums font-medium">{formatEntitlement(e)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
