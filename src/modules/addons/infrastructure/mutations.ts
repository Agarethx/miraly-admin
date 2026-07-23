import { supabase } from '@/shared/services/supabase';
import {
  duplicateProductBase,
  insertProductBase,
  mapCatalogError,
  reorderProducts,
  setProductStatus,
  setProductVisibility,
  updateProductBase,
  type ProductMutationConfig,
  type ProductOrder,
  type ProductStatus,
  type ProductVisibility,
} from '@/shared/catalog';
import type { AddonWriteModel } from '../domain';
import type { AddonProductRow } from './rows';

const ALLOWED = 'billing_product_allowed_addons';

/** Mutation config that binds the generic product writes to the addon resource. */
export const ADDON_MUTATION_CONFIG: ProductMutationConfig = {
  productType: 'addon',
  labels: { record: 'el addon', collection: 'el catálogo de addons' },
};

/** Rewrites the compatible-plan links of an addon (delete-all then insert). */
async function replaceCompatiblePlans(addonId: string, planIds: string[]): Promise<void> {
  const del = await supabase.from(ALLOWED).delete().eq('addon_id', addonId);
  if (del.error) throw mapCatalogError(del.error, { id: addonId, labels: ADDON_MUTATION_CONFIG.labels });
  if (planIds.length === 0) return;
  const ins = await supabase
    .from(ALLOWED)
    .insert(planIds.map((planId) => ({ plan_id: planId, addon_id: addonId })));
  if (ins.error) throw mapCatalogError(ins.error, { id: addonId, labels: ADDON_MUTATION_CONFIG.labels });
}

export async function insertAddonProduct(input: AddonWriteModel): Promise<string> {
  const id = await insertProductBase(ADDON_MUTATION_CONFIG, input);
  await replaceCompatiblePlans(id, input.compatiblePlanIds);
  return id;
}

export async function updateAddonProduct(id: string, input: AddonWriteModel): Promise<void> {
  await updateProductBase(ADDON_MUTATION_CONFIG, id, input);
  await replaceCompatiblePlans(id, input.compatiblePlanIds);
}

export const updateAddonStatus = (id: string, status: ProductStatus): Promise<void> =>
  setProductStatus(ADDON_MUTATION_CONFIG, id, status);

export const updateAddonVisibility = (id: string, visibility: ProductVisibility): Promise<void> =>
  setProductVisibility(ADDON_MUTATION_CONFIG, id, visibility);

export const updateAddonOrders = (orders: ProductOrder[]): Promise<void> =>
  reorderProducts(ADDON_MUTATION_CONFIG, orders);

/** Duplicates an addon: shared base copy + its compatible-plan links. */
export async function duplicateAddonProduct(source: AddonProductRow): Promise<string> {
  const newId = await duplicateProductBase(ADDON_MUTATION_CONFIG, source, ' (copia)');
  if (source.compatible_plans.length > 0) {
    const ins = await supabase.from(ALLOWED).insert(
      source.compatible_plans.map((c) => ({ plan_id: c.plan_id, addon_id: newId })),
    );
    if (ins.error) throw mapCatalogError(ins.error, { id: newId, labels: ADDON_MUTATION_CONFIG.labels });
  }
  return newId;
}
