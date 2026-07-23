import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { OpenOrderRef } from '../../domain';
import { checkoutMoney } from '../checkout-format';

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING_PAYMENT: 'Pago pendiente',
};

/**
 * OpenOrderNotice — shown when the event billing already has an open order (only
 * one is allowed). Lets the user view it, or cancel it to edit and regenerate.
 */
export function OpenOrderNotice({
  order,
  orderHref,
  onCancel,
  cancelling,
}: {
  order: OpenOrderRef;
  orderHref: string;
  onCancel: () => void;
  cancelling: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
            <Receipt className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Ya existe una orden abierta</p>
            <p className="text-sm text-muted-foreground">
              Solo puede haber una orden abierta por evento. Cancela esta orden para editar la
              configuración y volver a generar.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
          <code className="font-mono text-xs">{order.orderNumber}</code>
          <Badge tone="accent" dot>{STATUS_LABEL[order.status] ?? order.status}</Badge>
          <span className="ml-auto tabular-nums font-medium">{checkoutMoney(order.currency, order.totalMinor)}</span>
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button variant="ghost" className="text-destructive" onClick={onCancel} disabled={cancelling}>
            {cancelling ? 'Cancelando…' : 'Cancelar y editar'}
          </Button>
          <Button asChild>
            <Link to={orderHref}>Ver orden</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
