import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/utils/errors';
import { localized } from '../../domain';
import { usePlan, usePlanMutations } from '../hooks';
import { PLAN_ID_PARAM, planRoutes } from '../routes';
import {
  formValuesToWriteModel, planToFormValues, type PlanFormValues,
} from '../plan-form-schema';
import { PlanForm, PlanBreadcrumb } from '../components';

/** EditPlanPage — hydrates the form from the existing plan and persists updates. */
export function EditPlanPage() {
  const navigate = useNavigate();
  const { [PLAN_ID_PARAM]: id } = useParams();
  const { data: plan, isLoading, isError, error } = usePlan(id);
  const { update } = usePlanMutations();

  if (isLoading) {
    return (
      <PageContainer className="max-w-3xl">
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando plan…
        </div>
      </PageContainer>
    );
  }

  if (isError || !plan) {
    return (
      <PageContainer className="max-w-3xl">
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

  function handleSubmit(values: PlanFormValues) {
    update.mutate(
      { id: plan!.id, input: formValuesToWriteModel(values) },
      { onSuccess: () => navigate(planRoutes.detail(plan!.id)) },
    );
  }

  const name = localized(plan.name) || 'Sin nombre';

  return (
    <PageContainer className="max-w-3xl">
      <PlanBreadcrumb trail={[{ label: name, to: planRoutes.detail(plan.id) }, { label: 'Editar' }]} />
      <PageHeader title={`Editar: ${name}`} description="Modifica los datos del plan y guardá los cambios." />
      <PlanForm
        defaultValues={planToFormValues(plan)}
        submitLabel="Guardar cambios"
        submitting={update.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(planRoutes.detail(plan.id))}
      />
    </PageContainer>
  );
}
