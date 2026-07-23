/**
 * Catalog kernel — value objects shared by every `billing_products` resource
 * (Plans, Addons, …). A "product" differs only by `product_type` and its
 * resource-specific relations; the identity, money, limits and lifecycle VOs are
 * identical, so they live here and each module builds its aggregate on top.
 *
 * Extracted in Billing 1.3 to prove the Billing 1.2 design was reusable. Nothing
 * here knows about Supabase or React.
 */

export type Locale = string;
export type LocalizedText = Record<Locale, string>;
export const DEFAULT_LOCALE: Locale = 'es';

export type ProductStatus = 'draft' | 'active' | 'archived';
export type ProductVisibility = 'public' | 'private' | 'hidden';

export const PRODUCT_STATUSES: readonly ProductStatus[] = ['draft', 'active', 'archived'];
export const PRODUCT_VISIBILITIES: readonly ProductVisibility[] = ['public', 'private', 'hidden'];

/** Money — integer minor units + ISO-4217 currency, never float. */
export interface Money {
  currency: string;
  amountMinor: number;
  region: string | null;
}

/**
 * The quantitative limit dimensions catalog products configure. For a Plan these
 * are base amounts; for an Addon they are increments — same codes, same table
 * (`billing_product_limit_effects`).
 */
export const LIMIT_CODES = {
  guests: 'GUESTS',
  storageBytes: 'STORAGE_BYTES',
  retentionDays: 'RETENTION_DAYS',
} as const;

/** A single limit delta a product grants. */
export interface LimitEffect {
  limitTypeCode: string;
  deltaQty: number;
}

/** The common write payload for any catalog product (before resource extras). */
export interface ProductWriteBase {
  name: LocalizedText;
  description: LocalizedText | null;
  status: Exclude<ProductStatus, 'archived'>;
  visibility: ProductVisibility;
  sortOrder: number;
  prices: Money[];
  limits: LimitEffect[];
}

/** An (id, sortOrder) pair for reordering. */
export interface ProductOrder {
  id: string;
  sortOrder: number;
}

/** Reads a localized value with a graceful fallback to any present locale. */
export function localized(text: LocalizedText | null | undefined, locale: Locale = DEFAULT_LOCALE): string {
  if (!text) return '';
  return text[locale] ?? Object.values(text)[0] ?? '';
}

/** Picks the limit delta for a given code, or null when the product omits it. */
export function limitValue(limits: LimitEffect[], code: string): number | null {
  const found = limits.find((l) => l.limitTypeCode === code);
  return found ? found.deltaQty : null;
}

/** The next visibility for a show/hide toggle: any non-public state → public. */
export function nextVisibility(current: ProductVisibility): ProductVisibility {
  return current === 'public' ? 'hidden' : 'public';
}
