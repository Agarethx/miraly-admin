import { Badge } from '@/shared/components/ui/badge';
import type { OrderItem } from '../../domain';
import { orderMoney } from '../order-format';

/** Frozen line items of an order (from the items table — no catalog dependency). */
export function OrderItemsList({ items }: { items: OrderItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin items.</p>;
  }
  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge tone={item.type === 'plan' ? 'accent' : 'solid'}>
              {item.type === 'plan' ? 'Plan' : 'Addon'}
            </Badge>
            <span className="font-medium">{item.name}</span>
            {item.quantity > 1 ? <span className="text-muted-foreground">× {item.quantity}</span> : null}
          </div>
          <span className="tabular-nums">{orderMoney(item.currency, item.unitAmountMinor * item.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}
