import { ResourceBreadcrumb } from '@/shared/catalog';
import { featureRoutes } from '../routes';

interface Crumb {
  label: string;
  to?: string;
}

/** Feature-specific in-page breadcrumb over the shared ResourceBreadcrumb. */
export function FeatureBreadcrumb({ trail }: { trail: Crumb[] }) {
  return <ResourceBreadcrumb baseLabel="Features" baseHref={featureRoutes.list} trail={trail} />;
}
