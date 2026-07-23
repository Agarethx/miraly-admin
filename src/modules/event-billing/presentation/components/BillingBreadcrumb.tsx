import { ResourceBreadcrumb } from '@/shared/catalog';
import { customersRoutes } from '../routes';

interface Crumb {
  label: string;
  to?: string;
}

/** Customers/Event-Billing in-page breadcrumb over the shared ResourceBreadcrumb. */
export function BillingBreadcrumb({ trail }: { trail: Crumb[] }) {
  return <ResourceBreadcrumb baseLabel="Customers" baseHref={customersRoutes.list} trail={trail} />;
}
