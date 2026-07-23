import type { Entitlement, Money, ValueType } from '@/shared/catalog';
import type { ResolvedEntitlement } from './event-billing';

/**
 * EventPricingService — the pure, deterministic commercial resolver for the
 * admin. It mirrors the mobile `PricingEngine` fold (same rules, no branching per
 * plan name) using the Billing 1.4 entitlement model. Kept in the admin because
 * the two apps cannot share a TS module; the algorithm is identical (see
 * docs/admin/EVENT_PRICING.md). Never invents business rules; never reads names.
 */

/** A catalog product reduced to what pricing/resolution needs. */
export interface BillingCatalogProduct {
  id: string;
  productType: 'plan' | 'addon';
  label: string;
  prices: Money[];
  entitlements: Entitlement[];
}

export interface PricingLine {
  productId: string;
  label: string;
  priceMinor: number;
}

export interface EventPricing {
  currency: string;
  estimatedPriceMinor: number;
  lines: PricingLine[];
}

function priceIn(prices: Money[], currency: string): number {
  const match = prices.find((p) => p.currency === currency && p.region === null)
    ?? prices.find((p) => p.currency === currency);
  return match ? match.amountMinor : 0;
}

/** Estimated total = sum of each product's price in the target currency. */
export function estimateEventPrice(products: BillingCatalogProduct[], currency: string): EventPricing {
  const lines: PricingLine[] = products.map((p) => ({
    productId: p.id,
    label: p.label,
    priceMinor: priceIn(p.prices, currency),
  }));
  return {
    currency,
    estimatedPriceMinor: lines.reduce((sum, l) => sum + l.priceMinor, 0),
    lines,
  };
}

function entitlementValue(e: Entitlement): number | boolean | string | unknown | null {
  switch (e.valueType) {
    case 'BOOLEAN': return e.valueBool;
    case 'INTEGER': return e.valueInt;
    case 'DECIMAL': return e.valueDecimal;
    case 'STRING': return e.valueText;
    case 'JSON': return e.valueJson;
    case 'UNLIMITED': return null;
  }
}

/**
 * Resolve the effective entitlements by folding the plan's + addons' entitlements
 * per feature, in order (plan first). Folding rules by mode:
 *   - boolean:   OR (union of capabilities)
 *   - increment: sum, or MAX when the feature's aggregation is 'max'
 *   - override / replace: last wins (addons override the plan)
 *   - UNLIMITED: any UNLIMITED wins (no cap)
 */
export function resolveEventEntitlements(
  plan: BillingCatalogProduct | null,
  addons: BillingCatalogProduct[],
  aggregationByFeature: ReadonlyMap<string, 'sum' | 'max'>,
): ResolvedEntitlement[] {
  const ordered = [...(plan ? plan.entitlements : []), ...addons.flatMap((a) => a.entitlements)];
  const byFeature = new Map<string, ResolvedEntitlement>();

  for (const e of ordered) {
    const prev = byFeature.get(e.featureCode);
    const valueType: ValueType = prev?.valueType ?? e.valueType;

    if (e.valueType === 'UNLIMITED') {
      byFeature.set(e.featureCode, { featureCode: e.featureCode, valueType, value: null, unlimited: true });
      continue;
    }
    if (prev?.unlimited) continue; // unlimited already wins

    if (e.mode === 'boolean') {
      const value = Boolean(prev?.value) || Boolean(e.valueBool);
      byFeature.set(e.featureCode, { featureCode: e.featureCode, valueType, value, unlimited: false });
      continue;
    }
    if (e.mode === 'increment') {
      const add = (e.valueType === 'INTEGER' ? e.valueInt : e.valueDecimal) ?? 0;
      const base = typeof prev?.value === 'number' ? prev.value : 0;
      const aggregation = aggregationByFeature.get(e.featureCode) ?? 'sum';
      const value = aggregation === 'max' ? Math.max(base, add) : base + add;
      byFeature.set(e.featureCode, { featureCode: e.featureCode, valueType, value, unlimited: false });
      continue;
    }
    // override | replace: last wins
    byFeature.set(e.featureCode, {
      featureCode: e.featureCode,
      valueType,
      value: entitlementValue(e),
      unlimited: false,
    });
  }

  return [...byFeature.values()];
}
