import {
  queryProductById,
  queryProductPage,
  type CatalogListQuery,
  type ProductQueryConfig,
} from '@/shared/catalog';
import { PLAN_SELECT, type PlanProductRow } from './rows';

/** Query config that binds the generic product reads to the plan resource. */
export const PLAN_QUERY_CONFIG: ProductQueryConfig = {
  productType: 'plan',
  select: PLAN_SELECT,
  labels: { record: 'el plan', collection: 'el catálogo de planes' },
};

export function queryPlanPage(query: CatalogListQuery) {
  return queryProductPage<PlanProductRow>(PLAN_QUERY_CONFIG, query);
}

export function queryPlanById(id: string): Promise<PlanProductRow> {
  return queryProductById<PlanProductRow>(PLAN_QUERY_CONFIG, id);
}
