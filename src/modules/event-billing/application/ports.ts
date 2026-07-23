import type {
  AccountEvent,
  BillingAccount,
  BillingAccountListQuery,
  BillingAccountPage,
  BillingCatalogProduct,
  CommercialStatus,
  EventBilling,
  EventBillingConfig,
  ResolvedEntitlement,
} from '../domain';

/** Snapshot persisted with a saved configuration (pricing + resolved entitlements). */
export interface EventBillingSnapshot {
  currency: string;
  estimatedPriceMinor: number;
  entitlements: ResolvedEntitlement[];
}

/** BillingAccountRepository — the paying entity. */
export interface BillingAccountRepository {
  list(query: BillingAccountListQuery): Promise<BillingAccountPage>;
  getById(id: string): Promise<BillingAccount>;
  getByOwner(ownerId: string): Promise<BillingAccount | null>;
  listEvents(accountId: string): Promise<AccountEvent[]>;
}

/** EventBillingRepository — one per event; owns the commercial configuration. */
export interface EventBillingRepository {
  getByEventId(eventId: string): Promise<EventBilling | null>;
  getById(id: string): Promise<EventBilling>;
  /** Ensures a DRAFT EventBilling exists for the event; returns it. */
  ensureForEvent(eventId: string, accountId: string): Promise<EventBilling>;
  /** Persists the plan + addons + snapshot and the resulting status. */
  saveConfiguration(
    id: string,
    config: EventBillingConfig,
    snapshot: EventBillingSnapshot,
    status: CommercialStatus,
  ): Promise<EventBilling>;
  transition(id: string, status: CommercialStatus): Promise<EventBilling>;
  softDelete(id: string): Promise<void>;
}

/** Read-only catalog access for pricing/resolution (reuses Plans/Addons/Features data). */
export interface BillingCatalogRepository {
  /** Active plans as pricing inputs, with their allowed addon ids. */
  listActivePlans(): Promise<{ product: BillingCatalogProduct; allowedAddonIds: string[] }[]>;
  /** A product (plan or addon) reduced to pricing/resolution inputs. */
  getProduct(id: string): Promise<BillingCatalogProduct>;
  /** Several products at once (e.g. a plan's available addons). */
  getProducts(ids: string[]): Promise<BillingCatalogProduct[]>;
  /** feature_code → aggregation (sum | max), for the resolver's increment fold. */
  getFeatureAggregations(): Promise<Map<string, 'sum' | 'max'>>;
}
