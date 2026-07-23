import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/utils/errors';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import type { Entitlement } from './entitlement';
import { assertValidEntitlements } from './validation';
import { queryActiveFeatureOptions, queryProductEntitlements } from './queries';
import { replaceProductEntitlements } from './mutations';

export const entitlementKeys = {
  all: ['entitlements'] as const,
  product: (productId: string) => ['entitlements', 'product', productId] as const,
  featureOptions: ['entitlements', 'feature-options'] as const,
};

/** Reads a product's entitlements. */
export function useProductEntitlements(productId: string | undefined) {
  return useQuery({
    queryKey: entitlementKeys.product(productId ?? ''),
    queryFn: () => queryProductEntitlements(productId as string),
    enabled: Boolean(productId),
  });
}

/** Reads the active features available to assign. */
export function useFeatureOptions() {
  return useQuery({
    queryKey: entitlementKeys.featureOptions,
    queryFn: queryActiveFeatureOptions,
    staleTime: 60_000,
  });
}

/** Saves (replaces) a product's full entitlement set, with domain validation. */
export function useSaveEntitlements(productId: string) {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async (entitlements: Entitlement[]) => {
      assertValidEntitlements(entitlements);
      await replaceProductEntitlements(productId, entitlements);
      return entitlements;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: entitlementKeys.product(productId) });
      success('Entitlements guardados.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });
}
