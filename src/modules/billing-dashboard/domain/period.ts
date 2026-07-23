/** The time window the dashboard aggregates over (filter). */
export type DashboardPeriod = 'last7' | 'last30' | 'month' | 'all';

export const DASHBOARD_PERIODS: readonly DashboardPeriod[] = ['last7', 'last30', 'month', 'all'];

export const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  last7: 'Últimos 7 días',
  last30: 'Últimos 30 días',
  month: 'Este mes',
  all: 'Todo',
};

export interface DashboardQuery {
  period: DashboardPeriod;
}

export const DEFAULT_DASHBOARD_QUERY: DashboardQuery = { period: 'last30' };

/** The inclusive lower bound (ISO) for a period, or null for 'all'. */
export function periodStart(period: DashboardPeriod, now: Date = new Date()): string | null {
  switch (period) {
    case 'last7':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'last30':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    case 'all':
      return null;
  }
}

/** Start of today (ISO). */
export function startOfToday(now: Date = new Date()): string {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

/** Start of the current month (ISO). */
export function startOfMonth(now: Date = new Date()): string {
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}
