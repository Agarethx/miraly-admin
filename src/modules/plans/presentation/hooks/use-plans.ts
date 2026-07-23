import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listPlans } from '../../application';
import { planRepository } from '../../infrastructure';
import type { PlanListQuery } from '../../domain';
import { planKeys } from './query-keys';

/**
 * usePlans — the paginated list query. Keeps the previous page visible while a
 * new page/filter loads (no table flicker).
 */
export function usePlans(query: PlanListQuery) {
  return useQuery({
    queryKey: planKeys.list(query),
    queryFn: () => listPlans(planRepository, query),
    placeholderData: keepPreviousData,
  });
}
