import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/utils/errors';
import { useFeature, useFeatureMutations } from '../hooks';
import { FEATURE_CODE_PARAM, featureRoutes } from '../routes';
import { featureToFormValues, formValuesToWriteModel, type FeatureFormValues } from '../feature-form-schema';
import { FeatureForm, FeatureBreadcrumb } from '../components';

/** EditFeaturePage — hydrates the form from the feature and persists updates (code immutable). */
export function EditFeaturePage() {
  const navigate = useNavigate();
  const { [FEATURE_CODE_PARAM]: code } = useParams();
  const { data: feature, isLoading, isError, error } = useFeature(code);
  const { update } = useFeatureMutations();

  if (isLoading) {
    return (
      <PageContainer className="max-w-3xl">
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando feature…
        </div>
      </PageContainer>
    );
  }

  if (isError || !feature) {
    return (
      <PageContainer className="max-w-3xl">
        <EmptyState
          icon={AlertTriangle}
          title="Feature no encontrada"
          description={isError ? getErrorMessage(error) : 'La feature que buscas no existe.'}
          action={<Button variant="outline" size="sm" onClick={() => navigate(featureRoutes.list)}>Volver a features</Button>}
        />
      </PageContainer>
    );
  }

  function handleSubmit(values: FeatureFormValues) {
    update.mutate(
      { code: feature!.code, input: formValuesToWriteModel(values) },
      { onSuccess: () => navigate(featureRoutes.detail(feature!.code)) },
    );
  }

  return (
    <PageContainer className="max-w-3xl">
      <FeatureBreadcrumb trail={[{ label: feature.name, to: featureRoutes.detail(feature.code) }, { label: 'Editar' }]} />
      <PageHeader title={`Editar: ${feature.name}`} description="Modifica los datos de la feature y guardá." />
      <FeatureForm
        defaultValues={featureToFormValues(feature)}
        codeEditable={false}
        submitLabel="Guardar cambios"
        submitting={update.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(featureRoutes.detail(feature.code))}
      />
    </PageContainer>
  );
}
