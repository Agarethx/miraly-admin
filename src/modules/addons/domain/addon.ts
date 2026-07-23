/**
 * Addon — the Backoffice view of a catalog Addon. Built on the shared catalog
 * kernel: an Addon is a `billing_products` row with `product_type = 'addon'`. Its
 * limit effects are *increments* (not base amounts) and it declares which plans
 * it applies to via `billing_product_allowed_addons` (the addon side).
 */
import type {
  LocalizedText,
  Money,
  ProductBaseAggregate,
  ProductStatus,
  ProductVisibility,
  ProductWriteBase,
} from '@/shared/catalog';

export type {
  Locale,
  LocalizedText,
  Money,
  ProductBaseAggregate,
} from '@/shared/catalog';
export {
  DEFAULT_LOCALE,
  LIMIT_CODES,
  PRODUCT_STATUSES as ADDON_STATUSES,
  PRODUCT_VISIBILITIES as ADDON_VISIBILITIES,
  localized,
  limitValue,
} from '@/shared/catalog';
export type {
  ProductStatus as AddonStatus,
  ProductVisibility as AddonVisibility,
  LimitEffect as AddonLimit,
  ProductOrder as AddonOrder,
} from '@/shared/catalog';

/** Addon write model: the shared base + the set of compatible plan ids. */
export interface AddonWriteModel extends ProductWriteBase {
  compatiblePlanIds: string[];
}

/** Addon — full aggregate used by detail / edit surfaces. */
export interface Addon extends ProductBaseAggregate {
  /** Plan ids this addon can be applied to (empty is allowed). */
  compatiblePlanIds: string[];
}

/** AddonSummary — the flattened projection the list table renders. */
export interface AddonSummary {
  id: string;
  code: string;
  name: LocalizedText;
  status: ProductStatus;
  visibility: ProductVisibility;
  sortOrder: number;
  version: number;
  primaryPrice: Money | null;
  /** Increments (delta_qty) for the three limit dimensions. */
  participants: number | null;
  storageBytes: number | null;
  retentionDays: number | null;
  compatiblePlanCount: number;
  createdAt: string;
}

/** A selectable plan option for the "compatible plans" multi-select. */
export interface PlanOption {
  id: string;
  label: string;
}
