import type {
  Feature,
  FeatureListQuery,
  FeatureOrder,
  FeaturePage,
  FeatureStatus,
  FeatureWriteModel,
} from '../domain';
import type { FeatureRepository } from '../application';
import {
  insertFeature,
  queryFeatureByCode,
  queryFeaturePage,
  reorderFeatureRows,
  setFeatureStatus,
  updateFeatureRow,
} from './feature-data';

/**
 * SupabaseFeatureRepository — the Supabase adapter of the FeatureRepository port.
 * The only class in the module that touches the database. Reuses the shared
 * `mapCatalogError`; the `billing_features` table is its own data source.
 */
export class SupabaseFeatureRepository implements FeatureRepository {
  async list(query: FeatureListQuery): Promise<FeaturePage> {
    const { rows, total } = await queryFeaturePage(query);
    return { items: rows, total, page: query.page, pageSize: query.pageSize };
  }

  getByCode(code: string): Promise<Feature> {
    return queryFeatureByCode(code);
  }

  async create(input: FeatureWriteModel): Promise<Feature> {
    const code = await insertFeature(input);
    return this.getByCode(code);
  }

  async update(code: string, input: FeatureWriteModel): Promise<Feature> {
    await updateFeatureRow(code, input);
    return this.getByCode(code);
  }

  async setStatus(code: string, status: FeatureStatus): Promise<Feature> {
    await setFeatureStatus(code, status);
    return this.getByCode(code);
  }

  async reorder(orders: FeatureOrder[]): Promise<void> {
    await reorderFeatureRows(orders);
  }
}
