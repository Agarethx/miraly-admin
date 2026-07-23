/** Route constants + deep-link builders for the Orders module. */
export const ORDERS_BASE = '/billing/orders';

export const orderRoutes = {
  list: ORDERS_BASE,
  detail: (id: string) => `${ORDERS_BASE}/${id}`,
  /** "Generar Orden" from an Event Billing. */
  generate: (eventBillingId: string) => `${ORDERS_BASE}/new/${eventBillingId}`,
} as const;

export const ORDER_ID_PARAM = 'orderId';
export const EVENT_BILLING_ID_PARAM = 'eventBillingId';
