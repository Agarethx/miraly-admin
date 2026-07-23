import { CatalogValidationError } from '@/shared/catalog';
import type { FeatureWriteModel } from './feature';

const CODE_RE = /^[A-Z][A-Z0-9_]*$/;

/** Feature write invariants (last line of defense behind the Zod schema). */
export function assertValidFeatureWriteModel(model: FeatureWriteModel): void {
  if (!CODE_RE.test(model.code)) {
    throw new CatalogValidationError('El código debe ser MAYÚSCULAS con guiones bajos (ej. PHOTO_UPLOAD).');
  }
  if (!model.name.trim()) {
    throw new CatalogValidationError('El nombre es obligatorio.');
  }
  if (model.sortOrder < 0 || !Number.isInteger(model.sortOrder)) {
    throw new CatalogValidationError('El orden debe ser un entero mayor o igual a cero.');
  }
}
