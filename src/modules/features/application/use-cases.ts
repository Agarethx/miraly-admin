import { CatalogValidationError } from '@/shared/catalog';
import {
  assertValidFeatureWriteModel,
  type Feature,
  type FeatureListQuery,
  type FeatureOrder,
  type FeaturePage,
  type FeatureWriteModel,
} from '../domain';
import type { FeatureRepository } from './ports';

/** ListFeatures — paginated, filtered, sorted registry listing. */
export function listFeatures(repo: FeatureRepository, query: FeatureListQuery): Promise<FeaturePage> {
  return repo.list(query);
}

/** GetFeature — a single feature by code. */
export function getFeature(repo: FeatureRepository, code: string): Promise<Feature> {
  return repo.getByCode(code);
}

/** CreateFeature — validates invariants, then persists a new feature. */
export function createFeature(repo: FeatureRepository, input: FeatureWriteModel): Promise<Feature> {
  assertValidFeatureWriteModel(input);
  return repo.create(input);
}

/** UpdateFeature — validates invariants, then persists changes (code is immutable). */
export function updateFeature(repo: FeatureRepository, code: string, input: FeatureWriteModel): Promise<Feature> {
  assertValidFeatureWriteModel(input);
  return repo.update(code, input);
}

/** ArchiveFeature — soft retirement (status `archived`). Never deletes. */
export function archiveFeature(repo: FeatureRepository, code: string): Promise<Feature> {
  return repo.setStatus(code, 'archived');
}

/** RestoreFeature — reactivates an archived feature (status `active`). */
export function restoreFeature(repo: FeatureRepository, code: string): Promise<Feature> {
  return repo.setStatus(code, 'active');
}

/** ToggleActive — activar/desactivar switch: flips active ↔ archived. */
export function toggleActive(repo: FeatureRepository, code: string, current: Feature['status']): Promise<Feature> {
  return repo.setStatus(code, current === 'active' ? 'archived' : 'active');
}

/** ReorderFeatures — persists a new display order. */
export function reorderFeatures(repo: FeatureRepository, orders: FeatureOrder[]): Promise<void> {
  if (orders.some((o) => o.sortOrder < 0 || !Number.isInteger(o.sortOrder))) {
    throw new CatalogValidationError('El orden debe ser un entero mayor o igual a cero.');
  }
  return repo.reorder(orders);
}
