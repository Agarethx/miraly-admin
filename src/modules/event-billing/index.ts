/**
 * Event Billing module — public surface (router). The commercial domain: Billing
 * Accounts (Customers) and per-event Event Billing (configuration + pricing).
 * Reuses the shared catalog kernel (1.3/1.4). See docs/admin/EVENT_BILLING_MODULE.md.
 */
export {
  CustomersListPage,
  CustomerDetailPage,
  EventBillingDetailPage,
  ConfigureEventBillingPage,
} from './presentation/pages';

export { customersRoutes, ACCOUNT_ID_PARAM, EVENT_ID_PARAM } from './presentation/routes';
