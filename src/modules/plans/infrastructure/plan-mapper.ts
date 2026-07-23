import {
  LIMIT_CODES,
  limitValue,
  mapProductBase,
  pickPrimaryPrice,
  toLimits,
} from '@/shared/catalog';
import type { Plan, PlanSummary } from '../domain';
import type { PlanProductRow } from './rows';

/**
 * PlanMapper — composes the shared base mapper with the plan's own relations.
 * Single translation point between persistence rows and the plan domain.
 */
export function toPlan(row: PlanProductRow): Plan {
  return {
    ...mapProductBase(row),
    featureCodes: row.features.map((f) => f.feature_code),
    allowedAddonIds: row.allowed_addons.map((a) => a.addon_id),
  };
}

/** Flattened projection for the list table. */
export function toPlanSummary(row: PlanProductRow): PlanSummary {
  const base = mapProductBase(row);
  const limits = toLimits(row.limits);
  return {
    id: base.id,
    code: base.code,
    name: base.name,
    status: base.status,
    visibility: base.visibility,
    sortOrder: base.sortOrder,
    version: base.version,
    primaryPrice: pickPrimaryPrice(base.prices),
    guests: limitValue(limits, LIMIT_CODES.guests),
    storageBytes: limitValue(limits, LIMIT_CODES.storageBytes),
    retentionDays: limitValue(limits, LIMIT_CODES.retentionDays),
    featureCount: row.features.length,
    allowedAddonCount: row.allowed_addons.length,
    createdAt: base.createdAt,
  };
}
