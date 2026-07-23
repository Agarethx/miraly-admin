import {
  Loader2, AlertTriangle, DollarSign, CalendarClock, Repeat, Ticket,
  TrendingUp, CalendarCheck, CalendarX, Download, Wallet,
} from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { StatCard } from '@/shared/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/utils/errors';
import { useBillingDashboard, useDashboardFilter } from '../hooks';
import { money } from '../format';
import { buildDashboardCsv, downloadCsv } from '../export-csv';
import {
  RevenueBarChart, TopList, RecentPaymentsList, ErrorsList, FlowStatusCard, PeriodFilter,
} from '../components';

/**
 * BillingDashboardPage — the commercial operations console. Read-only: sales, MRR,
 * events, top plans/addons, recent payments, errors, Flow status. Filters + charts
 * + CSV export. No CRUD.
 */
export function BillingDashboardPage() {
  const { query, period, setPeriod } = useDashboardFilter();
  const { data, isLoading, isError, error, refetch } = useBillingDashboard(query);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Consola comercial: ventas, revenue, eventos y estado de pagos."
        actions={
          <>
            <PeriodFilter period={period} onChange={setPeriod} />
            <Button
              variant="outline"
              disabled={!data}
              onClick={() => data && downloadCsv(`billing-${period}.csv`, buildDashboardCsv(data))}
            >
              <Download className="size-4" /> Exportar CSV
            </Button>
          </>
        }
      />

      {isLoading && !data ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando métricas…
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="No se pudieron cargar las métricas"
          description={getErrorMessage(error)}
          action={<Button variant="outline" size="sm" onClick={() => void refetch()}>Reintentar</Button>}
        />
      ) : data ? (
        <div className="space-y-6">
          {data.multiCurrency ? (
            <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
              Hay ventas en varias monedas; los importes se muestran en {data.currency} (no se suman monedas distintas).
            </p>
          ) : null}

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Ventas hoy" value={money(data.currency, data.salesTodayMinor)} icon={DollarSign} />
            <StatCard label="Ventas mes" value={money(data.currency, data.salesMonthMinor)} icon={CalendarClock} />
            <StatCard label="MRR (aprox)" value={money(data.currency, data.mrrMinor)} icon={Repeat} hint="Revenue del mes" />
            <StatCard label="Ticket promedio" value={money(data.currency, data.avgTicketMinor)} icon={Ticket} />
            <StatCard label="Revenue" value={money(data.currency, data.revenueMinor)} icon={TrendingUp} hint="Período seleccionado" />
            <StatCard label="Eventos activos" value={String(data.activeEvents)} icon={CalendarCheck} />
            <StatCard label="Eventos pagados" value={String(data.paidEvents)} icon={Wallet} />
            <StatCard label="Eventos pendientes" value={String(data.pendingEvents)} icon={CalendarX} />
          </div>

          {/* Revenue chart */}
          <Card>
            <CardHeader><CardTitle>Revenue por día</CardTitle></CardHeader>
            <CardContent><RevenueBarChart series={data.revenueSeries} currency={data.currency} /></CardContent>
          </Card>

          {/* Top plans / addons */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Top planes</CardTitle></CardHeader>
              <CardContent><TopList items={data.topPlans} currency={data.currency} emptyLabel="Sin ventas de planes." /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Top addons</CardTitle></CardHeader>
              <CardContent><TopList items={data.topAddons} currency={data.currency} emptyLabel="Sin ventas de addons." /></CardContent>
            </Card>
          </div>

          {/* Payments / errors / flow */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Últimos pagos</CardTitle></CardHeader>
              <CardContent><RecentPaymentsList payments={data.recentPayments} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Flow status</CardTitle></CardHeader>
              <CardContent><FlowStatusCard status={data.flowStatus} /></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Errores</CardTitle></CardHeader>
            <CardContent><ErrorsList errors={data.errors} /></CardContent>
          </Card>
        </div>
      ) : null}
    </PageContainer>
  );
}
