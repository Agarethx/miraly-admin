import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/utils/errors';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import { useOptimisticList } from '@/shared/catalog';
import { cancelOrder, createOrder, expireOrder } from '../../application';
import { orderRepository, orderSnapshotRepository } from '../../infrastructure';
import type { Order, OrderStatus, OrderSummary } from '../../domain';
import { orderKeys } from './query-keys';

/** useCreateOrder — "Generar Orden" from an Event Billing (atomic, ends PENDING_PAYMENT). */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: (eventBillingId: string) => createOrder(orderRepository, orderSnapshotRepository, eventBillingId),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      success(`Orden ${order.orderNumber} generada.`);
    },
    onError: (e) => error(getErrorMessage(e)),
  });
}

/** Shared cancel/expire wiring: optimistic status patch on the lists + detail sync. */
function useOrderTransition(
  action: (id: string) => Promise<Order>,
  to: OrderStatus,
  successMsg: string,
) {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const { optimisticPatch, rollback, invalidate } = useOptimisticList<OrderSummary>(orderKeys.lists());

  return useMutation({
    mutationFn: (id: string) => action(id),
    onMutate: (id) =>
      optimisticPatch((items) => items.map((o) => (o.id === id ? { ...o, status: to } : o))),
    onError: (e, _id, snap) => {
      rollback(snap);
      error(getErrorMessage(e));
    },
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      success(successMsg);
    },
    onSettled: invalidate,
  });
}

/** useCancelOrder — soft cancel (only while open). */
export function useCancelOrder() {
  return useOrderTransition((id) => cancelOrder(orderRepository, id), 'CANCELLED', 'Orden cancelada.');
}

/** useExpireOrder — expire a pending order. */
export function useExpireOrder() {
  return useOrderTransition((id) => expireOrder(orderRepository, id), 'EXPIRED', 'Orden expirada.');
}
