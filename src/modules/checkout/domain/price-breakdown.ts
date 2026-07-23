import { LIMIT_CODES } from '@/shared/catalog';
import type { AddonCategory, BreakdownLine, PriceBreakdown } from './checkout';

/**
 * Pure price-breakdown builder. Reuses the Pricing Engine's per-product amounts
 * (never recomputes prices); it only groups them into the checkout's categories.
 */
const CATEGORY_LABELS: Record<AddonCategory, string> = {
  participants: 'Extra participantes',
  storage: 'Extra Storage',
  retention: 'Extra retención',
  other: 'Otros addons',
};

const CATEGORY_ORDER: AddonCategory[] = ['participants', 'storage', 'retention', 'other'];

/** Categorizes an addon by which limit its entitlements increment. */
export function categorizeAddon(featureCodes: string[]): AddonCategory {
  if (featureCodes.includes(LIMIT_CODES.guests)) return 'participants';
  if (featureCodes.includes(LIMIT_CODES.storageBytes)) return 'storage';
  if (featureCodes.includes(LIMIT_CODES.retentionDays)) return 'retention';
  return 'other';
}

export interface BreakdownInput {
  currency: string;
  plan: { label: string; amountMinor: number } | null;
  addons: { category: AddonCategory; amountMinor: number }[];
  discountMinor: number;
  taxMinor: number;
}

/**
 * Builds the breakdown: Base (plan) + one line per non-empty addon category +
 * Descuentos + Impuestos (structure prepared) + Total.
 */
export function buildPriceBreakdown(input: BreakdownInput): PriceBreakdown {
  const base: BreakdownLine | null = input.plan
    ? { key: 'base', label: `Base — ${input.plan.label}`, amountMinor: input.plan.amountMinor }
    : null;

  const byCategory = new Map<AddonCategory, number>();
  for (const addon of input.addons) {
    byCategory.set(addon.category, (byCategory.get(addon.category) ?? 0) + addon.amountMinor);
  }
  const extras: BreakdownLine[] = CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => ({
    key: c,
    label: CATEGORY_LABELS[c],
    amountMinor: byCategory.get(c) as number,
  }));

  const subtotal = (base?.amountMinor ?? 0) + extras.reduce((s, e) => s + e.amountMinor, 0);
  const total = Math.max(0, subtotal - input.discountMinor + input.taxMinor);

  return {
    currency: input.currency,
    base,
    extras,
    subtotalMinor: subtotal,
    discountMinor: input.discountMinor,
    taxMinor: input.taxMinor,
    totalMinor: total,
  };
}
