import type { OrderListQuery } from '../../domain';

/** Centralized React Query cache keys for the Orders module. */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => ['orders', 'list'] as const,
  list: (query: OrderListQuery) => ['orders', 'list', query] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
};
