import { CatalogValidationError, type ProductOrder } from '@/shared/catalog';
import type { AddonRepository } from '../ports';

/** ReorderAddons — persists a new display order (guards non-negative integers). */
export function reorderAddons(repo: AddonRepository, orders: ProductOrder[]): Promise<void> {
  if (orders.some((o) => o.sortOrder < 0 || !Number.isInteger(o.sortOrder))) {
    throw new CatalogValidationError('El orden debe ser un entero mayor o igual a cero.');
  }
  return repo.reorder(orders);
}
