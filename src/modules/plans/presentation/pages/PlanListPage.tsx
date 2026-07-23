import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DataPagination, CatalogSearch, CatalogFilters } from '@/shared/catalog';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingTable } from '@/shared/components/LoadingTable';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/utils/errors';
import { AlertTriangle } from 'lucide-react';
import { localized, pageCount, type PlanSummary } from '../../domain';
import { usePlanListQuery, usePlans, usePlanMutations } from '../hooks';
import { planRoutes } from '../routes';
import {
  PlanTable, PlanCard, PlanEmptyState,
} from '../components';

/**
 * PlanListPage — the catalog table with search, filters, sort, manual reorder,
 * pagination and row actions. Orchestrates hooks + components; holds no data
 * access and no business rules of its own.
 */
export function PlanListPage() {
  const navigate = useNavigate();
  const { query, setSearch, setStatus, setVisibility, setPage, setSort, clear, isFiltered } =
    usePlanListQuery();
  const { data, isLoading, isError, error, refetch } = usePlans(query);
  const { duplicate, archive, restore, setVisibility: toggleVis, reorder } = usePlanMutations();

  const [toArchive, setToArchive] = useState<PlanSummary | null>(null);

  const reorderable = query.sortBy === 'sortOrder' && query.sortDir === 'asc' && !isFiltered;

  const busyId =
    (duplicate.isPending && (duplicate.variables as string)) ||
    (toggleVis.isPending && toggleVis.variables?.id) ||
    (archive.isPending && (archive.variables as string)) ||
    (restore.isPending && (restore.variables as string)) ||
    null;

  function swapOrder(plan: PlanSummary, neighbor: PlanSummary) {
    reorder.mutate([
      { id: plan.id, sortOrder: neighbor.sortOrder },
      { id: neighbor.id, sortOrder: plan.sortOrder },
    ]);
  }

  function handleMoveUp(plan: PlanSummary) {
    const items = data?.items ?? [];
    const index = items.findIndex((p) => p.id === plan.id);
    if (index > 0) swapOrder(plan, items[index - 1]);
  }

  function handleMoveDown(plan: PlanSummary) {
    const items = data?.items ?? [];
    const index = items.findIndex((p) => p.id === plan.id);
    if (index >= 0 && index < items.length - 1) swapOrder(plan, items[index + 1]);
  }

  const rowHandlers = {
    onView: (p: PlanSummary) => navigate(planRoutes.detail(p.id)),
    onEdit: (p: PlanSummary) => navigate(planRoutes.edit(p.id)),
    onDuplicate: (p: PlanSummary) => duplicate.mutate(p.id),
    onToggleVisibility: (p: PlanSummary) =>
      toggleVis.mutate({ id: p.id, current: p.visibility }),
    onArchive: (p: PlanSummary) => setToArchive(p),
    onRestore: (p: PlanSummary) => restore.mutate(p.id),
  };

  const items = data?.items ?? [];
  const totalPages = data ? pageCount(data) : 1;

  return (
    <PageContainer>
      <PageHeader
        title="Planes"
        description="Administrá el catálogo de planes: precios, límites, estado y visibilidad."
        actions={
          <Button onClick={() => navigate(planRoutes.new)}>
            <Plus className="size-4" /> Crear plan
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CatalogSearch value={query.search} onChange={setSearch} />
        <CatalogFilters
          status={query.status}
          visibility={query.visibility}
          onStatusChange={setStatus}
          onVisibilityChange={setVisibility}
          onClear={clear}
          canClear={isFiltered}
        />
      </div>

      {isLoading ? (
        <LoadingTable rows={8} columns={7} />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="No se pudieron cargar los planes"
          description={getErrorMessage(error)}
          action={
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <PlanEmptyState filtered={isFiltered} onClearFilters={clear} />
      ) : (
        <>
          {/* Desktop: table. Mobile: cards. */}
          <div className="hidden lg:block">
            <PlanTable
              plans={items}
              sortBy={query.sortBy}
              sortDir={query.sortDir}
              onSort={setSort}
              reorderable={reorderable}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              busyId={busyId}
              {...rowHandlers}
            />
          </div>
          <div className="grid gap-3 lg:hidden">
            {items.map((plan) => (
              <PlanCard key={plan.id} plan={plan} busy={busyId === plan.id} {...rowHandlers} />
            ))}
          </div>

          <DataPagination
            page={query.page}
            totalPages={totalPages}
            total={data?.total ?? 0}
            showing={items.length}
            unit={['plan', 'planes']}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={toArchive !== null}
        onOpenChange={(open) => !open && setToArchive(null)}
        title="Archivar plan"
        description={
          toArchive
            ? `“${localized(toArchive.name)}” dejará de estar disponible en el catálogo. Puedes restaurarlo cuando quieras. No se elimina.`
            : undefined
        }
        confirmLabel="Archivar"
        destructive
        loading={archive.isPending}
        onConfirm={() => {
          if (toArchive) archive.mutate(toArchive.id, { onSuccess: () => setToArchive(null) });
        }}
      />
    </PageContainer>
  );
}
