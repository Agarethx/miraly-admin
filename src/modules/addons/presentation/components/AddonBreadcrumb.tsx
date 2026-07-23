import { ResourceBreadcrumb } from '@/shared/catalog';
import { addonRoutes } from '../routes';

interface Crumb {
  label: string;
  to?: string;
}

/** Addon-specific in-page breadcrumb over the shared ResourceBreadcrumb. */
export function AddonBreadcrumb({ trail }: { trail: Crumb[] }) {
  return <ResourceBreadcrumb baseLabel="Addons" baseHref={addonRoutes.list} trail={trail} />;
}
