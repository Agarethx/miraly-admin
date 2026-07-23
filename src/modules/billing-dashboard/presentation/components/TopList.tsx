import type { TopItem } from '../../domain';
import { money } from '../format';

/** Horizontal ranked bars (top plans / top addons). */
export function TopList({
  items,
  currency,
  emptyLabel,
}: {
  items: TopItem[];
  currency: string;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  const max = Math.max(1, ...items.map((i) => i.revenueMinor));

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key} className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate font-medium">{item.label}</span>
            <span className="tabular-nums">{money(currency, item.revenueMinor)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/70"
              style={{ width: `${(item.revenueMinor / max) * 100}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {item.count} {item.count === 1 ? 'venta' : 'ventas'}
          </div>
        </div>
      ))}
    </div>
  );
}
