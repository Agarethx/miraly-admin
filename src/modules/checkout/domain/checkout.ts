import type { ValueType } from '@/shared/catalog';

/**
 * Checkout — the view model for the Stripe-style checkout. This module ORCHESTRATES
 * existing subdomains (Event Billing, Pricing Engine, Catalog, Orders); it defines
 * only its own presentation-facing types and a pure price-breakdown builder. No new
 * business logic, no new tables.
 */

/** How an addon is categorized in the price breakdown, from its entitlements. */
export type AddonCategory = 'participants' | 'storage' | 'retention' | 'other';

/** A selectable addon on the checkout. */
export interface AddonOption {
  id: string;
  label: string;
  category: AddonCategory;
  priceMinor: number;
}

/** A reference to an already-open order (only one may exist per event billing). */
export interface OpenOrderRef {
  id: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  currency: string;
}

/** Everything the checkout page needs on load. */
export interface CheckoutData {
  accountId: string;
  eventId: string | null;
  eventBillingId: string;
  commercialStatus: string;
  planId: string | null;
  planLabel: string | null;
  currency: string;
  availableAddons: AddonOption[];
  selectedAddonIds: string[];
  openOrder: OpenOrderRef | null;
}

/** A resolved entitlement shown on the checkout (from the Pricing Engine fold). */
export interface CheckoutEntitlement {
  featureCode: string;
  valueType: ValueType;
  value: number | boolean | string | unknown | null;
  unlimited: boolean;
}

/** A single line of the price breakdown. */
export interface BreakdownLine {
  key: string;
  label: string;
  amountMinor: number;
}

/** The full price breakdown (base + categorized extras + discount + tax + total). */
export interface PriceBreakdown {
  currency: string;
  base: BreakdownLine | null;
  extras: BreakdownLine[];
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
}

/** The recomputed preview shown as the user changes the selection. */
export interface CheckoutPreview {
  currency: string;
  breakdown: PriceBreakdown;
  entitlements: CheckoutEntitlement[];
  totalMinor: number;
}
