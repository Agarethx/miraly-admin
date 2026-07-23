import type { Money } from '../product';
import { cn } from '@/shared/utils/cn';
import { formatMoney } from '../format';

/** Renders a Money value; optional muted currency suffix. Shared by catalog lists. */
export function ProductPrice({
  price,
  showCurrency = false,
  className,
}: {
  price: Money | null;
  showCurrency?: boolean;
  className?: string;
}) {
  if (!price) return <span className={cn('text-muted-foreground', className)}>—</span>;
  return (
    <span className={cn('tabular-nums', className)}>
      {formatMoney(price)}
      {showCurrency ? (
        <span className="ml-1 text-xs text-muted-foreground">{price.currency}</span>
      ) : null}
    </span>
  );
}
