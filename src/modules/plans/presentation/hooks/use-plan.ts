import { useQuery } from '@tanstack/react-query';
import { getPlan } from '../../application';
import { planRepository } from '../../infrastructure';
import { planKeys } from './query-keys';

/** usePlan — the full aggregate for a single plan (detail / edit). */
export function usePlan(id: string | undefined) {
  return useQuery({
    queryKey: planKeys.detail(id ?? ''),
    queryFn: () => getPlan(planRepository, id as string),
    enabled: Boolean(id),
  });
}
