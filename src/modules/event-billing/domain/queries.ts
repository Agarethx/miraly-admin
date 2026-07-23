import type { CatalogPage } from '@/shared/catalog';
import type { AccountStatus, BillingAccountSummary } from './billing-account';

/** Search / filter / paginate contract for the Customers (accounts) list. */
export interface BillingAccountListQuery {
  search: string;
  status: AccountStatus | 'all';
  page: number;
  pageSize: number;
}

export const DEFAULT_ACCOUNT_QUERY: BillingAccountListQuery = {
  search: '',
  status: 'all',
  page: 1,
  pageSize: 20,
};

export type BillingAccountPage = CatalogPage<BillingAccountSummary>;
export { pageCount } from '@/shared/catalog';
