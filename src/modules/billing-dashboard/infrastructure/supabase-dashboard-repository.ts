import { supabase } from '@/shared/services/supabase';
import { mapCatalogError } from '@/shared/catalog';
import type { BillingDashboardRepository } from '../application';
import {
  periodStart,
  startOfMonth,
  startOfToday,
  type BillingMetrics,
  type DashboardError,
  type DashboardPeriod,
  type DashboardQuery,
  type FlowStatus,
  type RecentPayment,
  type RevenuePoint,
  type TopItem,
} from '../domain';

const LABELS = { collection: 'las métricas' };

interface SnapshotProduct {
  productId?: string | null;
  name?: string;
  unitAmountMinor?: number;
}
interface OrderSnapshot {
  plan?: SnapshotProduct | null;
  addons?: SnapshotProduct[];
}
interface PaidOrderRow {
  total_minor: number;
  currency: string;
  paid_at: string | null;
  snapshot: OrderSnapshot | null;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Groups paid orders into a top-N ranking by a snapshot accessor. */
function rank(orders: PaidOrderRow[], pick: (s: OrderSnapshot) => SnapshotProduct[]): TopItem[] {
  const byKey = new Map<string, TopItem>();
  for (const order of orders) {
    if (!order.snapshot) continue;
    for (const product of pick(order.snapshot)) {
      const label = product.name ?? 'Sin nombre';
      const key = product.productId ?? label;
      const entry = byKey.get(key) ?? { key, label, count: 0, revenueMinor: 0 };
      entry.count += 1;
      entry.revenueMinor += product.unitAmountMinor ?? 0;
      byKey.set(key, entry);
    }
  }
  return [...byKey.values()].sort((a, b) => b.revenueMinor - a.revenueMinor).slice(0, 5);
}

function buildSeries(orders: PaidOrderRow[], period: DashboardPeriod, now: Date): RevenuePoint[] {
  const days = period === 'last7' ? 7 : period === 'month' ? now.getDate() : 30;
  const byDay = new Map<string, number>();
  for (const order of orders) {
    if (order.paid_at) byDay.set(dayKey(order.paid_at), (byDay.get(dayKey(order.paid_at)) ?? 0) + order.total_minor);
  }
  const series: RevenuePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, amountMinor: byDay.get(key) ?? 0 });
  }
  return series;
}

