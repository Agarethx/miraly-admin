import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatMoney } from '@/shared/catalog';
import { cn } from '@/shared/utils/cn';
import { getErrorMessage } from '@/shared/utils/errors';
import { useNotifications } from '@/shared/providers/NotificationProvider';
import { useMyEvents } from './use-planner-events';
import { useCatalog, useCheckout, useCreateFlowPayment } from './use-planner-billing';

export function PlannerPayEventPage() {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();
  const { error: toastError } = useNotifications();

  const events = useMyEvents();
  const event = (events.data ?? []).find((e) => e.id === eventId);

  const catalog = useCatalog();
  const checkout = useCheckout();
  const flow = useCreateFlowPayment();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  function priceReference(currency: string, minor: number) {
    return formatMoney({ currency, amountMinor: minor, region: null });
  }

  function choosePlan(planId: string) {
    setSelectedPlanId(planId);
    checkout.mutate(
      { eventId, planId },
      { onError: (e) => toastError(getErrorMessage(e)) },
    );
  }

  function pay() {
    if (!checkout.data) return;
    flow.mutate(checkout.data.orderId, {
      onSuccess: (session) => {
        // Same-tab redirect: the most reliable option (no popup blocker). Flow
        // returns to the shared billing-checkout-return page, not the portal.
        window.location.assign(session.redirectUrl);
      },
      onError: (e) => toastError(getErrorMessage(e)),
    });
  }

  const priced = checkout.data && selectedPlanId ? checkout.data : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => navigate('/planner')}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Mis eventos
        </button>
        <h1 className="text-xl font-semibold tracking-tight">Activar y pagar</h1>
        <p className="text-sm text-muted-foreground">
          {event ? <>Evento: <span className="text-foreground">{event.name}</span>. </> : null}
          Elegí un plan y pagá con Flow. El precio mostrado al confirmar es tu precio planner.
        </p>
      </div>

      {/* Step 1: choose a plan */}
      {catalog.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando planes…</p>
      ) : catalog.isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="No se pudieron cargar los planes"
          description={getErrorMessage(catalog.error)}
        />
      ) : (catalog.data ?? []).length === 0 ? (
        <EmptyState icon={CreditCard} title="No hay planes disponibles" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {catalog.data!.map((plan) => {
            const selected = plan.id === selectedPlanId;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => choosePlan(plan.id)}
                disabled={checkout.isPending}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  selected ? 'border-foreground bg-secondary' : 'hover:bg-secondary/50',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{plan.name}</span>
                  {selected ? <Check className="size-4" /> : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Referencia: {priceReference(plan.currency, plan.priceMinor)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: authoritative planner total + pay */}
      {selectedPlanId ? (
        <Card>
          <CardHeader>
            <CardTitle>Total a pagar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkout.isPending ? (
              <p className="text-sm text-muted-foreground">Calculando tu precio…</p>
            ) : priced ? (
              <>
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    {priceReference(priced.currency, priced.totalMinor)}
                  </p>
                  <p className="text-xs text-muted-foreground">(precio planner)</p>
                </div>
                <Button onClick={pay} disabled={flow.isPending}>
                  <CreditCard className="size-4" />
                  {flow.isPending ? 'Redirigiendo a Flow…' : 'Pagar con Flow'}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No se pudo calcular el total. Elegí el plan de nuevo.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
