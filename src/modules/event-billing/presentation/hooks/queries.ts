import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  computeEventBillingPreview,
  getAccountEvents,
  getBillingAccount,
  getEventBilling,
  listBillingAccounts,
} from '../../application';
import { billingAccountRepository, billingCatalogRepository, eventBillingRepository } from '../../infrastructure';
import type { BillingAccountListQuery } from '../../domain';
import { billingKeys } from './query-keys';

/** useBillingAccounts — the Customers list. */
export function useBillingAccounts(query: BillingAccountListQuery) {
  return useQuery({
    queryKey: billingKeys.accountsList(query),
    queryFn: () => listBillingAccounts(billingAccountRepository, query),
    placeholderData: keepPreviousData,
  });
}

/** useBillingAccount — a single account by id. */
export function useBillingAccount(id: string | undefined) {
  return useQuery({
    queryKey: billingKeys.account(id ?? ''),
    queryFn: () => getBillingAccount(billingAccountRepository, id as string),
    enabled: Boolean(id),
  });
}

/** useAccountEvents — the account's events (with their commercial status). */
export function useAccountEvents(accountId: string | undefined) {
  return useQuery({
    queryKey: billingKeys.accountEvents(accountId ?? ''),
    queryFn: () => getAccountEvents(billingAccountRepository, accountId as string),
    enabled: Boolean(accountId),
  });
}

/** useEventBilling — the commercial configuration of an event. */
export function useEventBilling(eventId: string | undefined) {
  return useQuery({
    queryKey: billingKeys.eventBilling(eventId ?? ''),
    queryFn: () => getEventBilling(eventBillingRepository, eventId as string),
    enabled: Boolean(eventId),
  });
}

/** useActivePlans — active plans (with their allowed addon ids) for the configurator. */
export function useActivePlans() {
  return useQuery({
    queryKey: ['billing', 'active-plans'],
    queryFn: () => billingCatalogRepository.listActivePlans(),
    staleTime: 60_000,
  });
}

/** useCatalogProducts — details for a set of product ids (e.g. a plan's addons). */
export function useCatalogProducts(ids: string[]) {
  return useQuery({
    queryKey: ['billing', 'products', [...ids].sort()],
    queryFn: () => billingCatalogRepository.getProducts(ids),
    enabled: ids.length > 0,
  });
}

/**
 * useEventPricing — resolves entitlements + estimates price for a plan + addons
 * selection using ONLY the pure pricing service. Reactive to the selection.
 */
export function useEventPricing(planId: string | null, addonIds: string[], currency?: string) {
  return useQuery({
    queryKey: [...billingKeys.pricing(planId, addonIds), currency ?? null],
    queryFn: () => computeEventBillingPreview(billingCatalogRepository, planId, addonIds, currency),
  });
}
