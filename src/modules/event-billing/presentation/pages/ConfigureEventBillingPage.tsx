import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select } from '@/shared/components/ui/select';
import { FormField } from '@/shared/components/FormField';
import {
  useActivePlans, useCatalogProducts, useConfigureEventBilling, useEventBilling, useEventPricing,
} from '../hooks';
import { ACCOUNT_ID_PARAM, EVENT_ID_PARAM, customersRoutes } from '../routes';
import { BillingBreadcrumb, PricingSummary, ResolvedEntitlementsList } from '../components';

/**
 * ConfigureEventBillingPage — the "Configure Event Billing" screen. Select a plan,
 * add addons, see the resolved entitlements + estimated price (pure PricingEngine
 * fold), and save the configuration. No payment, no checkout.
 */
export function ConfigureEventBillingPage() {
  const navigate = useNavigate();
  const { [ACCOUNT_ID_PARAM]: accountId = '', [EVENT_ID_PARAM]: eventId = '' } = useParams();

  const { data: eb, isLoading: ebLoading } = useEventBilling(eventId);
  const { data: plans = [], isLoading: plansLoading } = useActivePlans();
  const configure = useConfigureEventBilling(eventId, accountId);

  const [planId, setPlanId] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [seeded, setSeeded] = useState(false);

  // Seed the selection from the existing configuration once it (or its absence) loads.
  if (!seeded && !ebLoading) {
    setSeeded(true);
    setPlanId(eb?.selectedPlanId ?? null);
    setAddonIds(eb?.selectedAddonIds ?? []);
  }

  const selectedPlan = plans.find((p) => p.product.id === planId) ?? null;
  const allowedAddonIds = selectedPlan?.allowedAddonIds ?? [];
  const { data: addonProducts = [] } = useCatalogProducts(allowedAddonIds);

  const currency = selectedPlan?.product.prices[0]?.currency;
  const { data: preview, isFetching: pricingFetching } = useEventPricing(planId, addonIds, currency);

  const planOptions = useMemo(
    () => [{ value: '', label: 'Sin plan' }, ...plans.map((p) => ({ value: p.product.id, label: p.product.label }))],
    [plans],
  );

  function selectPlan(id: string) {
    const next = id || null;
    setPlanId(next);
    // Drop addons no longer allowed by the new plan.
    const allowed = new Set(plans.find((p) => p.product.id === next)?.allowedAddonIds ?? []);
    setAddonIds((prev) => prev.filter((a) => allowed.has(a)));
  }

  function toggleAddon(id: string, checked: boolean) {
    setAddonIds((prev) => (checked ? [...prev, id] : prev.filter((a) => a !== id)));
  }

  function save() {
    configure.mutate(
      { selectedPlanId: planId, selectedAddonIds: addonIds },
      { onSuccess: () => navigate(customersRoutes.eventBilling(accountId, eventId)) },
    );
  }

  if (ebLoading || plansLoading) {
    return (
      <PageContainer className="max-w-4xl">
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando configurador…
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl">
      <BillingBreadcrumb
        trail={[
          { label: 'Cuenta', to: customersRoutes.account(accountId) },
          { label: 'Billing', to: customersRoutes.eventBilling(accountId, eventId) },
          { label: 'Configurar' },
        ]}
      />
      <PageHeader title="Configurar Billing" description="Elige plan y addons; guardá la configuración (sin pagar)." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Plan</CardTitle></CardHeader>
            <CardContent>
              <FormField label="Plan" htmlFor="plan">
                <Select id="plan" options={planOptions} value={planId ?? ''} onChange={(e) => selectPlan(e.target.value)} />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Addons</CardTitle></CardHeader>
            <CardContent>
              {!selectedPlan ? (
                <p className="text-sm text-muted-foreground">Elige un plan para ver sus addons compatibles.</p>
              ) : addonProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Este plan no tiene addons compatibles.</p>
              ) : (
                <div className="space-y-1">
                  {addonProducts.map((addon) => (
                    <label key={addon.id} className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted/60">
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={addonIds.includes(addon.id)}
                        onChange={(e) => toggleAddon(addon.id, e.target.checked)}
                      />
                      {addon.label}
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Precio estimado {pricingFetching ? '…' : ''}</CardTitle></CardHeader>
            <CardContent>
              {preview ? <PricingSummary pricing={preview.pricing} /> : <p className="text-sm text-muted-foreground">—</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Entitlements finales</CardTitle></CardHeader>
            <CardContent>
              <ResolvedEntitlementsList entitlements={preview?.entitlements ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={() => navigate(customersRoutes.eventBilling(accountId, eventId))} disabled={configure.isPending}>
          Cancelar
        </Button>
        <Button onClick={save} disabled={configure.isPending}>
          {configure.isPending ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </div>
    </PageContainer>
  );
}
