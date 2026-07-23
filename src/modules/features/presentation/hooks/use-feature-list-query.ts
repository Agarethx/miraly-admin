import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VALUE_TYPES, type ValueType } from '@/shared/catalog';
import {
  DEFAULT_FEATURE_QUERY,
  type FeatureListQuery,
  type FeatureSortField,
  type FeatureStatus,
} from '../../domain';

const SORT_FIELDS: FeatureSortField[] = ['sortOrder', 'code', 'name', 'createdAt'];

function parseStatus(v: string | null): FeatureStatus | 'all' {
  return v === 'active' || v === 'archived' ? v : 'all';
}
function parseValueType(v: string | null): ValueType | 'all' {
  return v && (VALUE_TYPES as readonly string[]).includes(v) ? (v as ValueType) : 'all';
}
function parseSortBy(v: string | null): FeatureSortField {
  return v && SORT_FIELDS.includes(v as FeatureSortField) ? (v as FeatureSortField) : 'sortOrder';
}

/**
 * useFeatureListQuery — URL-synced list state for Features. Same pattern as the
 * catalog list query but with feature facets (status + valueType instead of
 * visibility), so it is its own small hook.
 */
export function useFeatureListQuery() {
  const [params, setParams] = useSearchParams();

  const query: FeatureListQuery = useMemo(
    () => ({
      search: params.get('q') ?? '',
      status: parseStatus(params.get('status')),
      valueType: parseValueType(params.get('type')),
      sortBy: parseSortBy(params.get('sortBy')),
      sortDir: params.get('sortDir') === 'desc' ? 'desc' : 'asc',
      page: Math.max(1, Number(params.get('page')) || 1),
      pageSize: DEFAULT_FEATURE_QUERY.pageSize,
    }),
    [params],
  );

  const patch = useCallback(
    (next: Partial<FeatureListQuery>, resetPage = true) => {
      setParams(
        (prev) => {
          const sp = new URLSearchParams(prev);
          const write = (k: string, v: string, fb: string) => (v === fb ? sp.delete(k) : sp.set(k, v));
          if (next.search !== undefined) write('q', next.search, '');
          if (next.status !== undefined) write('status', next.status, 'all');
          if (next.valueType !== undefined) write('type', next.valueType, 'all');
          if (next.sortBy !== undefined) write('sortBy', next.sortBy, 'sortOrder');
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
  const setStatus = useCallback((status: FeatureStatus | 'all') => patch({ status }), [patch]);
  const setValueType = useCallback((valueType: ValueType | 'all') => patch({ valueType }), [patch]);
  const setPage = useCallback((page: number) => patch({ page }, false), [patch]);
  const setSort = useCallback(
    (field: FeatureSortField) => {
      const sortDir = query.sortBy === field && query.sortDir === 'asc' ? 'desc' : 'asc';
      patch({ sortBy: field, sortDir });
    },
    [patch, query.sortBy, query.sortDir],
  );
  const clear = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const isFiltered = query.search !== '' || query.status !== 'all' || query.valueType !== 'all';

  return { query, setSearch, setStatus, setValueType, setPage, setSort, clear, isFiltered };
}
