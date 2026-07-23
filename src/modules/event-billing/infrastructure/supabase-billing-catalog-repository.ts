import { supabase } from '@/shared/services/supabase';
import {
  localized,
  mapCatalogError,
  toEntitlement,
  toMoney,
  type Entitlement,
  type LocalizedText,
  type Money,
} from '@/shared/catalog';
import type { BillingCatalogRepository } from '../application';
import type { BillingCatalogProduct } from '../domain';

interface PriceRow { currency: string; amount_minor: number; region: string | null }
interface EntRow {
  feature_code: string; value_type: string; mode: string;
  value_bool: boolean | null; value_int: number | null; value_decimal: number | null;
  value_text: string | null; value_json: unknown | null;
}
interface ProductRow {
  id: string;
  product_type: string;
  name: LocalizedText;
  prices: PriceRow[];
  entitlements: EntRow[];
  allowed_addons?: { addon_id: string }[];
}

const PRODUCT_SELECT = `
  id, product_type, name,
  prices:billing_product_prices(currency, amount_minor, region),
  entitlements:billing_product_entitlements(feature_code, value_type, mode, value_bool, value_int, value_decimal, value_text, value_json)
`;

const PLAN_SELECT = `${PRODUCT_SELECT},
  allowed_addons:billing_product_allowed_addons!billing_product_allowed_addons_plan_id_fkey(addon_id)`;

function toEntitlements(rows: EntRow[]): Entitlement[] {
  // Reuse the kernel mapper; product_id is unused by the mapper.
  return rows.map((r) => toEntitlement({ product_id: '', ...r }));
}

function toCatalogProduct(row: ProductRow): BillingCatalogProduct {
  const prices: Money[] = row.prices.map(toMoney);
  return {
    id: row.id,
    productType: row.product_type === 'addon' ? 'addon' : 'plan',
    label: localized(row.name) || 'Sin nombre',
    prices,
    entitlements: toEntitlements(row.entitlements),
  };
}

/**
 * SupabaseBillingCatalogRepository — read-only access to Plans/Addons/Features
 * data for pricing & resolution. Reuses the kernel mappers (Money, Entitlement).
 * Does NOT modify Plans/Addons/Features.
 */
export class SupabaseBillingCatalogRepository implements BillingCatalogRepository {
  async listActivePlans(): Promise<{ product: BillingCatalogProduct; allowedAddonIds: string[] }[]> {
    const { data, error } = await supabase
      .from('billing_products')
      .select(PLAN_SELECT)
      .eq('product_type', 'plan')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
    if (error) throw mapCatalogError(error, { labels: { collection: 'el catálogo de planes' } });

    return ((data ?? []) as unknown as ProductRow[]).map((row) => ({
      product: toCatalogProduct(row),
      allowedAddonIds: (row.allowed_addons ?? []).map((a) => a.addon_id),
    }));
  }

  async getProduct(id: string): Promise<BillingCatalogProduct> {
    const { data, error } = await supabase
      .from('billing_products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .single();
    if (error) throw mapCatalogError(error, { id, labels: { record: 'el producto' } });
    return toCatalogProduct(data as unknown as ProductRow);
  }

  async getProducts(ids: string[]): Promise<BillingCatalogProduct[]> {
    if (ids.length === 0) return [];
    const { data, error } = await supabase.from('billing_products').select(PRODUCT_SELECT).in('id', ids);
    if (error) throw mapCatalogError(error, { labels: { collection: 'los productos' } });
    return ((data ?? []) as unknown as ProductRow[]).map(toCatalogProduct);
  }

  async getFeatureAggregations(): Promise<Map<string, 'sum' | 'max'>> {
    const { data, error } = await supabase.from('billing_features').select('code, aggregation');
    if (error) throw mapCatalogError(error, { labels: { collection: 'el registro de features' } });
    const map = new Map<string, 'sum' | 'max'>();
    for (const row of (data ?? []) as { code: string; aggregation: string }[]) {
      map.set(row.code, row.aggregation === 'max' ? 'max' : 'sum');
    }
    return map;
  }
}
