import { supabase } from '@/shared/services/supabase';
import { mapCatalogError } from '../product-error-mapper';
import type { Entitlement } from './entitlement';
import { normalizeEntitlement } from './validation';
import { toEntitlementRow } from './rows';

const ENTITLEMENTS = 'billing_product_entitlements';

/**
 * Replaces the full entitlement set of a product (delete-all then insert). The
 * caller (a use case) has already validated the set (no duplicates, type/mode
 * compatible); values are normalized here so only the typed column is written.
 */
export async function replaceProductEntitlements(
  productId: string,
  entitlements: Entitlement[],
): Promise<void> {
  const del = await supabase.from(ENTITLEMENTS).delete().eq('product_id', productId);
  if (del.error) throw mapCatalogError(del.error, { id: productId, labels: { record: 'el entitlement' } });

  if (entitlements.length === 0) return;

  const rows = entitlements.map((e) => toEntitlementRow(productId, normalizeEntitlement(e)));
  const ins = await supabase.from(ENTITLEMENTS).insert(rows);
  if (ins.error) throw mapCatalogError(ins.error, { id: productId, labels: { record: 'el entitlement' } });
}
