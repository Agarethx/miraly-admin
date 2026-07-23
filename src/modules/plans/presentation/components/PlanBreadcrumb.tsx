import { ResourceBreadcrumb } from '@/shared/catalog';
import { planRoutes } from '../routes';

interface Crumb {
  label: string;
  to?: string;
}

/** Plan-specific in-page breadcrumb over the shared ResourceBreadcrumb. */
export function PlanBreadcrumb({ trail }: { trail: Crumb[] }) {
  return <ResourceBreadcrumb baseLabel="Planes" baseHref={planRoutes.list} trail={trail} />;
}
