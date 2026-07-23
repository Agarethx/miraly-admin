/**
 * Plan domain errors — the shared catalog errors, re-exported under the module's
 * vocabulary so existing call sites are unchanged.
 */
export {
  CatalogError as PlanError,
  CatalogNotFoundError as PlanNotFoundError,
  CatalogForbiddenError as PlanForbiddenError,
  CatalogValidationError as PlanValidationError,
  CatalogRepositoryError as PlanRepositoryError,
} from '@/shared/catalog';
