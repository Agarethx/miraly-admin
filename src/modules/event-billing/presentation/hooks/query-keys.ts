import type { BillingAccountListQuery } from '../../domain';

/** Centralized React Query cache keys for the Event Billing module. */
export const billingKeys = {
  accounts: ['billing', 'accounts'] as const,
  accountsList: (query: BillingAccountListQuery) => ['billing', 'accounts', 'list', query] as const,
  account: (id: string) => ['billing', 'accounts', id] as const,
  accountEvents: (id: string) => ['billing', 'accounts', id, 'events'] as const,
  eventBilling: (eventId: string) => ['billing', 'event-billing', eventId] as const,
  pricing: (planId: string | null, addonIds: string[]) =>
    ['billing', 'pricing', planId, [...addonIds].sort()] as const,
};
