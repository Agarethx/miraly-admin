/** Route constants + deep-link builders for the Checkout module. */
export const CHECKOUT_BASE = '/billing/checkout';

export const checkoutRoutes = {
  forEventBilling: (eventBillingId: string) => `${CHECKOUT_BASE}/${eventBillingId}`,
} as const;

export const EVENT_BILLING_ID_PARAM = 'eventBillingId';
