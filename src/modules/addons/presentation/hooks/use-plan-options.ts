import { useQuery } from '@tanstack/react-query';
import { listPlanOptions } from '../../application';
import { addonRepository } from '../../infrastructure';

/** usePlanOptions — the plans available for the compatible-plans selector. */
export function usePlanOptions() {
  return useQuery({
    queryKey: ['addons', 'plan-options'],
    queryFn: () => listPlanOptions(addonRepository),
    staleTime: 60_000,
  });
}
