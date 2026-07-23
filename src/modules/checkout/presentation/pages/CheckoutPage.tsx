import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertTriangle, ArrowLeft, Settings2 } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getErrorMessage } from '@/shared/utils/errors';
import { useCheckout, useCheckoutPreview, usePlaceOrder, useCancelOpenOrder } from '../hooks';
import { EVENT_BILLING_ID_PARAM } from '../routes';
import {
  CheckoutAddonList, CheckoutEntitlements, CheckoutSummary, OpenOrderNotice, TermsCheckbox,
} from '../components';

/**
 * CheckoutPage — Stripe-style checkout. Two columns with lots of whitespace: the
 * left edits the purchase (addons + terms), the right shows an always-visible
 * summary. It orchestrates existing subdomains; it never charges (the Order ends
 * PENDING_PAYMENT).
 */
export function CheckoutPage() {
  const navigate = useNavigate();
  const { [EVENT_BILLING_ID_PARAM]: eventBillingId = '' } = useParams();
  const { data, isLoading, isError, error } = useCheckout(eventBillingId);

  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [seeded, setSeeded] = useState(false);

  if (!seeded && data) {
    setSeeded(true);
    setSelectedAddonIds(data.selectedAddonIds);
  }

  const currency = data?.currency ?? '';
  const preview = useCheckoutPreview(data?.planId ?? null, selectedAddonIds, currency);
  const placeOrder = usePlaceOrder();
  const cancelOpen = useCancelOpenOrder(eventBillingId);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando checkout…
        </div>
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertTriangle}
          title="No se pudo cargar el checkout"
          description={isError ? getErrorMessage(error) : 'El event billing no existe.'}
          action={<Button variant="outline" size="sm" onClick={() => navigate(-1)}>Volver</Button>}
        />
      </PageContainer>
    );
  }

  function toggleAddon(id: string, checked: boolean) {
    setSelectedAddonIds((prev) => (checked ? [...prev, id] : prev.filter((a) => a !== id)));
  }

  function generate() {
    placeOrder.mutate(
      {
        input: {
          eventId: data!.eventId,
          accountId: data!.accountId,
          eventBillingId: data!.eventBillingId,
          planId: data!.planId,
          addonIds: selectedAddonIds,
        },
        termsAccepted,
      },
      { onSuccess: (res) => navigate(`/billing/orders/${res.orderId}`) },
    );
  }

  // One open order at a time: show it (view / cancel & edit) instead of the editor.
  if (data.openOrder) {
    return (
      <PageContainer className="max-w-2xl">
        <PageHeader title="Checkout" description="Configuración comercial del evento." />
        <OpenOrderNotice
          order={data.openOrder}
          orderHref={`/billing/orders/${data.openOrder.id}`}
          cancelling={cancelOpen.isPending}
          onCancel={() => cancelOpen.mutate(data.openOrder!.id)}
        />
      </PageContainer>
    );
  }

  // No plan configured yet: send the user to configure the event billing first.
  if (!data.planId) {
    return (
      <PageContainer className="max-w-2xl">
        <PageHeader title="Checkout" description="Configuración comercial del evento." />
        <EmptyState
          icon={Settings2}
          title="Todavía no hay un plan"
          description="Configura el plan del evento antes de ir al checkout."
          action={
            <Button
              onClick={() =>
                navigate(`/billing/customers/${data.accountId}/events/${data.eventId}/configure`)
              }
            >
              Configurar Billing
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const canGenerate = Boolean(data.planId) && termsAccepted && !placeOrder.isPending;

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader title="Checkout" description="Revisa tu compra y genera la orden. No se cobra nada." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: the editable purchase */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Plan seleccionado</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <span className="font-medium">{data.planLabel ?? 'Sin plan'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate(`/billing/customers/${data.accountId}/events/${data.eventId}/configure`)
                }
              >
                Cambiar plan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Addons</CardTitle></CardHeader>
            <CardContent>
              <CheckoutAddonList
                options={data.availableAddons}
                selectedIds={selectedAddonIds}
                currency={currency}
                disabled={placeOrder.isPending}
                onToggle={toggleAddon}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Entitlements finales</CardTitle></CardHeader>
            <CardContent>
              <CheckoutEntitlements entitlements={preview.data?.entitlements ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <TermsCheckbox checked={termsAccepted} onChange={setTermsAccepted} />
              <div className="flex items-center justify-between border-t pt-4">
                <Button variant="ghost" onClick={() => navigate(-1)} disabled={placeOrder.isPending}>
                  <ArrowLeft className="size-4" /> Volver
                </Button>
                <Button onClick={generate} disabled={!canGenerate}>
                  {placeOrder.isPending ? 'Generando…' : 'Generar orden'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: the always-visible summary */}
        <div className="lg:col-span-1">
          <CheckoutSummary breakdown={preview.data?.breakdown ?? null} loading={preview.isLoading} />
        </div>
      </div>
    </PageContainer>
  );
}
