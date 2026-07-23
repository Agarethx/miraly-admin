import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertTriangle, Pencil } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { getErrorMessage } from '@/shared/utils/errors';
import {
  ProductStatusBadge, ProductVisibilityBadge, ProductPrice, ProductLimits,
  ProductActionsMenu, ProductEntitlementsCard, formatDate,
} from '@/shared/catalog';
import { LIMIT_CODES, limitValue, localized } from '../../domain';
import { usePlan, usePlanMutations } from '../hooks';
import { PLAN_ID_PARAM, planRoutes } from '../routes';
import { PlanFeatures, PlanBreadcrumb } from '../components';

/** PlanDetailPage — the full read view of a plan, with the same actions as the list. */
export function PlanDetailPage() {
  const navigate = useNavigate();
  const { [PLAN_ID_PARAM]: id } = useParams();
  const { data: plan, isLoading, isError, error } = usePlan(id);
  const { duplicate, archive, restore, setVisibility } = usePlanMutations();
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando plan…
        </div>
      </PageContainer>
    );
  }

  if (isError || !plan) {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertTriangle}
          title="Plan no encontrado"
          description={isError ? getErrorMessage(error) : 'El plan que buscas no existe o fue removido.'}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate(planRoutes.list)}>
              Volver a planes
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const name = localized(plan.name) || 'Sin nombre';
  const descriptionEs = plan.description ? localized(plan.description, 'es') : '';
  const descriptionEn = plan.description?.en ?? '';

  return (
    <PageContainer className="max-w-4xl">
      <PlanBreadcrumb trail={[{ label: name }]} />
      <PageHeader
        title={name}
        description={`Código ${plan.code}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(planRoutes.edit(plan.id))}>
              <Pencil className="size-4" /> Editar
            </Button>
            <ProductActionsMenu
              product={plan}
              onView={() => navigate(planRoutes.detail(plan.id))}
              onEdit={() => navigate(planRoutes.edit(plan.id))}
              onDuplicate={() => duplicate.mutate(plan.id)}
              onToggleVisibility={() =>
                setVisibility.mutate({ id: plan.id, current: plan.visibility })
              }
              onArchive={() => setConfirmArchive(true)}
              onRestore={() => restore.mutate(plan.id)}
            />
          </>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Estado</span>
              <ProductStatusBadge status={plan.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Visibilidad</span>
              <ProductVisibilityBadge visibility={plan.visibility} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Orden</span>
              <span className="tabular-nums">{plan.sortOrder}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Versión</span>
              <span className="tabular-nums">{plan.version}</span>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              Creado {formatDate(plan.createdAt)}
              {plan.updatedAt ? ` · Actualizado ${formatDate(plan.updatedAt)}` : ''}
            </div>
          </CardContent>
        </Card>

        {descriptionEs || descriptionEn ? (
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {descriptionEs ? <p>{descriptionEs}</p> : null}
              {descriptionEn ? <p className="text-muted-foreground">{descriptionEn}</p> : null}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Precios</CardTitle>
          </CardHeader>
          <CardContent>
            {plan.prices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin precios configurados.</p>
            ) : (
              <ul className="divide-y">
                {plan.prices.map((price) => (
                  <li
                    key={`${price.currency}-${price.region ?? ''}`}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {price.currency}
                      {price.region ? ` · ${price.region}` : ''}
                    </span>
                    <ProductPrice price={price} className="font-medium" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Límites</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductLimits
              variant="stack"
              guests={limitValue(plan.limits, LIMIT_CODES.guests)}
              storageBytes={limitValue(plan.limits, LIMIT_CODES.storageBytes)}
              retentionDays={limitValue(plan.limits, LIMIT_CODES.retentionDays)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features y addons compatibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Features incluidas</p>
              <PlanFeatures variant="list" featureCodes={plan.featureCodes} />
            </div>
            <div className="border-t pt-3 text-sm text-muted-foreground">
              <span className="tabular-nums text-foreground">{plan.allowedAddonIds.length}</span>{' '}
              addons compatibles
            </div>
          </CardContent>
        </Card>

        <ProductEntitlementsCard productId={plan.id} />
      </div>

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title="Archivar plan"
        description={`“${name}” dejará de estar disponible en el catálogo. Puedes restaurarlo cuando quieras. No se elimina.`}
        confirmLabel="Archivar"
        destructive
        loading={archive.isPending}
        onConfirm={() => archive.mutate(plan.id, { onSuccess: () => setConfirmArchive(false) })}
      />
    </PageContainer>
  );
}
