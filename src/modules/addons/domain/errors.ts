/** Addon domain errors — the shared catalog errors under the module's vocabulary. */
export {
  CatalogError as AddonError,
  CatalogNotFoundError as AddonNotFoundError,
  CatalogForbiddenError as AddonForbiddenError,
  CatalogValidationError as AddonValidationError,
  CatalogRepositoryError as AddonRepositoryError,
} from '@/shared/catalog';
