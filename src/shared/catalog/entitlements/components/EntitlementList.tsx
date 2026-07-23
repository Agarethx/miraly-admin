import { Badge } from '@/shared/components/ui/badge';
import type { Entitlement } from '../entitlement';
import { formatEntitlementValue, modeLabel, valueTypeLabel } from '../format';
import type { FeatureOption } from '../rows';

/** Read-only view of a product's entitlements (detail page). */
export function EntitlementList({
  entitlements,
  featureOptions,
}: {
  entitlements: Entitlement[];
  featureOptions: FeatureOption[];
}) {
  if (entitlements.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin entitlements asignados.</p>;
  }
  const nameByCode = new Map(featureOptions.map((f) => [f.code, f.name]));

  return (
    <ul className="divide-y">
      {entitlements.map((e) => (
        <li key={e.featureCode} className="flex items-center justify-between gap-3 py-2 text-sm">
          <div className="min-w-0">
            <span className="font-medium">{nameByCode.get(e.featureCode) ?? e.featureCode}</span>
            <code className="ml-2 font-mono text-xs text-muted-foreground">{e.featureCode}</code>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{valueTypeLabel(e.valueType)}</Badge>
            <Badge tone="neutral">{modeLabel(e.mode)}</Badge>
            <span className="tabular-nums font-medium">{formatEntitlementValue(e)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
