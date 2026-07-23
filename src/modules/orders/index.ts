/**
 * Orders module — public surface (router). The immutable commercial contract.
 * Reuses Event Billing + the Pricing Engine to freeze a purchase snapshot. See
 * docs/admin/ORDER_MODULE.md.
 */
export { OrderListPage, OrderDetailPage, GenerateOrderPage } from './presentation/pages';
export { orderRoutes, ORDER_ID_PARAM, EVENT_BILLING_ID_PARAM } from './presentation/routes';
