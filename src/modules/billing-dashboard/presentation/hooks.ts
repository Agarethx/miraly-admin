import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBillingDashboard } from '../application';
import { billingDashboardRepository } from '../infrastructure';
import { DASHBOARD_PERIODS, type DashboardPeriod, type DashboardQuery } from '../domain';

function parsePeriod(value: string | null): DashboardPeriod {
  return value && (DASHBOARD_PERIODS as readonly string[]).includes(value)
    ? (value as DashboardPeriod)
    : 'last30';
}

/** URL-synced period filter. */
export function useDashboardFilter() {
  const [params, setParams] = useSearchParams();
  const period = parsePeriod(params.get('period'));

  const setPeriod = useCallback(
    (next: DashboardPeriod) => {
      setParams(
        (prev) => {
          const sp = new URLSearchParams(prev);
          if (next === 'last30') sp.delete('period');
          else sp.set('period', next);
          return sp;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const query: DashboardQuery = { period };
  return { query, period, setPeriod };
}

/** The dashboard metrics query. */
export function useBillingDashboard(query: DashboardQuery) {
  return useQuery({
    queryKey: ['billing-dashboard', query],
    queryFn: () => getBillingDashboard(billingDashboardRepository, query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
