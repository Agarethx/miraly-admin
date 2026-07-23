import { ResourceBreadcrumb } from '@/shared/catalog';
import { orderRoutes } from '../routes';

interface Crumb {
  label: string;
  to?: string;
}

/** Order-specific in-page breadcrumb over the shared ResourceBreadcrumb. */
export function OrderBreadcrumb({ trail }: { trail: Crumb[] }) {
  return <ResourceBreadcrumb baseLabel="Orders" baseHref={orderRoutes.list} trail={trail} />;
}
