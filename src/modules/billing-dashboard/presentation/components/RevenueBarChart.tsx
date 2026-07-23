import type { RevenuePoint } from '../../domain';
import { money, shortDay } from '../format';

/**
 * RevenueBarChart — a lightweight, theme-aware bar chart (no chart library). Bars
 * are divs scaled to the max value; hover shows the day + amount.
 */
export function RevenueBarChart({ series, currency }: { series: RevenuePoint[]; currency: string }) {
  const max = Math.max(1, ...series.map((p) => p.amountMinor));
  const hasData = series.some((p) => p.amountMinor > 0);

  return (
    <div>
      <div className="flex h-40 items-end gap-0.5 border-b">
        {series.map((point) => (
          <div
            key={point.date}
            className="group relative flex h-full flex-1 items-end"
            title={`${shortDay(point.date)}: ${money(currency, point.amountMinor)}`}
          >
            <div
              className="w-full rounded-t-sm bg-foreground/80 transition-colors group-hover:bg-foreground"
              style={{ height: `${(point.amountMinor / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{series.length > 0 ? shortDay(series[0].date) : ''}</span>
        {!hasData ? <span>Sin ventas en el período</span> : null}
        <span>{series.length > 0 ? shortDay(series[series.length - 1].date) : ''}</span>
      </div>
    </div>
  );
}
