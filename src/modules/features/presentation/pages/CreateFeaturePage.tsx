import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { useFeatureMutations } from '../hooks';
import { emptyFeatureForm, formValuesToWriteModel, type FeatureFormValues } from '../feature-form-schema';
import { featureRoutes } from '../routes';
import { FeatureForm, FeatureBreadcrumb } from '../components';

/** CreateFeaturePage — authoring a new feature (capability or limit). */
export function CreateFeaturePage() {
  const navigate = useNavigate();
  const { create } = useFeatureMutations();

  function handleSubmit(values: FeatureFormValues) {
    create.mutate(formValuesToWriteModel(values), {
      onSuccess: (feature) => navigate(featureRoutes.detail(feature.code)),
    });
  }

  return (
    <PageContainer className="max-w-3xl">
      <FeatureBreadcrumb trail={[{ label: 'Nueva feature' }]} />
      <PageHeader title="Nueva feature" description="Define el código, el tipo de valor y cómo se resuelve." />
      <FeatureForm
        defaultValues={emptyFeatureForm}
        codeEditable
        submitLabel="Crear feature"
        submitting={create.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(featureRoutes.list)}
      />
    </PageContainer>
  );
}
