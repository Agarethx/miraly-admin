/**
 * Billing Dashboard — the commercial operations console. Read-only metrics
 * aggregated from Orders, Payments, Event Billing and webhook events. No CRUD.
 */

/** A ranked item (top plans / top addons). */
export interface TopItem {
  key: string;
  label: string;
  count: number;
  revenueMinor: number;
}

/** A row of the "últimos pagos" list. */
export interface RecentPayment {
  id: string;
  orderNumber: string | null;
  provider: string;
  status: string;
  amountMinor: number;
  currency: string;
  createdAt: string;
}

/** A row of the "errores" list (failed payments / unmatched webhooks). */
export interface DashboardError {
  id: string;
  kind: 'payment_failed' | 'payment_expired' | 'webhook_unmatched';
  message: string;
  at: string;
}

/** Flow operational status, derived from recent webhook / payment activity. */
export interface FlowStatus {
  state: 'operational' | 'degraded' | 'unknown';
  label: string;
  lastEventAt: string | null;
  recentSuccess: number;
  recentFailures: number;
}

/** A point of the revenue trend chart. */
export interface RevenuePoint {
  date: string;
  amountMinor: number;
}

/**
 * The full dashboard payload. Money figures are in a single `currency` (the
 * dominant one among paid orders); amounts across currencies are never summed.
 */
export interface BillingMetrics {
  currency: string;
  /** Whether more than one currency exists among paid orders (figures show `currency` only). */
  multiCurrency: boolean;

  salesTodayMinor: number;
  salesMonthMinor: number;
  /** Monthly Recurring Revenue proxy (event model isn't subscription): current month's paid revenue. */
  mrrMinor: number;
  revenueMinor: number;
  avgTicketMinor: number;
  paidOrders: number;

  activeEvents: number;
  paidEvents: number;
  pendingEvents: number;

  revenueSeries: RevenuePoint[];
  topPlans: TopItem[];
  topAddons: TopItem[];
  recentPayments: RecentPayment[];
  errors: DashboardError[];
  flowStatus: FlowStatus;
}
