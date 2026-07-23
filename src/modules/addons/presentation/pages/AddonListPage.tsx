import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingTable } from '@/shared/components/LoadingTable';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/utils/errors';
import { DataPagination, CatalogSearch, CatalogFilters } from '@/shared/catalog';
import { localized, pageCount, type AddonSummary } from '../../domain';
import { useAddonListQuery, useAddons, useAddonMutations } from '../hooks';
import { addonRoutes } from '../routes';
import { AddonTable, AddonCard, AddonEmptyState } from '../components';

/**
 * AddonListPage — the addon catalog table with search, filters, sort, manual
 * reorder, pagination and row actions. Mirrors PlanListPage; the only differences
 * are the resource hooks and the table/card components.
 */
export function AddonListPage() {
  const navigate = useNavigate();
  const { query, setSearch, setStatus, setVisibility, setPage, setSort, clear, isFiltered } =
    useAddonListQuery();
  const { data, isLoading, isError, error, refetch } = useAddons(query);
  const { duplicate, archive, restore, setVisibility: toggleVis, reorder } = useAddonMutations();

  const [toArchive, setToArchive] = useState<AddonSummary | null>(null);

  const reorderable = query.sortBy === 'sortOrder' && query.sortDir === 'asc' && !isFiltered;

  const busyId =
    (duplicate.isPending && (duplicate.variables as string)) ||
    (toggleVis.isPending && toggleVis.variables?.id) ||
    (archive.isPending && (archive.variables as string)) ||
    (restore.isPending && (restore.variables as string)) ||
    null;

  function swapOrder(addon: AddonSummary, neighbor: AddonSummary) {
    reorder.mutate([
      { id: addon.id, sortOrder: neighbor.sortOrder },
      { id: neighbor.id, sortOrder: addon.sortOrder },
    ]);
  }

  function handleMoveUp(addon: AddonSummary) {
    const items = data?.items ?? [];
    const index = items.findIndex((a) => a.id === addon.id);
    if (index > 0) swapOrder(addon, items[index - 1]);
  }

  function handleMoveDown(addon: AddonSummary) {
    const items = data?.items ?? [];
    const index = items.findIndex((a) => a.id === addon.id);
    if (index >= 0 && index < items.length - 1) swapOrder(addon, items[index + 1]);
  }

  const rowHandlers = {
    onView: (a: AddonSummary) => navigate(addonRoutes.detail(a.id)),
    onEdit: (a: AddonSummary) => navigate(addonRoutes.edit(a.id)),
    onDuplicate: (a: AddonSummary) => duplicate.mutate(a.id),
    onToggleVisibility: (a: AddonSummary) => toggleVis.mutate({ id: a.id, current: a.visibility }),
    onArchive: (a: AddonSummary) => setToArchive(a),
    onRestore: (a: AddonSummary) => restore.mutate(a.id),
  };

  const items = data?.items ?? [];
  const totalPages = data ? pageCount(data) : 1;

  return (
    <PageContainer>
      <PageHeader
        title="Addons"
        description="Administrá el catálogo de addons: precios, incrementos, estado, visibilidad y planes compatibles."
        actions={
          <Button onClick={() => navigate(addonRoutes.new)}>
            <Plus className="size-4" /> Crear addon
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
          title="No se pudieron cargar los addons"
          description={getErrorMessage(error)}
          action={
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <AddonEmptyState filtered={isFiltered} onClearFilters={clear} />
      ) : (
        <>
          <div className="hidden lg:block">
            <AddonTable
              addons={items}
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
            {items.map((addon) => (
              <AddonCard key={addon.id} addon={addon} busy={busyId === addon.id} {...rowHandlers} />
            ))}
          </div>

          <DataPagination
            page={query.page}
            totalPages={totalPages}
            total={data?.total ?? 0}
            showing={items.length}
            unit={['addon', 'addons']}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={toArchive !== null}
        onOpenChange={(open) => !open && setToArchive(null)}
        title="Archivar addon"
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
