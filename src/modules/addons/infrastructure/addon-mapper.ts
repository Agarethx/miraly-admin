import {
  LIMIT_CODES,
  limitValue,
  mapProductBase,
  pickPrimaryPrice,
  toLimits,
} from '@/shared/catalog';
import type { Addon, AddonSummary } from '../domain';
import type { AddonProductRow } from './rows';

/**
 * AddonMapper — composes the shared base mapper with the addon's compatible-plan
 * relation. Single translation point between rows and the addon domain.
 */
export function toAddon(row: AddonProductRow): Addon {
  return {
    ...mapProductBase(row),
    compatiblePlanIds: row.compatible_plans.map((c) => c.plan_id),
  };
}

/** Flattened projection for the list table. */
export function toAddonSummary(row: AddonProductRow): AddonSummary {
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
    participants: limitValue(limits, LIMIT_CODES.guests),
    storageBytes: limitValue(limits, LIMIT_CODES.storageBytes),
    retentionDays: limitValue(limits, LIMIT_CODES.retentionDays),
    compatiblePlanCount: row.compatible_plans.length,
    createdAt: base.createdAt,
  };
}
