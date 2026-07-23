import type { LocalizedText } from './product';

/**
 * Persistence row shapes shared by every `billing_products` resource. Modules
 * extend `ProductRowBase` with their own embedded relations and pass the extra
 * select fragment to `buildProductSelect`.
 */
export interface PriceRow {
  currency: string;
  amount_minor: number;
  region: string | null;
}

export interface LimitEffectRow {
  limit_type_code: string;
  delta_qty: number;
}

export interface ProductRowBase {
  id: string;
  product_type: string;
  name: LocalizedText;
  description: LocalizedText | null;
  status: string;
  visibility: string;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  prices: PriceRow[];
  limits: LimitEffectRow[];
}

/**
 * Builds the PostgREST select projection for a product: the base columns +
 * prices + limits, plus any resource-specific embeds (`extra`).
 */
export function buildProductSelect(extra = ''): string {
  return `
    id, product_type, name, description, status, visibility, sort_order, version,
    created_at, updated_at, deleted_at,
    prices:billing_product_prices(currency, amount_minor, region),
    limits:billing_product_limit_effects(limit_type_code, delta_qty)${extra ? `,\n${extra}` : ''}
  `;
}
