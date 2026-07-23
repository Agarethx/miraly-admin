import { Package, Receipt, Wallet, Users2 } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatCard } from '@/shared/components/StatCard';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useDashboardOverview } from './use-dashboard-overview';

/**
 * DashboardPage — the initial screen. Shows live KPIs read from the billing
 * tables (active plans, orders, payments, customers).
 */
export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardOverview();

  const value = (n: number | undefined): string =>
    isLoading ? '…' : isError ? '—' : String(n ?? 0);
  const hint = isError
    ? error instanceof Error
      ? error.message
      : 'No se pudo cargar'
    : undefined;

  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="Resumen general de la plataforma." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Planes activos" value={value(data?.activePlans)} hint={hint} icon={Package} />
        <StatCard label="Órdenes" value={value(data?.orders)} hint={hint} icon={Receipt} />
        <StatCard label="Pagos" value={value(data?.payments)} hint={hint} icon={Wallet} />
        <StatCard label="Clientes" value={value(data?.customers)} hint={hint} icon={Users2} />
      </div>

      {isError ? (
        <Card className="mt-4">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              No se pudieron leer las métricas. Revisa que hayas iniciado sesión como
              administrador y que las políticas RLS permitan la lectura del billing.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
