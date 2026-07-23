import { useNavigate, useParams } from 'react-router-dom';
import { Receipt, ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useCreateOrder } from '../hooks';
import { EVENT_BILLING_ID_PARAM, orderRoutes } from '../routes';
import { OrderBreadcrumb } from '../components';

/**
 * GenerateOrderPage — "Generar Orden" target. Reads the Event Billing, freezes the
 * snapshot, and creates the Order + items in one atomic operation (ends
 * PENDING_PAYMENT). No payment.
 */
export function GenerateOrderPage() {
  const navigate = useNavigate();
  const { [EVENT_BILLING_ID_PARAM]: eventBillingId = '' } = useParams();
  const create = useCreateOrder();

  function generate() {
    create.mutate(eventBillingId, {
      onSuccess: (order) => navigate(orderRoutes.detail(order.id)),
    });
  }

  return (
    <PageContainer className="max-w-2xl">
      <OrderBreadcrumb trail={[{ label: 'Generar orden' }]} />
      <PageHeader title="Generar orden" description="Congela la compra del Event Billing en una orden inmutable." />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
              <Receipt className="size-5 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground">
              Se leerá el Event Billing, se resolverá el pricing con el Pricing Engine y se creará una orden
              con su snapshot completo (plan, addons, entitlements y totales). La orden queda en
              <span className="font-medium text-foreground"> pago pendiente</span>. No se cobra nada.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button variant="ghost" onClick={() => navigate(-1)} disabled={create.isPending}>
              <ArrowLeft className="size-4" /> Volver
            </Button>
            <Button onClick={generate} disabled={create.isPending || !eventBillingId}>
              {create.isPending ? 'Generando…' : 'Generar orden'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
