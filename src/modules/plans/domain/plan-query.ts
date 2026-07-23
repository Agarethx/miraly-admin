import type { CatalogPage } from '@/shared/catalog';
import type { PlanSummary } from './plan';

/**
 * Plan list contract — the generic catalog query/page from the kernel, typed to
 * PlanSummary. Re-exported under the module's names so callers are unchanged.
 */
export type {
  CatalogListQuery as PlanListQuery,
  ProductSortField as PlanSortField,
  SortDirection,
} from '@/shared/catalog';
export { DEFAULT_PAGE_SIZE, DEFAULT_CATALOG_QUERY as DEFAULT_PLAN_QUERY, pageCount } from '@/shared/catalog';

export type PlanPage = CatalogPage<PlanSummary>;
