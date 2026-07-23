import { useQuery } from '@tanstack/react-query';
import { getFeature } from '../../application';
import { featureRepository } from '../../infrastructure';
import { featureKeys } from './query-keys';

/** useFeature — a single feature by code (detail / edit). */
export function useFeature(code: string | undefined) {
  return useQuery({
    queryKey: featureKeys.detail(code ?? ''),
    queryFn: () => getFeature(featureRepository, code as string),
    enabled: Boolean(code),
  });
}
