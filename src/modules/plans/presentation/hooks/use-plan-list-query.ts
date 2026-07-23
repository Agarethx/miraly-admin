/** Plan list query — the shared catalog list-query hook (status/visibility/sort
 * fields are identical across catalog resources). Re-exported so callers use the
 * module's name. */
export { useCatalogListQuery as usePlanListQuery } from '@/shared/catalog';
