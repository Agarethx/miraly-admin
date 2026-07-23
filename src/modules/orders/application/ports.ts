import type {
  Order,
  OrderDraft,
  OrderListQuery,
  OrderPage,
  OrderStatus,
} from '../domain';

/** OrderRepository — persistence + reads of Orders (never physical delete). */
export interface OrderRepository {
  list(query: OrderListQuery): Promise<OrderPage>;
  getById(id: string): Promise<Order>;
  /** Persists the frozen draft atomically (order + items in one transaction). */
  create(draft: OrderDraft, expiresAt: string): Promise<Order>;
  /** Finds the open (DRAFT/PENDING_PAYMENT) order of an event billing, if any. */
  findOpenByEventBilling(eventBillingId: string): Promise<Order | null>;
  transition(id: string, to: OrderStatus): Promise<Order>;
  softDelete(id: string): Promise<void>;
}

/**
 * OrderSnapshotRepository — builds the immutable snapshot from LIVE data (Event
 * Billing + Pricing Engine). It is the single place that freezes a purchase; the
 * OrderRepository only persists the result. Reuses Event Billing + Pricing
 * (never reimplements them).
 */
export interface OrderSnapshotRepository {
  buildForEventBilling(eventBillingId: string): Promise<OrderDraft>;
}
