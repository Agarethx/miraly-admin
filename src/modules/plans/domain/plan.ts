/**
 * Plan — the Backoffice view of a catalog Plan. Built on the shared catalog
 * kernel (`@/shared/catalog`): the generic product VOs (status, visibility, money,
 * limits, localized text) come from there; only Plan-specific shape lives here.
 */
import type {
  LocalizedText,
  Money,
  ProductBaseAggregate,
  ProductStatus,
  ProductVisibility,
} from '@/shared/catalog';

// Re-export the shared VOs under the module's vocabulary so existing imports
// (`from '../domain'`) keep working unchanged.
export type {
  Locale,
  LocalizedText,
  Money,
  ProductBaseAggregate,
} from '@/shared/catalog';
export {
  DEFAULT_LOCALE,
  LIMIT_CODES,
  PRODUCT_STATUSES as PLAN_STATUSES,
  PRODUCT_VISIBILITIES as PLAN_VISIBILITIES,
  localized,
  limitValue,
} from '@/shared/catalog';
export type {
  ProductStatus as PlanStatus,
  ProductVisibility as PlanVisibility,
  LimitEffect as PlanLimit,
  ProductOrder as PlanOrder,
  ProductWriteBase as PlanWriteModel,
} from '@/shared/catalog';

/** Plan — full aggregate used by detail / edit surfaces. */
export interface Plan extends ProductBaseAggregate {
  featureCodes: string[];
  allowedAddonIds: string[];
}

/** PlanSummary — the flattened projection the list table renders. */
export interface PlanSummary {
  id: string;
  code: string;
  name: LocalizedText;
  status: ProductStatus;
  visibility: ProductVisibility;
  sortOrder: number;
  version: number;
  primaryPrice: Money | null;
  guests: number | null;
  storageBytes: number | null;
  retentionDays: number | null;
  featureCount: number;
  allowedAddonCount: number;
  createdAt: string;
}
