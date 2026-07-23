import { Link } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import type { OrderSummary } from '../../domain';
import { orderRoutes } from '../routes';
import { orderMoney, formatDate } from '../order-format';
import { OrderStatusBadge } from './OrderStatusBadge';

/** OrdersTable — the Orders list. */
export function OrdersTable({ orders }: { orders: OrderSummary[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            <th className="px-3 py-2.5 text-left font-medium">Número</th>
            <th className="px-3 py-2.5 text-left font-medium">Cliente</th>
            <th className="px-3 py-2.5 text-left font-medium">Evento</th>
            <th className="px-3 py-2.5 text-left font-medium">Estado</th>
            <th className="px-3 py-2.5 text-right font-medium">Total</th>
            <th className="px-3 py-2.5 text-left font-medium">Moneda</th>
            <th className="px-3 py-2.5 text-left font-medium">Proveedor</th>
            <th className="px-3 py-2.5 text-left font-medium">Fecha</th>
            <th className="px-3 py-2.5 text-right font-medium">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className={cn('border-b transition-colors last:border-0 hover:bg-muted/30')}>
              <td className="px-3 py-2">
                <Link to={orderRoutes.detail(o.id)} className="font-mono text-xs font-medium hover:underline">
                  {o.orderNumber}
                </Link>
              </td>
              <td className="px-3 py-2">{o.customerLabel}</td>
              <td className="px-3 py-2 text-muted-foreground">{o.eventName ?? '—'}</td>
              <td className="px-3 py-2"><OrderStatusBadge status={o.status} /></td>
              <td className="px-3 py-2 text-right tabular-nums">{orderMoney(o.currency, o.totalMinor)}</td>
              <td className="px-3 py-2 text-muted-foreground">{o.currency}</td>
              <td className="px-3 py-2 text-muted-foreground">—</td>
              <td className="px-3 py-2 text-muted-foreground">{formatDate(o.createdAt)}</td>
              <td className="px-3 py-2 text-right">
                <Link to={orderRoutes.detail(o.id)} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
