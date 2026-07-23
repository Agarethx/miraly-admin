import { Badge, type BadgeTone } from '@/shared/components/ui/badge';
import type { OrderStatus } from '../../domain';

const STATUS: Record<OrderStatus, { label: string; tone: BadgeTone; dot: boolean }> = {
  DRAFT: { label: 'Borrador', tone: 'neutral', dot: false },
  PENDING_PAYMENT: { label: 'Pago pendiente', tone: 'accent', dot: true },
  PAID: { label: 'Pagada', tone: 'accent', dot: true },
  EXPIRED: { label: 'Expirada', tone: 'danger', dot: false },
  CANCELLED: { label: 'Cancelada', tone: 'danger', dot: false },
  REFUNDED: { label: 'Reembolsada', tone: 'solid', dot: false },
};

/** Badge for an order's status. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, tone, dot } = STATUS[status];
  return <Badge tone={tone} dot={dot}>{label}</Badge>;
}
