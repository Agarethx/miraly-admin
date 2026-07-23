import type { CatalogPage } from '@/shared/catalog';
import type { AddonSummary } from './addon';

export type {
  CatalogListQuery as AddonListQuery,
  ProductSortField as AddonSortField,
  SortDirection,
} from '@/shared/catalog';
export { DEFAULT_PAGE_SIZE, DEFAULT_CATALOG_QUERY as DEFAULT_ADDON_QUERY, pageCount } from '@/shared/catalog';

export type AddonPage = CatalogPage<AddonSummary>;
