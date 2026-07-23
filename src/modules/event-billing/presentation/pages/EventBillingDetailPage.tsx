import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Settings2, Ban, CheckCircle2 } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Receipt } from 'lucide-react';
import { hasPricing } from '../../domain';
import { useCatalogProducts, useEventBilling, useTransitionEventBilling } from '../hooks';
import { ACCOUNT_ID_PARAM, EVENT_ID_PARAM, customersRoutes } from '../routes';
import { formatMinor } from '../billing-format';
import { BillingBreadcrumb, CommercialStatusBadge, ResolvedEntitlementsList } from '../components';

/**
 * EventBillingDetailPage — the "Billing" view of an event (the tab intended for
 * the event detail; the admin events module is a placeholder, so it lives under
 * the customer→event route). Shows plan, addons, entitlements, estimated price and
 * commercial status, with a "Configurar Billing" button (no checkout).
 */
export function EventBillingDetailPage() {
  const navigate = useNavigate();
  const { [ACCOUNT_ID_PARAM]: accountId = '', [EVENT_ID_PARAM]: eventId = '' } = useParams();
  const { data: eb, isLoading } = useEventBilling(eventId);
  const transition = useTransitionEventBilling(eventId);

  const productIds = useMemo(
    () => (eb ? [eb.selectedPlanId, ...eb.selectedAddonIds].filter((v): v is string => Boolean(v)) : []),
    [eb],
  );
  const { data: products = [] } = useCatalogProducts(productIds);
  const labelById = new Map(products.map((p) => [p.id, p.label]));

  const configureHref = customersRoutes.configure(accountId, eventId);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando billing…
        </div>
      </PageContainer>
    );
  }

  if (!eb) {
    return (
      <PageContainer className="max-w-3xl">
        <BillingBreadcrumb trail={[{ label: 'Cuenta', to: customersRoutes.account(accountId) }, { label: 'Billing' }]} />
        <PageHeader title="Billing del evento" description="Este evento todavía no tiene configuración comercial." />
        <EmptyState
          icon={Receipt}
          title="Sin configuración"
          description="Configurá el plan y los addons de este evento (sin pagar)."
          action={<Button onClick={() => navigate(configureHref)}><Settings2 className="size-4" /> Configurar Billing</Button>}
        />
      </PageContainer>
    );
  }

  const canReady = eb.commercialStatus === 'CONFIGURING' && hasPricing(eb) && Boolean(eb.selectedPlanId);
  const canCancel = eb.commercialStatus !== 'CANCELLED' && eb.commercialStatus !== 'EXPIRED';

  return (
    <PageContainer className="max-w-3xl">
      <BillingBreadcrumb trail={[{ label: 'Cuenta', to: customersRoutes.account(accountId) }, { label: 'Billing' }]} />
      <PageHeader
        title="Billing del evento"
        description="Configuración comercial del evento (sin checkout)."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(configureHref)}>
              <Settings2 className="size-4" /> Configurar Billing
            </Button>
            {canReady ? (
              <Button
                onClick={() => transition.mutate({ id: eb.id, to: 'READY_FOR_CHECKOUT' })}
                disabled={transition.isPending}
              >
                <CheckCircle2 className="size-4" /> Listo para checkout
              </Button>
            ) : null}
            {eb.selectedPlanId ? (
              // Rich checkout flow (Billing 2.0). Decoupled path.
              <Button onClick={() => navigate(`/billing/checkout/${eb.id}`)}>
                <Receipt className="size-4" /> Checkout
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                variant="ghost"
                className="text-destructive"
                onClick={() => transition.mutate({ id: eb.id, to: 'CANCELLED' })}
                disabled={transition.isPending}
              >
                <Ban className="size-4" /> Cancelar
              </Button>
            ) : null}
          </>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Estado</span>
              <CommercialStatusBadge status={eb.commercialStatus} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Precio estimado</span>
              <span className="tabular-nums font-medium">{formatMinor(eb.currency, eb.estimatedPriceMinor)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Plan y addons</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{eb.selectedPlanId ? (labelById.get(eb.selectedPlanId) ?? '—') : 'Sin plan'}</span>
            </div>
            <div className="border-t pt-2">
              <span className="text-muted-foreground">Addons</span>
              {eb.selectedAddonIds.length === 0 ? (
                <p className="mt-1 text-muted-foreground">Ninguno.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {eb.selectedAddonIds.map((id) => <li key={id}>{labelById.get(id) ?? id.slice(0, 8)}</li>)}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Entitlements resueltos</CardTitle></CardHeader>
          <CardContent>
            <ResolvedEntitlementsList entitlements={eb.currentEntitlements ?? []} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
