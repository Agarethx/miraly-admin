/** Route constants + deep-link builders for Customers & Event Billing. */
export const CUSTOMERS_BASE = '/billing/customers';

export const customersRoutes = {
  list: CUSTOMERS_BASE,
  account: (accountId: string) => `${CUSTOMERS_BASE}/${accountId}`,
  eventBilling: (accountId: string, eventId: string) => `${CUSTOMERS_BASE}/${accountId}/events/${eventId}`,
  configure: (accountId: string, eventId: string) =>
    `${CUSTOMERS_BASE}/${accountId}/events/${eventId}/configure`,
} as const;

export const ACCOUNT_ID_PARAM = 'accountId';
export const EVENT_ID_PARAM = 'eventId';
