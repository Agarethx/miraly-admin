import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/utils/errors';
import { localized } from '../../domain';
import { useAddon, useAddonMutations, usePlanOptions } from '../hooks';
import { ADDON_ID_PARAM, addonRoutes } from '../routes';
import {
  addonToFormValues, formValuesToWriteModel, type AddonFormValues,
} from '../addon-form-schema';
import { AddonForm, AddonBreadcrumb } from '../components';

/** EditAddonPage — hydrates the form from the existing addon and persists updates. */
export function EditAddonPage() {
  const navigate = useNavigate();
  const { [ADDON_ID_PARAM]: id } = useParams();
  const { data: addon, isLoading, isError, error } = useAddon(id);
  const { data: planOptions = [], isLoading: optionsLoading } = usePlanOptions();
  const { update } = useAddonMutations();

  const ready = !isLoading && !optionsLoading;

  if (!ready && !isError) {
    return (
      <PageContainer className="max-w-3xl">
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando addon…
        </div>
      </PageContainer>
    );
  }

  if (isError || !addon) {
    return (
      <PageContainer className="max-w-3xl">
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

  function handleSubmit(values: AddonFormValues) {
    update.mutate(
      { id: addon!.id, input: formValuesToWriteModel(values) },
      { onSuccess: () => navigate(addonRoutes.detail(addon!.id)) },
    );
  }

  const name = localized(addon.name) || 'Sin nombre';

  return (
    <PageContainer className="max-w-3xl">
      <AddonBreadcrumb trail={[{ label: name, to: addonRoutes.detail(addon.id) }, { label: 'Editar' }]} />
      <PageHeader title={`Editar: ${name}`} description="Modifica los datos del addon y guardá los cambios." />
      <AddonForm
        defaultValues={addonToFormValues(addon, planOptions.map((p) => p.id))}
        submitLabel="Guardar cambios"
        submitting={update.isPending}
        planOptions={planOptions}
        planOptionsLoading={optionsLoading}
        onSubmit={handleSubmit}
        onCancel={() => navigate(addonRoutes.detail(addon.id))}
      />
    </PageContainer>
  );
}
