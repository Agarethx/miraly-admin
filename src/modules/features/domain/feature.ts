/**
 * Feature — a registry entry of the Billing catalog: a capability or a limit,
 * described by a VALUE TYPE (BOOLEAN / INTEGER / … / UNLIMITED). Data-driven:
 * adding a feature is a row, never code. Built on the shared catalog kernel
 * (`ValueType`), so Features, Plans and Addons speak the same vocabulary.
 */
import type { ValueType } from '@/shared/catalog';

export type { ValueType } from '@/shared/catalog';
export { VALUE_TYPES } from '@/shared/catalog';

export type FeatureStatus = 'active' | 'archived';
export type LimitAggregation = 'sum' | 'max';

export const FEATURE_STATUSES: readonly FeatureStatus[] = ['active', 'archived'];
export const AGGREGATIONS: readonly LimitAggregation[] = ['sum', 'max'];

/** Feature — full aggregate (list & detail; features are flat). */
export interface Feature {
  code: string;
  name: string;
  description: string | null;
  valueType: ValueType;
  status: FeatureStatus;
  /** Display unit for numeric features (bytes, days, count…). */
  unit: string | null;
  /** How the resolver folds increments across plan + addons. */
  aggregation: LimitAggregation;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

/** Write model for create/update. `code` is immutable after creation (PK). */
export interface FeatureWriteModel {
  code: string;
  name: string;
  description: string | null;
  valueType: ValueType;
  unit: string | null;
  aggregation: LimitAggregation;
  sortOrder: number;
}

/** An (code, sortOrder) pair for reordering. */
export interface FeatureOrder {
  code: string;
  sortOrder: number;
}
