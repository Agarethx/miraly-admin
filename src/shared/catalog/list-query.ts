import type { ProductStatus, ProductVisibility } from './product';

/**
 * The search / filter / sort / paginate contract shared by every catalog list.
 * Serialized verbatim to both the URL and the React Query cache keys.
 */
export interface CatalogListQuery {
  search: string;
  status: ProductStatus | 'all';
  visibility: ProductVisibility | 'all';
  sortBy: ProductSortField;
  sortDir: SortDirection;
  page: number;
  pageSize: number;
}

export type ProductSortField = 'sortOrder' | 'name' | 'createdAt' | 'status';
export type SortDirection = 'asc' | 'desc';

export const DEFAULT_PAGE_SIZE = 20;

export const DEFAULT_CATALOG_QUERY: CatalogListQuery = {
  search: '',
  status: 'all',
  visibility: 'all',
  sortBy: 'sortOrder',
  sortDir: 'asc',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

/** A page of results plus the total count for pagination controls. */
export interface CatalogPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Total number of pages for a page result. Always at least 1. */
export function pageCount<T>(page: CatalogPage<T>): number {
  return Math.max(1, Math.ceil(page.total / page.pageSize));
}
