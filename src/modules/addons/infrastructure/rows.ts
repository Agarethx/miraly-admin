import { buildProductSelect, type ProductRowBase } from '@/shared/catalog';

/**
 * Addon-specific persistence rows: the shared product base + the compatible-plans
 * relation (the addon side of `billing_product_allowed_addons`).
 */
export interface CompatiblePlanRow {
  plan_id: string;
}

export interface AddonProductRow extends ProductRowBase {
  compatible_plans: CompatiblePlanRow[];
}

/** Base product projection + the addon's compatible-plan embed (addon_id FK). */
export const ADDON_SELECT = buildProductSelect(`
  compatible_plans:billing_product_allowed_addons!billing_product_allowed_addons_addon_id_fkey(plan_id)
`);
