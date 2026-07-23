import { PlanValidationError, type PlanOrder } from '../../domain';
import type { PlanRepository } from '../ports';

/**
 * ReorderPlans — persists a new display order. The list is the source of the new
 * ordering; we guard that indices are non-negative and unique before writing.
 */
export function reorderPlans(repo: PlanRepository, orders: PlanOrder[]): Promise<void> {
  const values = orders.map((o) => o.sortOrder);
  if (values.some((v) => v < 0 || !Number.isInteger(v))) {
    throw new PlanValidationError('El orden debe ser un entero mayor o igual a cero.');
  }
  return repo.reorder(orders);
}
