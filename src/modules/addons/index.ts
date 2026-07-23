/**
 * Addons module — public surface consumed by the app shell (router). Built on the
 * shared catalog kernel (`@/shared/catalog`); the same template as Plans. See
 * docs/admin/ADDON_ARCHITECTURE.md.
 */
export {
  AddonListPage,
  CreateAddonPage,
  EditAddonPage,
  AddonDetailPage,
} from './presentation/pages';

export { addonRoutes, ADDON_ID_PARAM } from './presentation/routes';
