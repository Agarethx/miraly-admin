import { buildProductSelect, type ProductRowBase } from '@/shared/catalog';

/**
 * Plan-specific persistence rows: the shared product base + the relations only a
 * plan carries (feature grants and allowed addons).
 */
export interface FeatureEffectRow {
  feature_code: string;
}

export interface AllowedAddonRow {
  addon_id: string;
}

export interface PlanProductRow extends ProductRowBase {
  features: FeatureEffectRow[];
  allowed_addons: AllowedAddonRow[];
}

/** Base product projection + the plan's feature and allowed-addon embeds. */
export const PLAN_SELECT = buildProductSelect(`
  features:billing_product_feature_effects(feature_code),
  allowed_addons:billing_product_allowed_addons!billing_product_allowed_addons_plan_id_fkey(addon_id)
`);
