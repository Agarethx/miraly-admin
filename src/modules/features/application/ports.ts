import type {
  Feature,
  FeatureListQuery,
  FeatureOrder,
  FeaturePage,
  FeatureStatus,
  FeatureWriteModel,
} from '../domain';

/**
 * FeatureRepository — the port between the application and any persistence
 * adapter. Features are keyed by `code` (the PK); there is no physical delete —
 * archive/restore are status transitions.
 */
export interface FeatureRepository {
  list(query: FeatureListQuery): Promise<FeaturePage>;
  getByCode(code: string): Promise<Feature>;
  create(input: FeatureWriteModel): Promise<Feature>;
  update(code: string, input: FeatureWriteModel): Promise<Feature>;
  setStatus(code: string, status: FeatureStatus): Promise<Feature>;
  reorder(orders: FeatureOrder[]): Promise<void>;
}
