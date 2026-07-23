import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listFeatures } from '../../application';
import { featureRepository } from '../../infrastructure';
import type { FeatureListQuery } from '../../domain';
import { featureKeys } from './query-keys';

/** useFeatures — the paginated list query. */
export function useFeatures(query: FeatureListQuery) {
  return useQuery({
    queryKey: [...featureKeys.lists(), query],
    queryFn: () => listFeatures(featureRepository, query),
    placeholderData: keepPreviousData,
  });
}
