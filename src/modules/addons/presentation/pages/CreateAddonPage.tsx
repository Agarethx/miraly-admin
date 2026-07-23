import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { useAddonMutations, usePlanOptions } from '../hooks';
import { emptyAddonForm, formValuesToWriteModel, type AddonFormValues } from '../addon-form-schema';
import { addonRoutes } from '../routes';
import { AddonForm, AddonBreadcrumb } from '../components';

/** CreateAddonPage — a full, clean screen for authoring a new addon. */
export function CreateAddonPage() {
  const navigate = useNavigate();
  const { create } = useAddonMutations();
  const { data: planOptions = [], isLoading } = usePlanOptions();

  // Default "todos los planes" → preselect every plan once options load.
  const defaults: AddonFormValues =
    planOptions.length > 0
      ? { ...emptyAddonForm, allPlans: true, compatiblePlanIds: planOptions.map((p) => p.id) }
      : emptyAddonForm;

  function handleSubmit(values: AddonFormValues) {
    create.mutate(formValuesToWriteModel(values), {
      onSuccess: (addon) => navigate(addonRoutes.detail(addon.id)),
    });
  }

  return (
    <PageContainer className="max-w-3xl">
      <AddonBreadcrumb trail={[{ label: 'Nuevo addon' }]} />
      <PageHeader title="Nuevo addon" description="Define identidad, precio, incrementos y planes compatibles." />
      <AddonForm
        key={planOptions.length}
        defaultValues={defaults}
        submitLabel="Crear addon"
        submitting={create.isPending}
        planOptions={planOptions}
        planOptionsLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={() => navigate(addonRoutes.list)}
      />
    </PageContainer>
  );
}
