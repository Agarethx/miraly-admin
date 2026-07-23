import { Badge } from '@/shared/components/ui/badge';
import type { OrderSnapshot } from '../../domain';
import { formatSnapshotValue, orderMoney, valueTypeLabel } from '../order-format';

/**
 * OrderSnapshotView — renders the FROZEN snapshot only. This is the proof of
 * immutability: it reads nothing from the catalog, so a historical order renders
 * correctly even if plans/addons/features were deleted.
 */
export function OrderSnapshotView({ snapshot }: { snapshot: OrderSnapshot }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Plan</p>
        {snapshot.plan ? (
          <div className="flex items-center justify-between">
            <span className="font-medium">{snapshot.plan.name}</span>
            <span className="tabular-nums">{orderMoney(snapshot.pricing.currency, snapshot.plan.unitAmountMinor)}</span>
          </div>
        ) : (
          <p className="text-muted-foreground">Sin plan.</p>
        )}
      </div>

      <div className="border-t pt-3">
        <p className="mb-1 text-xs text-muted-foreground">Addons</p>
        {snapshot.addons.length === 0 ? (
          <p className="text-muted-foreground">Ninguno.</p>
        ) : (
          <ul className="space-y-1">
            {snapshot.addons.map((a) => (
              <li key={`${a.productId ?? a.name}`} className="flex items-center justify-between">
                <span>{a.name}</span>
                <span className="tabular-nums">{orderMoney(snapshot.pricing.currency, a.unitAmountMinor)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t pt-3">
        <p className="mb-2 text-xs text-muted-foreground">Entitlements finales (congelados)</p>
        {snapshot.entitlements.length === 0 ? (
          <p className="text-muted-foreground">Sin entitlements.</p>
        ) : (
          <ul className="divide-y">
            {snapshot.entitlements.map((e) => (
              <li key={e.featureCode} className="flex items-center justify-between gap-3 py-1.5">
                <code className="font-mono text-xs">{e.featureCode}</code>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{valueTypeLabel(e.valueType)}</Badge>
                  <span className="tabular-nums font-medium">{formatSnapshotValue(e)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
