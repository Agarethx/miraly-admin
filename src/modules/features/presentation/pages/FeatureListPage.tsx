import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingTable } from '@/shared/components/LoadingTable';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/utils/errors';
import { CatalogSearch, DataPagination } from '@/shared/catalog';
import { pageCount, type Feature } from '../../domain';
import { useFeatureListQuery, useFeatures, useFeatureMutations } from '../hooks';
import { featureRoutes } from '../routes';
import { FeatureTable, FeatureCard, FeatureFilters, FeatureEmptyState } from '../components';

/** FeatureListPage — the registry table with search, filters, sort, reorder, pagination and row actions. */
export function FeatureListPage() {
  const navigate = useNavigate();
  const { query, setSearch, setStatus, setValueType, setPage, setSort, clear, isFiltered } = useFeatureListQuery();
  const { data, isLoading, isError, error, refetch } = useFeatures(query);
  const { toggle, reorder } = useFeatureMutations();

  const reorderable = query.sortBy === 'sortOrder' && query.sortDir === 'asc' && !isFiltered;
  const busyCode = (toggle.isPending && toggle.variables?.code) || null;

  function swap(feature: Feature, neighbor: Feature) {
    reorder.mutate([
      { code: feature.code, sortOrder: neighbor.sortOrder },
      { code: neighbor.code, sortOrder: feature.sortOrder },
    ]);
  }
  function handleMoveUp(feature: Feature) {
    const items = data?.items ?? [];
    const i = items.findIndex((f) => f.code === feature.code);
    if (i > 0) swap(feature, items[i - 1]);
  }
  function handleMoveDown(feature: Feature) {
    const items = data?.items ?? [];
    const i = items.findIndex((f) => f.code === feature.code);
    if (i >= 0 && i < items.length - 1) swap(feature, items[i + 1]);
  }

  const rowHandlers = {
    onView: (f: Feature) => navigate(featureRoutes.detail(f.code)),
    onEdit: (f: Feature) => navigate(featureRoutes.edit(f.code)),
    onToggle: (f: Feature) => toggle.mutate({ code: f.code, current: f.status }),
  };

  const items = data?.items ?? [];
  const totalPages = data ? pageCount(data) : 1;

  return (
    <PageContainer>
      <PageHeader
        title="Features"
        description="Registro de capacidades y límites del catálogo. Todo el negocio se resuelve por estas features, nunca por el nombre de un plan."
        actions={
          <Button onClick={() => navigate(featureRoutes.new)}>
            <Plus className="size-4" /> Crear feature
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CatalogSearch value={query.search} onChange={setSearch} placeholder="Buscar por código o nombre…" />
        <FeatureFilters
          status={query.status}
          valueType={query.valueType}
          onStatusChange={setStatus}
          onValueTypeChange={setValueType}
          onClear={clear}
          canClear={isFiltered}
        />
      </div>

      {isLoading ? (
        <LoadingTable rows={8} columns={7} />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="No se pudieron cargar las features"
          description={getErrorMessage(error)}
          action={<Button variant="outline" size="sm" onClick={() => void refetch()}>Reintentar</Button>}
        />
      ) : items.length === 0 ? (
        <FeatureEmptyState filtered={isFiltered} onClearFilters={clear} />
      ) : (
        <>
          <div className="hidden lg:block">
            <FeatureTable
              features={items}
              sortBy={query.sortBy}
              sortDir={query.sortDir}
              onSort={setSort}
              reorderable={reorderable}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              busyCode={busyCode}
              {...rowHandlers}
            />
          </div>
          <div className="grid gap-3 lg:hidden">
            {items.map((feature) => (
              <FeatureCard key={feature.code} feature={feature} busy={busyCode === feature.code} {...rowHandlers} />
            ))}
          </div>

          <DataPagination
            page={query.page}
            totalPages={totalPages}
            total={data?.total ?? 0}
            showing={items.length}
            unit={['feature', 'features']}
            onPageChange={setPage}
          />
        </>
      )}
    </PageContainer>
  );
}
