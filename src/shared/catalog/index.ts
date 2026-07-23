/**
 * Catalog kernel — the reusable core for every `billing_products` admin module
 * (Plans, Addons, …). Domain VOs, list-query contract, typed errors, the generic
 * Supabase product data-source (queries + mutations), shared mappers, and the
 * React Query hook factories. Extracted in Billing 1.3 to prove the Billing 1.2
 * design was reusable. See docs/admin/ADDON_ARCHITECTURE.md.
 */
export * from './product';
export * from './list-query';
export * from './errors';
export * from './invariants';
export * from './product-error-mapper';
export * from './rows';
export * from './product-queries';
export * from './product-mutations';
export * from './product-mapper';
export * from './format';

export { makeResourceKeys, type ResourceKeys } from './hooks/resource-keys';
export { useOptimisticList } from './hooks/use-optimistic-list';
export { useCatalogListQuery } from './hooks/use-catalog-list-query';

export { DataPagination } from './components/DataPagination';
export { ProductStatusBadge } from './components/ProductStatusBadge';
export { ProductVisibilityBadge } from './components/ProductVisibilityBadge';
export { ProductPrice } from './components/ProductPrice';
export { ProductLimits, type LimitLabels } from './components/ProductLimits';
export { ProductActionsMenu } from './components/ProductActionsMenu';
export { CatalogSearch } from './components/CatalogSearch';
export { CatalogFilters } from './components/CatalogFilters';
export { CatalogEmptyState } from './components/CatalogEmptyState';
export { SortHeader } from './components/SortHeader';
export { ResourceBreadcrumb } from './components/ResourceBreadcrumb';

export * from './entitlements';
