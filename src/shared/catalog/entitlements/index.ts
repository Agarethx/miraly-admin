/** Entitlements kernel — typed, data-driven "what a product grants". */
export * from './entitlement';
export * from './validation';
export * from './format';
export type { EntitlementRow, FeatureOption, FeatureOptionRow } from './rows';
export { toEntitlement, toEntitlementRow, toFeatureOption } from './rows';
export { queryProductEntitlements, queryActiveFeatureOptions } from './queries';
export { replaceProductEntitlements } from './mutations';
export {
  entitlementKeys,
  useProductEntitlements,
  useFeatureOptions,
  useSaveEntitlements,
} from './hooks';
export { EntitlementEditor } from './components/EntitlementEditor';
export { EntitlementList } from './components/EntitlementList';
export { ProductEntitlementsCard } from './components/ProductEntitlementsCard';
