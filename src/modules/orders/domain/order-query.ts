import type { CatalogPage } from '@/shared/catalog';
import type { OrderStatus, OrderSummary } from './order';

/** Search / filter / paginate contract for the Orders list. */
export interface OrderListQuery {
  search: string;
  status: OrderStatus | 'all';
  page: number;
  pageSize: number;
}

export const DEFAULT_ORDER_QUERY: OrderListQuery = {
  search: '',
  status: 'all',
  page: 1,
  pageSize: 20,
};

export type OrderPage = CatalogPage<OrderSummary>;
export { pageCount, DEFAULT_PAGE_SIZE } from '@/shared/catalog';
