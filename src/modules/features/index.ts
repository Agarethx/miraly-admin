/**
 * Features module — public surface consumed by the app shell (router). The
 * data-driven registry of catalog capabilities and limits. Reuses the shared
 * catalog kernel. See docs/admin/FEATURE_MODULE.md.
 */
export {
  FeatureListPage,
  CreateFeaturePage,
  EditFeaturePage,
  FeatureDetailPage,
} from './presentation/pages';

export { featureRoutes, FEATURE_CODE_PARAM } from './presentation/routes';
