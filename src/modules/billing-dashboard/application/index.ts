import type { BillingMetrics, DashboardQuery } from '../domain';
import type { BillingDashboardRepository } from './ports';

export type { BillingDashboardRepository } from './ports';

/** GetBillingDashboard — the whole commercial console payload for a period. */
export function getBillingDashboard(
  repo: BillingDashboardRepository,
  query: DashboardQuery,
): Promise<BillingMetrics> {
  return repo.getMetrics(query);
}
