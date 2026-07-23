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
import type { PlanWriteModel } from '../domain';
import type { PlanProductRow } from './rows';

const FEATURES = 'billing_product_feature_effects';
const ALLOWED = 'billing_product_allowed_addons';

/** Mutation config that binds the generic product writes to the plan resource. */
export const PLAN_MUTATION_CONFIG: ProductMutationConfig = {
  productType: 'plan',
  labels: { record: 'el plan', collection: 'el catálogo de planes' },
};

export const insertPlanProduct = (input: PlanWriteModel): Promise<string> =>
  insertProductBase(PLAN_MUTATION_CONFIG, input);

export const updatePlanProduct = (id: string, input: PlanWriteModel): Promise<void> =>
  updateProductBase(PLAN_MUTATION_CONFIG, id, input);

export const updatePlanStatus = (id: string, status: ProductStatus): Promise<void> =>
  setProductStatus(PLAN_MUTATION_CONFIG, id, status);

export const updatePlanVisibility = (id: string, visibility: ProductVisibility): Promise<void> =>
  setProductVisibility(PLAN_MUTATION_CONFIG, id, visibility);

export const updatePlanOrders = (orders: ProductOrder[]): Promise<void> =>
  reorderProducts(PLAN_MUTATION_CONFIG, orders);

/** Duplicates a plan: shared base copy + the plan's feature and allowed-addon links. */
export async function duplicatePlanProduct(source: PlanProductRow): Promise<string> {
  const newId = await duplicateProductBase(PLAN_MUTATION_CONFIG, source, ' (copia)');

  if (source.features.length > 0) {
    const ins = await supabase.from(FEATURES).insert(
      source.features.map((f) => ({ product_id: newId, feature_code: f.feature_code })),
    );
    if (ins.error) throw mapCatalogError(ins.error, { id: newId, labels: PLAN_MUTATION_CONFIG.labels });
  }
  if (source.allowed_addons.length > 0) {
    const ins = await supabase.from(ALLOWED).insert(
      source.allowed_addons.map((a) => ({ plan_id: newId, addon_id: a.addon_id })),
    );
    if (ins.error) throw mapCatalogError(ins.error, { id: newId, labels: PLAN_MUTATION_CONFIG.labels });
  }

  return newId;
}
