import {
  assertCanChangePlan,
  assertCanTransition,
  estimateEventPrice,
  resolveEventEntitlements,
  type AccountEvent,
  type BillingAccount,
  type BillingAccountListQuery,
  type BillingAccountPage,
  type BillingCatalogProduct,
  type CommercialStatus,
  type EventBilling,
  type EventBillingConfig,
  type EventPricing,
  type ResolvedEntitlement,
} from '../domain';
import type {
  BillingAccountRepository,
  BillingCatalogRepository,
  EventBillingRepository,
} from './ports';

export function listBillingAccounts(repo: BillingAccountRepository, query: BillingAccountListQuery): Promise<BillingAccountPage> {
  return repo.list(query);
}

export function getBillingAccount(repo: BillingAccountRepository, id: string): Promise<BillingAccount> {
  return repo.getById(id);
}

export function getAccountEvents(repo: BillingAccountRepository, accountId: string): Promise<AccountEvent[]> {
  return repo.listEvents(accountId);
}

export function getEventBilling(repo: EventBillingRepository, eventId: string): Promise<EventBilling | null> {
  return repo.getByEventId(eventId);
}

/** The computed preview shown in the configurator (never persisted until save). */
export interface EventBillingPreview {
  plan: BillingCatalogProduct | null;
  addons: BillingCatalogProduct[];
  pricing: EventPricing;
  entitlements: ResolvedEntitlement[];
}

/**
 * ComputeEventBillingPreview — resolves entitlements + estimates price for a
 * plan + addons selection, using ONLY the pure pricing service (no manual maths,
 * no plan-name branching). Feeds the configurator and `useEventPricing`.
 */
export async function computeEventBillingPreview(
  catalog: BillingCatalogRepository,
  planId: string | null,
  addonIds: string[],
  currency?: string,
): Promise<EventBillingPreview> {
  const [plan, addons, aggregations] = await Promise.all([
    planId ? catalog.getProduct(planId) : Promise.resolve(null),
    Promise.all(addonIds.map((id) => catalog.getProduct(id))),
    catalog.getFeatureAggregations(),
  ]);

  const resolvedCurrency = currency ?? plan?.prices[0]?.currency ?? 'USD';
  const products = [...(plan ? [plan] : []), ...addons];
  const pricing = estimateEventPrice(products, resolvedCurrency);
  const entitlements = resolveEventEntitlements(plan, addons, aggregations);
  return { plan, addons, pricing, entitlements };
}

/**
 * ConfigureEventBilling — persists a plan + addons selection with its resolved
 * snapshot. Ensures the EventBilling row exists; enforces the paid-order rule
 * (plan can't change once paid). Does NOT pay or checkout.
 */
export async function configureEventBilling(
  ebRepo: EventBillingRepository,
  catalog: BillingCatalogRepository,
  input: { eventId: string; accountId: string; config: EventBillingConfig; currency?: string },
): Promise<EventBilling> {
  const existing = await ebRepo.getByEventId(input.eventId);
  const eb = existing ?? (await ebRepo.ensureForEvent(input.eventId, input.accountId));

  if (eb.selectedPlanId !== input.config.selectedPlanId) {
    assertCanChangePlan(eb);
  }

  const preview = await computeEventBillingPreview(
    catalog,
    input.config.selectedPlanId,
    input.config.selectedAddonIds,
    input.currency,
  );

  const snapshot = {
    currency: preview.pricing.currency,
    estimatedPriceMinor: preview.pricing.estimatedPriceMinor,
    entitlements: preview.entitlements,
  };
  const status: CommercialStatus = input.config.selectedPlanId ? 'CONFIGURING' : 'DRAFT';
  return ebRepo.saveConfiguration(eb.id, input.config, snapshot, status);
}

/** TransitionEventBilling — validated status change (rules in the state machine). */
export async function transitionEventBilling(
  repo: EventBillingRepository,
  id: string,
  to: CommercialStatus,
): Promise<EventBilling> {
  const eb = await repo.getById(id);
  assertCanTransition(eb, to);
  return repo.transition(id, to);
}
