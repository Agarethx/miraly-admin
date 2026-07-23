/**
 * Checkout module — public surface (router). A Stripe-style checkout that
 * orchestrates Event Billing + Pricing Engine + Catalog + Orders to generate an
 * immutable Order (PENDING_PAYMENT). Consumes; never reimplements. See
 * docs/admin/CHECKOUT_MODULE.md.
 */
export { CheckoutPage } from './presentation/pages';
export { checkoutRoutes, EVENT_BILLING_ID_PARAM } from './presentation/routes';
