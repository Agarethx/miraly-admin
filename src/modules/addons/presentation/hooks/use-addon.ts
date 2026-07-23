import { useQuery } from '@tanstack/react-query';
import { getAddon } from '../../application';
import { addonRepository } from '../../infrastructure';
import { addonKeys } from './query-keys';

/** useAddon — the full aggregate for a single addon (detail / edit). */
export function useAddon(id: string | undefined) {
  return useQuery({
    queryKey: addonKeys.detail(id ?? ''),
    queryFn: () => getAddon(addonRepository, id as string),
    enabled: Boolean(id),
  });
}
