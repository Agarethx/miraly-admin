import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listAddons } from '../../application';
import { addonRepository } from '../../infrastructure';
import type { AddonListQuery } from '../../domain';
import { addonKeys } from './query-keys';

/** useAddons — the paginated list query (keeps previous page while loading). */
export function useAddons(query: AddonListQuery) {
  return useQuery({
    queryKey: addonKeys.list(query),
    queryFn: () => listAddons(addonRepository, query),
    placeholderData: keepPreviousData,
  });
}
