import { supabase } from '@/shared/services/supabase';
import {
  localized,
  mapCatalogError,
  queryProductById,
  queryProductPage,
  type CatalogListQuery,
  type LocalizedText,
  type ProductQueryConfig,
} from '@/shared/catalog';
import type { PlanOption } from '../domain';
import { ADDON_SELECT, type AddonProductRow } from './rows';

/** Query config that binds the generic product reads to the addon resource. */
export const ADDON_QUERY_CONFIG: ProductQueryConfig = {
  productType: 'addon',
  select: ADDON_SELECT,
  labels: { record: 'el addon', collection: 'el catálogo de addons' },
};

export function queryAddonPage(query: CatalogListQuery) {
  return queryProductPage<AddonProductRow>(ADDON_QUERY_CONFIG, query);
}

export function queryAddonById(id: string): Promise<AddonProductRow> {
  return queryProductById<AddonProductRow>(ADDON_QUERY_CONFIG, id);
}

/** Reads all plans as selectable options for the compatible-plans multi-select. */
export async function queryPlanOptions(): Promise<PlanOption[]> {
  const { data, error } = await supabase
    .from('billing_products')
    .select('id, name')
    .eq('product_type', 'plan')
    .order('sort_order', { ascending: true });

  if (error) throw mapCatalogError(error, { labels: { collection: 'el catálogo de planes' } });

  return ((data ?? []) as { id: string; name: LocalizedText }[]).map((row) => ({
    id: row.id,
    label: localized(row.name) || 'Sin nombre',
  }));
}
