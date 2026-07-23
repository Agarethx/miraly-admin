import { supabase } from '@/shared/services/supabase';
import { mapCatalogError } from '../product-error-mapper';
import type { Entitlement } from './entitlement';
import {
  ENTITLEMENT_SELECT,
  toEntitlement,
  toFeatureOption,
  type EntitlementRow,
  type FeatureOption,
  type FeatureOptionRow,
} from './rows';

const ENTITLEMENTS = 'billing_product_entitlements';
const FEATURES = 'billing_features';

/** Reads all entitlements of a product. */
export async function queryProductEntitlements(productId: string): Promise<Entitlement[]> {
  const { data, error } = await supabase
    .from(ENTITLEMENTS)
    .select(ENTITLEMENT_SELECT)
    .eq('product_id', productId)
    .order('feature_code', { ascending: true });

  if (error) throw mapCatalogError(error, { id: productId, labels: { record: 'el entitlement' } });
  return ((data ?? []) as unknown as EntitlementRow[]).map(toEntitlement);
}

/** Reads active features as options for the entitlement editor. */
export async function queryActiveFeatureOptions(): Promise<FeatureOption[]> {
  const { data, error } = await supabase
    .from(FEATURES)
    .select('code, name, value_type, unit')
    .eq('status', 'active')
    .order('sort_order', { ascending: true });

  if (error) throw mapCatalogError(error, { labels: { collection: 'el registro de features' } });
  return ((data ?? []) as FeatureOptionRow[]).map(toFeatureOption);
}
