import type { CatalogPage } from '@/shared/catalog';
import type { Feature, FeatureStatus, ValueType } from './feature';

export type FeatureSortField = 'sortOrder' | 'code' | 'name' | 'createdAt';
export type { SortDirection } from '@/shared/catalog';
export { DEFAULT_PAGE_SIZE } from '@/shared/catalog';

/** Search / filter / sort / paginate contract for the Features list. */
export interface FeatureListQuery {
  search: string;
  status: FeatureStatus | 'all';
  valueType: ValueType | 'all';
  sortBy: FeatureSortField;
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export const DEFAULT_FEATURE_QUERY: FeatureListQuery = {
  search: '',
  status: 'all',
  valueType: 'all',
  sortBy: 'sortOrder',
  sortDir: 'asc',
  page: 1,
  pageSize: 20,
};

export type FeaturePage = CatalogPage<Feature>;
export { pageCount } from '@/shared/catalog';
