import type { BillingMetrics, DashboardQuery } from '../domain';

/** BillingDashboardRepository — read-only aggregation of the commercial metrics. */
export interface BillingDashboardRepository {
  getMetrics(query: DashboardQuery): Promise<BillingMetrics>;
}
