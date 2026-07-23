import type { ValueType } from '@/shared/catalog';

/**
 * EventBilling — the commercial view of an event. Exactly one per event. Every
 * future purchase belongs to the EventBilling, never to the Event directly.
 * Built on `billing_event_billing` (foundation) enriched in Billing 1.5.
 */
export type CommercialStatus =
  | 'DRAFT'
  | 'CONFIGURING'
  | 'READY_FOR_CHECKOUT'
  | 'PENDING_PAYMENT'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED';

export const COMMERCIAL_STATUSES: readonly CommercialStatus[] = [
  'DRAFT', 'CONFIGURING', 'READY_FOR_CHECKOUT', 'PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED',
];

/** A resolved entitlement value (the PricingEngine fold output). JSON-serializable. */
export interface ResolvedEntitlement {
  featureCode: string;
  valueType: ValueType;
  /** Resolved value; null for UNLIMITED (see `unlimited`). */
  value: number | boolean | string | unknown | null;
  unlimited: boolean;
}

export interface EventBilling {
  id: string;
  eventId: string;
  accountId: string;
  commercialStatus: CommercialStatus;
  /** The selected plan (foundation `plan_product_id`). */
  selectedPlanId: string | null;
  selectedAddonIds: string[];
  currentEntitlements: ResolvedEntitlement[] | null;
  estimatedPriceMinor: number | null;
  finalPriceMinor: number | null;
  currency: string | null;
  expiresAt: string | null;
  activatedAt: string | null;
  cancelledAt: string | null;
  /** True once a paid Order exists (Orders arrive later). Freezes the plan. */
  hasPaidOrder: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

/** The write model the configurator produces (plan + addons). */
export interface EventBillingConfig {
  selectedPlanId: string | null;
  selectedAddonIds: string[];
}

/** A row in the account's events list. */
export interface AccountEvent {
  eventId: string;
  eventName: string;
  eventBillingId: string | null;
  commercialStatus: CommercialStatus | null;
  selectedPlanId: string | null;
}
