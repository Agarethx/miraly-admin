import { Badge } from '@/shared/components/ui/badge';
import type { AddonCategory, AddonOption } from '../../domain';
import { checkoutMoney } from '../checkout-format';

const CATEGORY_LABEL: Record<AddonCategory, string> = {
  participants: 'Participantes',
  storage: 'Storage',
  retention: 'Retención',
  other: 'Addon',
};

/** The list of available addons the user can toggle. Live-recalculates pricing. */
export function CheckoutAddonList({
  options,
  selectedIds,
  currency,
  disabled,
  onToggle,
}: {
  options: AddonOption[];
  selectedIds: string[];
  currency: string;
  disabled?: boolean;
  onToggle: (id: string, checked: boolean) => void;
}) {
  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">Este plan no tiene addons compatibles.</p>;
  }
  const selected = new Set(selectedIds);
  return (
    <div className="space-y-2">
      {options.map((addon) => (
        <label
          key={addon.id}
          className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
        >
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={selected.has(addon.id)}
            disabled={disabled}
            onChange={(e) => onToggle(addon.id, e.target.checked)}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{addon.label}</span>
              <Badge tone="neutral">{CATEGORY_LABEL[addon.category]}</Badge>
            </div>
          </div>
          <span className="tabular-nums text-sm">{checkoutMoney(currency, addon.priceMinor)}</span>
        </label>
      ))}
    </div>
  );
}
