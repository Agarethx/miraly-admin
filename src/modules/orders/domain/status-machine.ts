import { CatalogValidationError } from '@/shared/catalog';
import type { Order, OrderStatus } from './order';

/**
 * Order status machine + rules. Orders are immutable once PAID; only soft
 * transitions are allowed.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT: ['PAID', 'EXPIRED', 'CANCELLED'],
  PAID: ['REFUNDED'],
  EXPIRED: [],
  CANCELLED: [],
  REFUNDED: [],
};

/** An order is "open" while it can still be paid. */
export function isOpen(status: OrderStatus): boolean {
  return status === 'DRAFT' || status === 'PENDING_PAYMENT';
}

/** A PAID order is immutable; guards any attempt to change it. */
export function assertMutable(order: Pick<Order, 'status'>): void {
  if (order.status === 'PAID') {
    throw new CatalogValidationError('Una orden pagada no se puede modificar.');
  }
}

export function assertCanTransition(order: Pick<Order, 'status'>, to: OrderStatus): void {
  if (!ALLOWED_TRANSITIONS[order.status].includes(to)) {
    throw new CatalogValidationError(`Transición no permitida: ${order.status} → ${to}.`);
  }
}

/** Cancel is allowed only while the order is open (DRAFT / PENDING_PAYMENT). */
export function assertCanCancel(order: Pick<Order, 'status'>): void {
  assertCanTransition(order, 'CANCELLED');
}

/** Expire is allowed only from PENDING_PAYMENT. */
export function assertCanExpire(order: Pick<Order, 'status'>): void {
  if (order.status !== 'PENDING_PAYMENT') {
    throw new CatalogValidationError('Solo una orden pendiente de pago puede expirar.');
  }
}
