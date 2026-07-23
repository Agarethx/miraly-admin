/** Feature domain errors — the shared catalog errors under the module's vocabulary. */
export {
  CatalogError as FeatureError,
  CatalogNotFoundError as FeatureNotFoundError,
  CatalogForbiddenError as FeatureForbiddenError,
  CatalogValidationError as FeatureValidationError,
  CatalogRepositoryError as FeatureRepositoryError,
} from '@/shared/catalog';
