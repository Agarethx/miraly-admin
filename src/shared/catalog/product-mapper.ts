import type { LimitEffect, Money, ProductStatus, ProductVisibility } from './product';
import type { LimitEffectRow, PriceRow, ProductRowBase } from './rows';

/**
 * Shared row → domain helpers for the common product fields. Each module's mapper
 * composes these and adds its resource-specific relations.
 */

export function toStatus(value: string): ProductStatus {
  return value === 'active' || value === 'archived' ? value : 'draft';
}

export function toVisibility(value: string): ProductVisibility {
  return value === 'private' || value === 'hidden' ? value : 'public';
}

export function toMoney(row: PriceRow): Money {
  return { currency: row.currency, amountMinor: row.amount_minor, region: row.region };
}

export function toLimits(rows: LimitEffectRow[]): LimitEffect[] {
  return rows.map((r) => ({ limitTypeCode: r.limit_type_code, deltaQty: r.delta_qty }));
}

/** Deterministic primary price: region-less first, then lowest currency code. */
export function pickPrimaryPrice(prices: Money[]): Money | null {
  if (prices.length === 0) return null;
  return [...prices].sort((a, b) => {
    if ((a.region === null) !== (b.region === null)) return a.region === null ? -1 : 1;
    return a.currency.localeCompare(b.currency);
  })[0];
}

/** The common aggregate fields every product-based domain entity carries. */
export interface ProductBaseAggregate {
  id: string;
  code: string;
  name: ProductRowBase['name'];
  description: ProductRowBase['description'];
  status: ProductStatus;
  visibility: ProductVisibility;
  sortOrder: number;
  version: number;
  prices: Money[];
  limits: LimitEffect[];
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

/** Maps the shared base fields of a product row. Modules spread this + extras. */
export function mapProductBase(row: ProductRowBase): ProductBaseAggregate {
  return {
    id: row.id,
    code: row.id,
    name: row.name,
    description: row.description,
    status: toStatus(row.status),
    visibility: toVisibility(row.visibility),
    sortOrder: row.sort_order,
    version: row.version,
    prices: row.prices.map(toMoney),
    limits: toLimits(row.limits),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
