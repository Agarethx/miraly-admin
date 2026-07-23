import type { EventPricing } from '../../domain';
import { formatMinor } from '../billing-format';

/** Read-only pricing breakdown: per-product lines + estimated total. */
export function PricingSummary({ pricing }: { pricing: EventPricing }) {
  return (
    <div className="space-y-2 text-sm">
      <ul className="divide-y">
        {pricing.lines.map((line) => (
          <li key={line.productId} className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">{line.label}</span>
            <span className="tabular-nums">{formatMinor(pricing.currency, line.priceMinor)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t pt-2 font-medium">
        <span>Precio estimado</span>
        <span className="tabular-nums">{formatMinor(pricing.currency, pricing.estimatedPriceMinor)}</span>
      </div>
      <p className="text-xs text-muted-foreground">Estimado. El precio final se fija en el checkout (fase futura).</p>
    </div>
  );
}
