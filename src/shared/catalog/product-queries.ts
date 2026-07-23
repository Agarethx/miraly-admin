import { supabase } from '@/shared/services/supabase';
import { DEFAULT_LOCALE } from './product';
import { DEFAULT_CATALOG_QUERY, type CatalogListQuery, type ProductSortField } from './list-query';
import { mapCatalogError, type CatalogErrorLabels } from './product-error-mapper';

const TABLE = 'billing_products';

function sortColumn(sortBy: ProductSortField): string {
  switch (sortBy) {
    case 'name':
      return `name->>${DEFAULT_LOCALE}`;
    case 'createdAt':
      return 'created_at';
    case 'status':
      return 'status';
    case 'sortOrder':
    default:
      return 'sort_order';
  }
}

/** Config a module passes so the generic queries know its shape. */
export interface ProductQueryConfig {
  productType: 'plan' | 'addon';
  select: string;
  labels?: CatalogErrorLabels;
}

/**
 * Generic paged read over `billing_products` filtered by `product_type`. Applies
 * search / status / visibility / sort / pagination on the server and returns the
 * raw rows (typed by the caller) plus the exact total.
 */
export async function queryProductPage<T>(
  config: ProductQueryConfig,
  query: CatalogListQuery,
): Promise<{ rows: T[]; total: number }> {
  let builder = supabase
    .from(TABLE)
    .select(config.select, { count: 'exact' })
    .eq('product_type', config.productType);

  if (query.status !== 'all') builder = builder.eq('status', query.status);
  if (query.visibility !== 'all') builder = builder.eq('visibility', query.visibility);
  if (query.search.trim()) {
    builder = builder.ilike(`name->>${DEFAULT_LOCALE}`, `%${query.search.trim()}%`);
  }

  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  const { data, error, count } = await builder
    .order(sortColumn(query.sortBy ?? DEFAULT_CATALOG_QUERY.sortBy), {
      ascending: query.sortDir === 'asc',
    })
    .range(from, to);

  if (error) throw mapCatalogError(error, { labels: config.labels });
  return { rows: (data ?? []) as unknown as T[], total: count ?? 0 };
}

/** Generic single-row read by id, scoped to the product type. */
export async function queryProductById<T>(config: ProductQueryConfig, id: string): Promise<T> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(config.select)
    .eq('product_type', config.productType)
    .eq('id', id)
    .single();

  if (error) throw mapCatalogError(error, { id, labels: config.labels });
  return data as unknown as T;
}
