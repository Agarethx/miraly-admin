import type { CheckoutData, CheckoutPreview } from '../domain';

/** The input to place an order from the checkout. */
export interface PlaceOrderInput {
  eventId: string | null;
  accountId: string;
  eventBillingId: string;
  planId: string | null;
  addonIds: string[];
}

/**
 * CheckoutGateway — the single boundary through which checkout consumes the other
 * subdomains (Event Billing, Pricing Engine, Catalog, Orders). The implementation
 * delegates to their use cases/repositories; checkout never reimplements pricing,
 * snapshotting or order creation.
 */
export interface CheckoutGateway {
  /** Loads the event billing + plan + available addons + any open order. */
  load(eventBillingId: string): Promise<CheckoutData>;
  /** Recomputes the price breakdown + resolved entitlements for a selection. */
  computePreview(planId: string | null, addonIds: string[], currency: string): Promise<CheckoutPreview>;
  /** Persists the selection, marks ready-for-checkout and generates the Order. */
  placeOrder(input: PlaceOrderInput): Promise<{ orderId: string }>;
  /** Cancels an open order so the user can edit and regenerate. */
  cancelOpenOrder(orderId: string): Promise<void>;
}
