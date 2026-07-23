import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { usePlanMutations } from '../hooks';
import { emptyPlanForm, formValuesToWriteModel, type PlanFormValues } from '../plan-form-schema';
import { planRoutes } from '../routes';
import { PlanForm, PlanBreadcrumb } from '../components';

/** CreatePlanPage — a full, clean screen for authoring a new plan (never a modal). */
export function CreatePlanPage() {
  const navigate = useNavigate();
  const { create } = usePlanMutations();

  function handleSubmit(values: PlanFormValues) {
    create.mutate(formValuesToWriteModel(values), {
      onSuccess: (plan) => navigate(planRoutes.detail(plan.id)),
    });
  }

  return (
    <PageContainer className="max-w-3xl">
      <PlanBreadcrumb trail={[{ label: 'Nuevo plan' }]} />
      <PageHeader title="Nuevo plan" description="Define la identidad, el precio y los límites del plan." />
      <PlanForm
        defaultValues={emptyPlanForm}
        submitLabel="Crear plan"
        submitting={create.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(planRoutes.list)}
      />
    </PageContainer>
  );
}
