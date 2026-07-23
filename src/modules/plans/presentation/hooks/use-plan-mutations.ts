import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/utils/errors';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import { useOptimisticList } from '@/shared/catalog';
import {
  archivePlan,
  createPlan,
  duplicatePlan,
  nextVisibility,
  reorderPlans,
  restorePlan,
  toggleVisibility,
  updatePlan,
} from '../../application';
import { planRepository } from '../../infrastructure';
import type { PlanOrder, PlanSummary, PlanVisibility, PlanWriteModel } from '../../domain';
import { planKeys } from './query-keys';

/**
 * usePlanMutations — every write for the module, centralized. Create/update/
 * duplicate invalidate; archive/restore/toggleVisibility/reorder patch the list
 * caches optimistically (shared `useOptimisticList` mechanics) with rollback and
 * reconciliation. Feedback (toasts) is emitted here so components stay logic-free.
 */
export function usePlanMutations() {
  const { success, error } = useNotifications();
  const { optimisticPatch, rollback, invalidate } = useOptimisticList<PlanSummary>(planKeys.lists());

  const create = useMutation({
    mutationFn: (input: PlanWriteModel) => createPlan(planRepository, input),
    onSuccess: () => {
      invalidate();
      success('Plan creado correctamente.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PlanWriteModel }) =>
      updatePlan(planRepository, id, input),
    onSuccess: () => {
      invalidate();
      success('Cambios guardados.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => duplicatePlan(planRepository, id),
    onSuccess: () => {
      invalidate();
      success('Plan duplicado como borrador.');
    },
    onError: (e) => error(getErrorMessage(e)),
  });

  const archive = useMutation({
    mutationFn: (id: string) => archivePlan(planRepository, id),
    onMutate: (id) =>
      optimisticPatch((items) =>
        items.map((p) => (p.id === id ? { ...p, status: 'archived' as const } : p)),
      ),
    onError: (e, _id, snapshot) => {
      rollback(snapshot);
      error(getErrorMessage(e));
    },
    onSuccess: () => success('Plan archivado.'),
    onSettled: invalidate,
  });

  const restore = useMutation({
    mutationFn: (id: string) => restorePlan(planRepository, id),
    onMutate: (id) =>
      optimisticPatch((items) =>
        items.map((p) => (p.id === id ? { ...p, status: 'draft' as const } : p)),
      ),
    onError: (e, _id, snapshot) => {
      rollback(snapshot);
      error(getErrorMessage(e));
    },
    onSuccess: () => success('Plan restaurado como borrador.'),
    onSettled: invalidate,
  });

  const setVisibility = useMutation({
    mutationFn: ({ id, current }: { id: string; current: PlanVisibility }) =>
      toggleVisibility(planRepository, id, current),
    onMutate: ({ id, current }) => {
      const next = nextVisibility(current);
      return optimisticPatch((items) =>
        items.map((p) => (p.id === id ? { ...p, visibility: next } : p)),
      );
    },
    onError: (e, _vars, snapshot) => {
      rollback(snapshot);
      error(getErrorMessage(e));
    },
    onSuccess: (plan) =>
      success(plan.visibility === 'public' ? 'Plan visible.' : 'Plan oculto.'),
    onSettled: invalidate,
  });

  const reorder = useMutation({
    mutationFn: (orders: PlanOrder[]) => reorderPlans(planRepository, orders),
    onMutate: (orders) => {
      const byId = new Map(orders.map((o) => [o.id, o.sortOrder]));
      return optimisticPatch((items) =>
        [...items]
          .map((p) => (byId.has(p.id) ? { ...p, sortOrder: byId.get(p.id) as number } : p))
          .sort((a, b) => a.sortOrder - b.sortOrder),
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
