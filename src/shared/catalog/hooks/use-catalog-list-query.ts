import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PRODUCT_STATUSES,
  PRODUCT_VISIBILITIES,
  type ProductStatus,
  type ProductVisibility,
} from '../product';
import {
  DEFAULT_CATALOG_QUERY,
  DEFAULT_PAGE_SIZE,
  type CatalogListQuery,
  type ProductSortField,
  type SortDirection,
} from '../list-query';

const SORT_FIELDS: ProductSortField[] = ['sortOrder', 'name', 'createdAt', 'status'];

function parseStatus(value: string | null): ProductStatus | 'all' {
  return value && (PRODUCT_STATUSES as readonly string[]).includes(value)
    ? (value as ProductStatus)
    : 'all';
}

function parseVisibility(value: string | null): ProductVisibility | 'all' {
  return value && (PRODUCT_VISIBILITIES as readonly string[]).includes(value)
    ? (value as ProductVisibility)
    : 'all';
}

function parseSortBy(value: string | null): ProductSortField {
  return value && SORT_FIELDS.includes(value as ProductSortField)
    ? (value as ProductSortField)
    : DEFAULT_CATALOG_QUERY.sortBy;
}

/**
 * The single source of truth for a catalog list's search / filter / sort / page
 * state, serialized to the URL so every list view is a deep link and browser
 * back/forward just works. Fully generic across catalog resources (Plans, Addons).
 */
export function useCatalogListQuery() {
  const [params, setParams] = useSearchParams();

  const query: CatalogListQuery = useMemo(
    () => ({
      search: params.get('q') ?? '',
      status: parseStatus(params.get('status')),
      visibility: parseVisibility(params.get('visibility')),
      sortBy: parseSortBy(params.get('sortBy')),
      sortDir: params.get('sortDir') === 'desc' ? 'desc' : 'asc',
      page: Math.max(1, Number(params.get('page')) || 1),
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [params],
  );

  const patch = useCallback(
    (next: Partial<CatalogListQuery>, resetPage = true) => {
      setParams(
        (prev) => {
          const sp = new URLSearchParams(prev);
          const write = (key: string, value: string, fallback: string) => {
            if (value === fallback) sp.delete(key);
            else sp.set(key, value);
          };
          if (next.search !== undefined) write('q', next.search, '');
          if (next.status !== undefined) write('status', next.status, 'all');
          if (next.visibility !== undefined) write('visibility', next.visibility, 'all');
          if (next.sortBy !== undefined) write('sortBy', next.sortBy, DEFAULT_CATALOG_QUERY.sortBy);
          if (next.sortDir !== undefined) write('sortDir', next.sortDir, 'asc');
          if (next.page !== undefined) write('page', String(next.page), '1');
          else if (resetPage) sp.delete('page');
          return sp;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setSearch = useCallback((search: string) => patch({ search }), [patch]);
  const setStatus = useCallback((status: ProductStatus | 'all') => patch({ status }), [patch]);
  const setVisibility = useCallback(
    (visibility: ProductVisibility | 'all') => patch({ visibility }),
    [patch],
  );
  const setPage = useCallback((page: number) => patch({ page }, false), [patch]);

  const setSort = useCallback(
    (field: ProductSortField) => {
      const sortDir: SortDirection =
        query.sortBy === field && query.sortDir === 'asc' ? 'desc' : 'asc';
      patch({ sortBy: field, sortDir });
    },
    [patch, query.sortBy, query.sortDir],
  );

  const clear = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const isFiltered =
    query.search !== '' || query.status !== 'all' || query.visibility !== 'all';

  return { query, setSearch, setStatus, setVisibility, setPage, setSort, clear, isFiltered };
}
