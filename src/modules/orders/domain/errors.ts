/** Order domain errors — the shared catalog errors under the module's vocabulary. */
export {
  CatalogError as OrderError,
  CatalogNotFoundError as OrderNotFoundError,
  CatalogForbiddenError as OrderForbiddenError,
  CatalogValidationError as OrderValidationError,
  CatalogRepositoryError as OrderRepositoryError,
} from '@/shared/catalog';
