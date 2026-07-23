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
  ProductActionsMenu, ProductEntitlementsCard, formatDate, type LimitLabels,
} from '@/shared/catalog';
import { LIMIT_CODES, limitValue, localized } from '../../domain';
import { useAddon, useAddonMutations, usePlanOptions } from '../hooks';
import { ADDON_ID_PARAM, addonRoutes } from '../routes';
import { AddonBreadcrumb, AddonCompatiblePlans } from '../components';

const ADDON_LIMIT_LABELS: LimitLabels = {
  guests: 'Participantes',
  storage: 'Almacenamiento',
  retention: 'Retención',
};

/** AddonDetailPage — the full read view of an addon, with the same actions as the list. */
export function AddonDetailPage() {
  const navigate = useNavigate();
  const { [ADDON_ID_PARAM]: id } = useParams();
  const { data: addon, isLoading, isError, error } = useAddon(id);
  const { data: planOptions = [] } = usePlanOptions();
  const { duplicate, archive, restore, setVisibility } = useAddonMutations();
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando addon…
        </div>
      </PageContainer>
    );
  }

  if (isError || !addon) {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertTriangle}
          title="Addon no encontrado"
          description={isError ? getErrorMessage(error) : 'El addon que buscas no existe o fue removido.'}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate(addonRoutes.list)}>
              Volver a addons
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const name = localized(addon.name) || 'Sin nombre';
  const descriptionEs = addon.description ? localized(addon.description, 'es') : '';
  const descriptionEn = addon.description?.en ?? '';

  return (
    <PageContainer className="max-w-4xl">
      <AddonBreadcrumb trail={[{ label: name }]} />
      <PageHeader
        title={name}
        description={`Código ${addon.code}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(addonRoutes.edit(addon.id))}>
              <Pencil className="size-4" /> Editar
            </Button>
            <ProductActionsMenu
              product={addon}
              onView={() => navigate(addonRoutes.detail(addon.id))}
              onEdit={() => navigate(addonRoutes.edit(addon.id))}
              onDuplicate={() => duplicate.mutate(addon.id)}
              onToggleVisibility={() => setVisibility.mutate({ id: addon.id, current: addon.visibility })}
              onArchive={() => setConfirmArchive(true)}
              onRestore={() => restore.mutate(addon.id)}
            />
          </>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Estado</span>
              <ProductStatusBadge status={addon.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Visibilidad</span>
              <ProductVisibilityBadge visibility={addon.visibility} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Orden</span>
              <span className="tabular-nums">{addon.sortOrder}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Versión</span>
              <span className="tabular-nums">{addon.version}</span>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              Creado {formatDate(addon.createdAt)}
              {addon.updatedAt ? ` · Actualizado ${formatDate(addon.updatedAt)}` : ''}
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
            {addon.prices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin precios configurados.</p>
            ) : (
              <ul className="divide-y">
                {addon.prices.map((price) => (
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
            <CardTitle>Incrementos</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductLimits
              variant="stack"
              labels={ADDON_LIMIT_LABELS}
              increment
              guests={limitValue(addon.limits, LIMIT_CODES.guests)}
              storageBytes={limitValue(addon.limits, LIMIT_CODES.storageBytes)}
              retentionDays={limitValue(addon.limits, LIMIT_CODES.retentionDays)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planes compatibles</CardTitle>
          </CardHeader>
          <CardContent>
            <AddonCompatiblePlans planIds={addon.compatiblePlanIds} options={planOptions} variant="list" />
          </CardContent>
        </Card>

        <ProductEntitlementsCard productId={addon.id} />
      </div>

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title="Archivar addon"
        description={`“${name}” dejará de estar disponible en el catálogo. Puedes restaurarlo cuando quieras. No se elimina.`}
        confirmLabel="Archivar"
        destructive
        loading={archive.isPending}
        onConfirm={() => archive.mutate(addon.id, { onSuccess: () => setConfirmArchive(false) })}
      />
    </PageContainer>
  );
}
