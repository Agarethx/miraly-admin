import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertTriangle, Ban, Clock } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getErrorMessage } from '@/shared/utils/errors';
import { isOpen } from '../../domain';
import { useCancelOrder, useExpireOrder, useOrder } from '../hooks';
import { ORDER_ID_PARAM, orderRoutes } from '../routes';
import { orderMoney } from '../order-format';
import {
  OrderBreadcrumb, OrderStatusBadge, OrderItemsList, OrderSnapshotView, OrderTimeline,
} from '../components';

/** OrderDetailPage — the full, immutable view of an order. */
export function OrderDetailPage() {
  const navigate = useNavigate();
  const { [ORDER_ID_PARAM]: id } = useParams();
  const { data: order, isLoading, isError, error } = useOrder(id);
  const cancel = useCancelOrder();
  const expire = useExpireOrder();

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando orden…
        </div>
      </PageContainer>
    );
  }

  if (isError || !order) {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertTriangle}
          title="Orden no encontrada"
          description={isError ? getErrorMessage(error) : 'La orden que buscas no existe.'}
          action={<Button variant="outline" size="sm" onClick={() => navigate(orderRoutes.list)}>Volver a orders</Button>}
        />
      </PageContainer>
    );
  }

  const canCancel = isOpen(order.status);
  const canExpire = order.status === 'PENDING_PAYMENT';
  const busy = cancel.isPending || expire.isPending;

  return (
    <PageContainer className="max-w-4xl">
      <OrderBreadcrumb trail={[{ label: order.orderNumber }]} />
      <PageHeader
        title={order.orderNumber}
        description="Snapshot inmutable de la compra."
        actions={
          <>
            <OrderStatusBadge status={order.status} />
            {canExpire ? (
              <Button variant="ghost" onClick={() => expire.mutate(order.id)} disabled={busy}>
                <Clock className="size-4" /> Expirar
              </Button>
            ) : null}
            {canCancel ? (
              <Button variant="ghost" className="text-destructive" onClick={() => cancel.mutate(order.id)} disabled={busy}>
                <Ban className="size-4" /> Cancelar
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Totales</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Subtotal" value={orderMoney(order.currency, order.subtotalMinor)} />
              <Row label="Descuento" value={orderMoney(order.currency, order.discountMinor)} />
              <Row label="Impuestos" value={orderMoney(order.currency, order.taxMinor)} />
              <div className="flex items-center justify-between border-t pt-2 font-medium">
                <span>Total</span>
                <span className="tabular-nums">{orderMoney(order.currency, order.totalMinor)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent><OrderItemsList items={order.items} /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent><OrderTimeline order={order} /></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Snapshot</CardTitle></CardHeader>
          <CardContent>
            {order.snapshot ? (
              <OrderSnapshotView snapshot={order.snapshot} />
            ) : (
              <p className="text-sm text-muted-foreground">Sin snapshot.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