export class SupabaseBillingDashboardRepository implements BillingDashboardRepository {
  async getMetrics(query: DashboardQuery): Promise<BillingMetrics> {
    const now = new Date();
    const todayIso = startOfToday(now);
    const monthIso = startOfMonth(now);
    const startIso = periodStart(query.period, now);

    const [activeEvents, paidEvents, pendingEvents, paidOrders, recentPayments, errors, flowStatus] =
      await Promise.all([
        this.countActiveEvents(),
        this.countPaidEvents(),
        this.countPendingEvents(),
        this.fetchPaidOrders(),
        this.fetchRecentPayments(),
        this.fetchErrors(),
        this.fetchFlowStatus(),
      ]);

    // Dominant currency; money is never summed across currencies.
    const currencyCounts = new Map<string, number>();
    for (const o of paidOrders) currencyCounts.set(o.currency, (currencyCounts.get(o.currency) ?? 0) + 1);
    const currency = [...currencyCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'USD';
    const multiCurrency = currencyCounts.size > 1;

    const scoped = paidOrders.filter((o) => o.currency === currency);
    const sum = (rows: PaidOrderRow[]) => rows.reduce((s, o) => s + o.total_minor, 0);

    const salesTodayMinor = sum(scoped.filter((o) => o.paid_at && o.paid_at >= todayIso));
    const salesMonthMinor = sum(scoped.filter((o) => o.paid_at && o.paid_at >= monthIso));
    const periodOrders = startIso ? scoped.filter((o) => o.paid_at && o.paid_at >= startIso) : scoped;
    const revenueMinor = sum(periodOrders);
    const avgTicketMinor = periodOrders.length ? Math.round(revenueMinor / periodOrders.length) : 0;

    return {
      currency,
      multiCurrency,
      salesTodayMinor,
      salesMonthMinor,
      mrrMinor: salesMonthMinor,
      revenueMinor,
      avgTicketMinor,
      paidOrders: periodOrders.length,
      activeEvents,
      paidEvents,
      pendingEvents,
      revenueSeries: buildSeries(periodOrders, query.period, now),
      topPlans: rank(periodOrders, (s) => (s.plan ? [s.plan] : [])),
      topAddons: rank(periodOrders, (s) => s.addons ?? []),
      recentPayments,
      errors,
      flowStatus,
    };
  }

  private async countActiveEvents(): Promise<number> {
    const { count, error } = await supabase
      .from('billing_event_billing')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('commercial_status', 'ACTIVE');
    if (error) throw mapCatalogError(error, { labels: LABELS });
    return count ?? 0;
  }

  private async countPaidEvents(): Promise<number> {
    const { count, error } = await supabase
      .from('billing_event_billing')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('has_paid_order', true);
    if (error) throw mapCatalogError(error, { labels: LABELS });
    return count ?? 0;
  }

  private async countPendingEvents(): Promise<number> {
    const { count, error } = await supabase
      .from('billing_event_billing')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .in('commercial_status', ['CONFIGURING', 'READY_FOR_CHECKOUT', 'PENDING_PAYMENT']);
    if (error) throw mapCatalogError(error, { labels: LABELS });
    return count ?? 0;
  }

  private async fetchPaidOrders(): Promise<PaidOrderRow[]> {
    const { data, error } = await supabase
      .from('billing_orders')
      .select('total_minor, currency, paid_at, snapshot')
      .eq('order_status', 'PAID')
      .is('deleted_at', null)
      .order('paid_at', { ascending: false })
      .limit(2000);
    if (error) throw mapCatalogError(error, { labels: LABELS });
    return (data ?? []) as unknown as PaidOrderRow[];
  }

  private async fetchRecentPayments(): Promise<RecentPayment[]> {
    const { data, error } = await supabase
      .from('billing_payments')
      .select('id, provider, status, amount_minor, currency, created_at, order:billing_orders(order_number)')
      .order('created_at', { ascending: false })
      .limit(8);
    if (error) throw mapCatalogError(error, { labels: LABELS });
    return ((data ?? []) as unknown as {
      id: string; provider: string; status: string; amount_minor: number; currency: string;
      created_at: string; order: { order_number: string } | { order_number: string }[] | null;
    }[]).map((r) => {
      const order = Array.isArray(r.order) ? r.order[0] : r.order;
      return {
        id: r.id,
        orderNumber: order?.order_number ?? null,
        provider: r.provider,
        status: r.status,
        amountMinor: r.amount_minor,
        currency: r.currency,
        createdAt: r.created_at,
      };
    });
  }

  private async fetchErrors(): Promise<DashboardError[]> {
    const [payments, webhooks] = await Promise.all([
      supabase
        .from('billing_payments')
        .select('id, status, provider, created_at')
        .in('status', ['failed', 'expired'])
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('billing_webhook_events')
        .select('id, provider, provider_ref, received_at')
        .eq('result', 'not_found')
        .order('received_at', { ascending: false })
        .limit(5),
    ]);

    const errors: DashboardError[] = [];
    if (!payments.error) {
      for (const p of (payments.data ?? []) as { id: string; status: string; provider: string; created_at: string }[]) {
        errors.push({
          id: `pay-${p.id}`,
          kind: p.status === 'expired' ? 'payment_expired' : 'payment_failed',
          message: `Pago ${p.status} (${p.provider})`,
          at: p.created_at,
        });
      }
    }
    if (!webhooks.error) {
      for (const w of (webhooks.data ?? []) as { id: string; provider: string; provider_ref: string; received_at: string }[]) {
        errors.push({
          id: `wh-${w.id}`,
          kind: 'webhook_unmatched',
          message: `Webhook sin orden asociada (${w.provider})`,
          at: w.received_at,
        });
      }
    }
    return errors.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8);
  }

  private async fetchFlowStatus(): Promise<FlowStatus> {
    const { data, error } = await supabase
      .from('billing_webhook_events')
      .select('result, received_at')
      .order('received_at', { ascending: false })
      .limit(30);
    if (error) {
      return { state: 'unknown', label: 'Sin datos', lastEventAt: null, recentSuccess: 0, recentFailures: 0 };
    }
    const rows = (data ?? []) as { result: string | null; received_at: string }[];
    const recentSuccess = rows.filter((r) => r.result === 'applied').length;
    const recentFailures = rows.filter((r) => r.result === 'not_found').length;
    const lastEventAt = rows[0]?.received_at ?? null;

    let state: FlowStatus['state'] = 'unknown';
    let label = 'Sin datos';
    if (rows.length > 0) {
      if (recentFailures > recentSuccess) {
        state = 'degraded';
        label = 'Degradado';
      } else {
        state = 'operational';
        label = 'Operativo';
      }
    }
    return { state, label, lastEventAt, recentSuccess, recentFailures };
  }
}
