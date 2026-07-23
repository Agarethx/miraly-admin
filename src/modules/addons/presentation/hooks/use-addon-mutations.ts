import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/utils/errors';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import { useOptimisticList, type ProductOrder } from '@/shared/catalog';
import {
  archiveAddon,
  createAddon,
  duplicateAddon,
  nextVisibility,
  reorderAddons,
  restoreAddon,
  toggleVisibility,
  updateAddon,
} from '../../application';
import { addonRepository } from '../../infrastructure';
import type { AddonSummary, AddonVisibility, AddonWriteModel } from '../../domain';
import { addonKeys } from './query-keys';

/**
 * useAddonMutations — every write for the module, centralized. Same shape and
 * optimistic mechanics as Plans (shared `useOptimisticList`): create/update/
 * duplicate invalidate; archive/restore/toggleVisibility/reorder patch the list
 * caches optimistically with rollback and reconciliation.
 */
export function useAddonMutations() {
  const { success, error } = useNotifications();
  const { optimisticPatch, rollback, invalidate } = useOptimisticList<AddonSummary>(addonKeys.lists());

  const create = useMutation({
    mutationFn: (input: AddonWriteModel) => createAddon(addonRepository, input),
    onSuccess: () => {
      invalidate();
      success('Addon creado correctamente.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddonWriteModel }) =>
      updateAddon(addonRepository, id, input),
    onSuccess: () => {
      invalidate();
      success('Cambios guardados.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => duplicateAddon(addonRepository, id),
    onSuccess: () => {
      invalidate();
      success('Addon duplicado como borrador.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  const archive = useMutation({
    mutationFn: (id: string) => archiveAddon(addonRepository, id),
    onMutate: (id) =>
      optimisticPatch((items) =>
        items.map((a) => (a.id === id ? { ...a, status: 'archived' as const } : a)),
      ),
    onError: (e, _id, snapshot) => {
      rollback(snapshot);
      error(getErrorMessage(e));
    },
    onSuccess: () => success('Addon archivado.'),
    onSettled: invalidate,
  });

  const restore = useMutation({
    mutationFn: (id: string) => restoreAddon(addonRepository, id),
    onMutate: (id) =>
      optimisticPatch((items) =>
        items.map((a) => (a.id === id ? { ...a, status: 'draft' as const } : a)),
      ),
    onError: (e, _id, snapshot) => {
      rollback(snapshot);
      error(getErrorMessage(e));
    },
    onSuccess: () => success('Addon restaurado como borrador.'),
    onSettled: invalidate,
  });

  const setVisibility = useMutation({
    mutationFn: ({ id, current }: { id: string; current: AddonVisibility }) =>
      toggleVisibility(addonRepository, id, current),
    onMutate: ({ id, current }) => {
      const next = nextVisibility(current);
      return optimisticPatch((items) =>
        items.map((a) => (a.id === id ? { ...a, visibility: next } : a)),
      );
    },
    onError: (e, _vars, snapshot) => {
      rollback(snapshot);
      error(getErrorMessage(e));
    },
    onSuccess: (addon) =>
      success(addon.visibility === 'public' ? 'Addon visible.' : 'Addon oculto.'),
    onSettled: invalidate,
  });

  const reorder = useMutation({
    mutationFn: (orders: ProductOrder[]) => reorderAddons(addonRepository, orders),
    onMutate: (orders) => {
      const byId = new Map(orders.map((o) => [o.id, o.sortOrder]));
      return optimisticPatch((items) =>
        [...items]
          .map((a) => (byId.has(a.id) ? { ...a, sortOrder: byId.get(a.id) as number } : a))
          .sort((x, y) => x.sortOrder - y.sortOrder),
      );
    },
    onError: (e, _orders, snapshot) => {
      rollback(snapshot);
      error(getErrorMessage(e));
    },
    onSettled: invalidate,
  });

  return { create, update, duplicate, archive, restore, setVisibility, reorder };
}
