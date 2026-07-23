import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/utils/errors';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import { useOptimisticList } from '@/shared/catalog';
import {
  archiveFeature,
  createFeature,
  reorderFeatures,
  restoreFeature,
  toggleActive,
  updateFeature,
} from '../../application';
import { featureRepository } from '../../infrastructure';
import type { Feature, FeatureOrder, FeatureStatus, FeatureWriteModel } from '../../domain';
import { featureKeys } from './query-keys';

/**
 * useFeatureMutations — every write for the module, centralized. Same optimistic
 * mechanics as Plans/Addons (shared `useOptimisticList`): create/update invalidate;
 * archive/restore/toggle/reorder patch the list caches optimistically.
 */
export function useFeatureMutations() {
  const { success, error } = useNotifications();
  const { optimisticPatch, rollback, invalidate } = useOptimisticList<Feature>(featureKeys.lists());

  const create = useMutation({
    mutationFn: (input: FeatureWriteModel) => createFeature(featureRepository, input),
    onSuccess: () => {
      invalidate();
      success('Feature creada correctamente.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  const update = useMutation({
    mutationFn: ({ code, input }: { code: string; input: FeatureWriteModel }) =>
      updateFeature(featureRepository, code, input),
    onSuccess: () => {
      invalidate();
      success('Cambios guardados.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  function patchStatus(code: string, status: FeatureStatus) {
    return optimisticPatch((items) => items.map((f) => (f.code === code ? { ...f, status } : f)));
  }

  const archive = useMutation({
    mutationFn: (code: string) => archiveFeature(featureRepository, code),
    onMutate: (code) => patchStatus(code, 'archived'),
    onError: (e, _c, snap) => { rollback(snap); error(getErrorMessage(e)); },
    onSuccess: () => success('Feature archivada.'),
    onSettled: invalidate,
  });

  const restore = useMutation({
    mutationFn: (code: string) => restoreFeature(featureRepository, code),
    onMutate: (code) => patchStatus(code, 'active'),
    onError: (e, _c, snap) => { rollback(snap); error(getErrorMessage(e)); },
    onSuccess: () => success('Feature restaurada.'),
    onSettled: invalidate,
  });

  const toggle = useMutation({
    mutationFn: ({ code, current }: { code: string; current: FeatureStatus }) =>
      toggleActive(featureRepository, code, current),
    onMutate: ({ code, current }) => patchStatus(code, current === 'active' ? 'archived' : 'active'),
    onError: (e, _v, snap) => { rollback(snap); error(getErrorMessage(e)); },
    onSuccess: (feature) => success(feature.status === 'active' ? 'Feature activada.' : 'Feature desactivada.'),
    onSettled: invalidate,
  });

  const reorder = useMutation({
    mutationFn: (orders: FeatureOrder[]) => reorderFeatures(featureRepository, orders),
    onMutate: (orders) => {
      const byCode = new Map(orders.map((o) => [o.code, o.sortOrder]));
      return optimisticPatch((items) =>
        [...items]
          .map((f) => (byCode.has(f.code) ? { ...f, sortOrder: byCode.get(f.code) as number } : f))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
    },
    onError: (e, _o, snap) => { rollback(snap); error(getErrorMessage(e)); },
    onSettled: invalidate,
  });

  return { create, update, archive, restore, toggle, reorder };
}
