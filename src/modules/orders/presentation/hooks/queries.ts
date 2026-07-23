import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getOrder, listOrders } from '../../application';
import { orderRepository } from '../../infrastructure';
import type { OrderListQuery } from '../../domain';
import { orderKeys } from './query-keys';

/** useOrders — the paginated Orders list. */
export function useOrders(query: OrderListQuery) {
  return useQuery({
    queryKey: orderKeys.list(query),
    queryFn: () => listOrders(orderRepository, query),
    placeholderData: keepPreviousData,
  });
}

/** useOrder — a single order (with its frozen items + snapshot). */
export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => getOrder(orderRepository, id as string),
    enabled: Boolean(id),
  });
}
