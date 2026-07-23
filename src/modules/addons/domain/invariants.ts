import { assertValidProductWriteBase, CatalogValidationError } from '@/shared/catalog';
import type { AddonWriteModel } from './addon';

/**
 * Addon write invariants — the shared product guards plus the addon-specific rule
 * that compatible plan ids must be unique.
 */
export function assertValidAddonWriteModel(model: AddonWriteModel): void {
  assertValidProductWriteBase(model);
  if (new Set(model.compatiblePlanIds).size !== model.compatiblePlanIds.length) {
    throw new CatalogValidationError('Hay planes compatibles duplicados.');
  }
}
