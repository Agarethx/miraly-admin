import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_ACCOUNT_QUERY, type AccountStatus, type BillingAccountListQuery } from '../../domain';

function parseStatus(v: string | null): AccountStatus | 'all' {
  return v === 'active' || v === 'suspended' || v === 'closed' ? v : 'all';
}

/** URL-synced list state for the Customers list (search + status + page). */
export function useAccountListQuery() {
  const [params, setParams] = useSearchParams();

  const query: BillingAccountListQuery = useMemo(
    () => ({
      search: params.get('q') ?? '',
      status: parseStatus(params.get('status')),
      page: Math.max(1, Number(params.get('page')) || 1),
      pageSize: DEFAULT_ACCOUNT_QUERY.pageSize,
    }),
    [params],
  );

  const patch = useCallback(
    (next: Partial<BillingAccountListQuery>, resetPage = true) => {
      setParams(
        (prev) => {
          const sp = new URLSearchParams(prev);
          const write = (k: string, v: string, fb: string) => (v === fb ? sp.delete(k) : sp.set(k, v));
          if (next.search !== undefined) write('q', next.search, '');
          if (next.status !== undefined) write('status', next.status, 'all');
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
  const setStatus = useCallback((status: AccountStatus | 'all') => patch({ status }), [patch]);
  const setPage = useCallback((page: number) => patch({ page }, false), [patch]);
  const clear = useCallback(() => setParams({}, { replace: true }), [setParams]);
  const isFiltered = query.search !== '' || query.status !== 'all';

  return { query, setSearch, setStatus, setPage, clear, isFiltered };
}
